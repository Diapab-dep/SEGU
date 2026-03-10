# Propuesta: Proceso de Admisión de Mercancía DeprisaDocs (V2 - Evolución Operativa)

## 1. Resumen Ejecutivo

Este documento describe la arquitectura técnica y operativa para la modernización del proceso de admisión de mercancía de DeprisaDocs. Además de unificar los flujos de **Puntos de Venta Ciudad** y **Aeropuerto (ATO)**, esta implementación introduce visibilidad de datos en tiempo real, expansión de controles de seguridad (DeprisaCheck) a todos los niveles, gestión documental adjunta y un sistema de alertas proactivas.

---

## 2. Clasificación de Mercancía Peligrosa/Especial (Selección Explícita)

**La clasificación NO se determina automáticamente por códigos IATA/IMO.** La mercancía peligrosa o especial se identifica cuando el asesor selecciona explícitamente un tipo de mercancía que tiene lista de comprobación asociada en DeprisaCheck.

### 2.1 Catálogo de Tipos de Mercancía (Migrado desde Power Apps)

DeprisaCheck (Power Apps) maneja listas de comprobación por cada tipo. Estos tipos se migran como catálogo maestro:

| Código | Tipo de Mercancía | Requiere Lista |
|--------|-------------------|----------------|
| ANIMALES_VIVOS | Animales vivos | Sí |
| RESTOS_HUMANOS | Restos humanos | Sí |
| PERECEDEROS | Perecederos | Sí |
| ARMAS | Armas | Sí |
| BATERIAS_LITIO | Baterías de litio | Sí |
| RADIACTIVOS | Radiactivos y no radiactivos | Sí |
| SUSTANCIAS_BIOLOGICAS | Sustancias biológicas | Sí |
| HIELO_SECO | Hielo seco | Sí |
| ESTANDAR | Mercancía estándar (general) | No |

Si el asesor selecciona un tipo con lista asociada → **mercancía peligrosa/especial** → flujo DeprisaCheck.  
Si selecciona estándar o tipo sin lista → **mercancía regular** → admisión directa.

### 2.2 Flujo de Decisión Actualizado

```
Cliente presenta mercancía
         ↓
Asesor selecciona TIPO DE MERCADERÍA (del catálogo)
         ↓
¿El tipo tiene lista de comprobación?
    No  → Mercancía estándar → PR. Admisión puntos de venta
    Sí  → Mercancía peligrosa/especial → Validar restricciones → DeprisaCheck
```

---

## 3. Estrategia de Migración: Power Apps → Aplicación Web

| Fase | Acción | Descripción |
|------|--------|-------------|
| **1. API Backend** | Completada | API Node.js con catálogo de tipos, validaciones y endpoints DeprisaCheck |
| **2. Migración de datos** | Pendiente | Exportar listas de comprobación de Power Apps (SharePoint/Dataverse) e importar a BD |
| **3. App Web** | Recomendada | SPA (React/Vue) que consuma la API; reemplaza la interfaz de Power Apps |
| **4. Transición** | Opcional | Power Apps puede consumir la API temporalmente; luego retirar Power Apps |

**Recomendación:** Migrar a aplicación web propia. Evita limitaciones de Power Apps, facilita integraciones (correo, SGD) y unifica la lógica en el backend.

---

## 4. Alcance y Nuevas Funcionalidades

El sistema orquesta el flujo de aceptación integrando las siguientes capacidades clave:
* **Expansión DeprisaCheck:** Implementación del sistema de validación no solo en Aeropuertos, sino extendiendo su alcance a Puntos de Venta Ciudad, Expendios y Procesos de Estación.
* **Trazabilidad Internacional (MIA):** Captura de datos específicos y volumetría de mercancías peligrosas recibidas cuyo origen sea la operación internacional (MIA).
* **Gestión Documental:** Capacidad integrada en el flujo para que los usuarios adjunten documentos soporte e imágenes fotográficas durante la admisión.
* **Observabilidad (Dashboards):** Tableros de control en tiempo real para visualizar tiempos de ciclo, cuellos de botella y desviaciones del proceso.
* **Alertas Automáticas:** Notificaciones push/email disparadas por aceptaciones sensibles o desviaciones críticas en los tiempos operativos.

---

## 5. Flujo Principal Unificado: ATO y Ciudad (Mermaid)

Se ha modificado el flujo original para reflejar la expansión de DeprisaCheck a la Ciudad, la inclusión de carga de adjuntos y el disparo de alertas automáticas.

```mermaid
flowchart TD
    start((Inicio)) --> presenta[Cliente presenta mercancía]
    presenta --> selecciona[Asesor selecciona tipo de mercancía]
    selecciona --> tipo{¿Tipo requiere DeprisaCheck?}

    tipo -->|No| prAdmision[PR. Admisión puntos de venta]

    tipo -->|Sí| origen{¿Origen Int. MIA?}
    
    origen -->|Sí| tagMIA[Etiquetar/Contabilizar Dashboard MIA]
    origen -->|No| restriccion
    tagMIA --> restriccion

    restriccion{¿Restricción cliente/base/manejo?}
    restriccion -->|Sí| rechazo[Rechazar admisión]
    
    restriccion -->|No| deprisaCheck[Ingreso a DeprisaCheck - Ciudad/ATO/Expendio]
    deprisaCheck --> diligenciar[Diligenciar Lista Comprobación]
    
    diligenciar --> tiempo{¿Desviación tiempo/Sensible?}
    tiempo -->|Sí| alerta[Generar Alerta Automática]
    tiempo -->|No| aceptaA
    alerta --> aceptaA

    aceptaA{¿Acepta Mercancía?}
    aceptaA -->|No| notificarRechazo[Registrar email + Enviar lista rechazo]
    
    aceptaA -->|Sí| adjuntos[Usuario adjunta documentos/imágenes]
    adjuntos --> archivar[Archivar documentación]

    prAdmision --> flujoFinal
    archivar --> flujoFinal

    subgraph flujoFinal["Flujo final común y Observabilidad"]
        imprimir[Imprimir guía]
        manifiesto[Generar manifiesto]
        entregar[Entregar a operaciones]
        logMetrics[(Registro en Tablero de Control)]
        
        imprimir --> manifiesto --> entregar --> logMetrics
    end

    logMetrics --> finOk((Fin: Aceptado))
    rechazo --> finRechazo((Fin: Rechazado))
    notificarRechazo --> finRechazo