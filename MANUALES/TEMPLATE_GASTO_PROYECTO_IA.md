# Template — Calculo de Gasto y ROI: Proyecto con IA vs. Alternativa Tradicional
> Plantilla reutilizable para cualquier proyecto desarrollado con asistencia de IA.
> Reemplaza los campos entre `[corchetes]` con los datos reales del proyecto.

**Proyecto:** [Nombre del proyecto]
**Fecha:** [Mes Año] | **Elaborado por:** [Rol] | **Dirigido a:** [Audiencia]

---

## 1. Resumen Ejecutivo

Este informe presenta una comparacion objetiva entre el costo y tiempo real invertido en el desarrollo de **[nombre del proyecto]** mediante asistencia de IA, versus el costo equivalente bajo la metodologia alternativa de referencia ([nombre del proveedor / metodologia comparada]).

> **Conclusion principal:** El proyecto fue ejecutado en **[N semanas]** con un costo total de **$[X] [moneda]** (herramienta IA + tiempo interno valorado a tarifa de nomina), logrando un ahorro de **$[Y] [moneda]** respecto a la opcion de referencia. Esto representa un **ROI del [Z]%** en escenario conservador, o **[W]%** considerando unicamente el costo marginal de la herramienta.

---

## 2. Alcance del Proyecto

Describe brevemente los componentes entregados y funcionando. Usa subsecciones si hay modulos diferenciados.

### 2.1 [Modulo / Componente principal]
- [Caracteristica 1]
- [Caracteristica 2]
- [Caracteristica 3]

### 2.2 [Modulo secundario]
- [Caracteristica 1]
- [Caracteristica 2]

### 2.3 [Infraestructura / Despliegue]
- [Elemento 1: ej. Dockerfile, servidor, HTTPS]
- [Elemento 2: ej. CI/CD, pipeline]

### 2.4 [Seguridad / Cumplimiento — si aplica]
- [Control 1]
- [Control 2]

### 2.5 Documentacion entregada
| Documento | Descripcion |
|-----------|-------------|
| [doc1.md] | [descripcion] |
| [doc2.md] | [descripcion] |

---

## 3. Inversion Real — Modelo IA (Ejecutado)

### 3.1 Tiempo invertido por el ejecutor

| Actividad | Horas reales |
|-----------|-------------|
| [Fase 1: ej. desarrollo principal] | [N] h |
| [Fase 2: ej. ajustes y pruebas] | [N] h |
| **Total horas** | **[Total] horas** |

> **Nota de contexto:** [Describe el perfil del ejecutor. Ej: "El ejecutor no tiene perfil tecnico de desarrollador. El 100% del codigo fue generado mediante interaccion con IA."]

### 3.2 Costo del tiempo interno (valoracion a tarifa de nomina)

| Concepto | Calculo | Valor |
|----------|---------|-------|
| Salario mensual [Rol] | — | $[X] [moneda] |
| Horas laborales mensuales | [dias] dias × [h/dia] h | [total] horas |
| **Tarifa hora [Rol]** | $[salario] / [horas] | **$[tarifa] [moneda]/hora** |
| Horas dedicadas al proyecto | [N] horas | **$[subtotal] [moneda]** |

> **Nota para decision makers:** La tarifa por hora del ejecutor ($[tarifa]) es comparable a la de [rol equivalente externo] ([tarifa externa]/hora), pero con la ventaja de que invirtio solo **[N] horas** frente a las **[N externo] horas** que requeriria el equipo externo — una eficiencia **[X]x mayor**.

### 3.3 Costo total del proyecto — dos escenarios

| Concepto | Escenario Conservador | Escenario Marginal |
|----------|-----------------------|--------------------|
| Tiempo interno ([N]h × $[tarifa]) | **$[X] [moneda]** | — *(costo fijo de nomina ya comprometido)* |
| Suscripcion herramienta IA | $[Y] [moneda] | **$[Y] [moneda]** |
| API / modelo LLM en produccion | ~$[Z] [moneda]/mes | ~$[Z] [moneda]/mes |
| [Infraestructura: ej. servidor cloud] | $[0 o valor] | $[0 o valor] |
| **TOTAL** | **$[total conservador] [moneda]** | **$[total marginal] [moneda]** |

> El **escenario conservador** incluye el costo de oportunidad del tiempo interno valorado a tarifa de nomina. El **escenario marginal** refleja el gasto adicional real para la empresa, dado que el salario es un costo fijo.

### 3.4 Duracion total del proyecto

| Fase | Duracion |
|------|----------|
| [Fase 1] | [N semana(s)] |
| [Fase 2] | [N semana(s)] |
| [Fase 3] | [N semana(s)] |
| **Total calendario** | **~[N] semanas** |

---

## 4. Costo Equivalente — Metodologia Alternativa de Referencia ([Proveedor/Metodologia])

Basado en [descripcion del referente: ej. propuesta comercial, tarifa de mercado, etc.], el proyecto hubiera requerido el siguiente equipo minimo:

### 4.1 Equipo requerido y horas estimadas

| Rol | Tarifa/hora ([moneda]) | Horas estimadas | Subtotal ([moneda]) |
|-----|------------------------|-----------------|----------------------|
| [Rol 1] | $[tarifa1] | [h1] h | $[sub1] |
| [Rol 2] | $[tarifa2] | [h2] h | $[sub2] |
| [Rol 3] | $[tarifa3] | [h3] h | $[sub3] |
| [Rol 4] | $[tarifa4] | [h4] h | $[sub4] |
| **TOTAL HORAS** | | **[total_h] h** | |
| **TOTAL COSTO REFERENCIA** | | | **$[total_costo] [moneda]** |

> Nota: [Aclaraciones sobre el estimado: supuestos, exclusiones de IVA, etc.]

### 4.2 Tiempo estimado bajo metodologia alternativa

| Fase | Duracion estimada |
|------|------------------|
| [Fase previa: ej. onboarding] | [N] semanas |
| [Fase 1] | [N] semanas |
| [Fase 2] | [N] semanas |
| [Fase cierre: ej. UAT, docs] | [N] semanas |
| **Total calendario** | **~[N] semanas** |

---

## 5. Comparacion Directa

| Parametro | Modelo IA (Ejecutado) | Alternativa de Referencia (Estimado) | Diferencia |
|-----------|----------------------|--------------------------------------|------------|
| **Duracion total** | [N] semanas | [N] semanas | **-[delta] semanas** |
| **Costo total (conservador)** | $[X] [moneda] | $[Y] [moneda] | **-$[ahorro] [moneda]** |
| **Costo total (marginal)** | $[X'] [moneda] | $[Y] [moneda] | **-$[ahorro'] [moneda]** |
| **Horas equipo tecnico** | [N] h ([M] persona(s)) | [N'] h ([M'] personas) | **[ratio]x mas eficiente** |
| **Codigo en produccion** | Dia [D] | Semana [S]+ | **[delta] semanas antes** |
| **[Otro parametro relevante]** | [valor IA] | [valor referencia] | [diferencia] |
| **Documentacion tecnica** | [N] documentos | Costo adicional | **Incluido** |
| **Dependencia de proveedor** | Ninguna | [tipo de contrato/dependencia] | **Independencia total** |

---

## 6. Analisis de Retorno sobre la Inversion (ROI)

### Escenario A — Costo Conservador (incluye tiempo interno valorado)

```
Inversion real  = Tiempo interno + Herramienta IA [+ otros gastos]
                = $[X1] + $[X2] [+ $X3] = $[total_inv_A] [moneda]

Ahorro          = Costo referencia - Inversion real
                = $[costo_ref] - $[total_inv_A] = $[ahorro_A] [moneda]

ROI             = ($[ahorro_A] / $[total_inv_A]) × 100 = [ROI_A]%
```

> Por cada $1 [moneda] de costo total (incluyendo el tiempo interno), se generaron **$[ratio_A] [moneda] de valor**.

### Escenario B — Costo Marginal (gasto adicional real para la empresa)

```
Inversion marginal = Solo herramienta IA [+ costos variables]
                   = $[total_inv_B] [moneda]
(El salario del ejecutor es costo fijo independiente del proyecto)

Ahorro             = $[costo_ref] - $[total_inv_B] = $[ahorro_B] [moneda]

ROI                = ($[ahorro_B] / $[total_inv_B]) × 100 = [ROI_B]%
```

> Por cada $1 [moneda] de gasto adicional, se generaron **$[ratio_B] [moneda] de valor equivalente**.

### Comparacion de tarifa-hora vs. alternativa

| Rol externo | Tarifa/hora | vs. Ejecutor interno ($[tarifa_interna]/h) |
|-------------|-------------|---------------------------------------------|
| [Rol 1] | $[t1] | [diferencia %] |
| [Rol 2] | $[t2] | [diferencia %] |
| **Horas totales** | **[h_ext] h (equipo externo)** | **[h_int] h (ejecutor + IA)** |
| **Costo total** | **$[costo_ext]** | **$[costo_int]** |

> **Conclusion:** Aunque la tarifa-hora del ejecutor es comparable a la de un especialista externo Senior, la IA multiplico su productividad por **[ratio]x**, convirtiendo [N] horas en el equivalente de [N'] horas de equipo especializado.

### Valor adicional no cuantificado
- [Beneficio 1: ej. velocidad de iteracion — cambios en produccion en minutos]
- [Beneficio 2: ej. conocimiento del negocio embebido]
- [Beneficio 3: ej. independencia tecnologica]
- [Beneficio 4: ej. aprendizaje organizacional para futuros proyectos]

---

## 7. Capacidades Habilitadas con IA que la Alternativa No Contempla

[Describe aqui funcionalidades o capacidades que la alternativa de referencia no incluye o cotiza aparte, y su costo adicional estimado.]

- **[Capacidad 1]** a $[tarifa]/hora para [descripcion]
- **[Capacidad 2]** a $[tarifa]/hora para [descripcion]

Estos roles suman **$[total] [moneda]/hora** si se requiriera soporte recurrente.

---

## 8. Recomendaciones

1. **[Recomendacion 1]:** [Descripcion. Ej: Escalar el modelo a otros proyectos similares.]

2. **Presupuesto IA sugerido:** [Describe el costo mensual de mantener la herramienta IA vs. el costo de la alternativa.]

3. **Riesgos a gestionar:**
   - [Riesgo 1: ej. mantenimiento cuando cambia la fuente de datos]
   - [Riesgo 2: ej. limites de la API o plan de la herramienta]
   - [Riesgo 3: ej. certificado SSL, seguridad, etc.]

---

## 9. Evolucion Post-Lanzamiento (si aplica)

Posterior al despliegue inicial, el sistema siguio evolucionando. Documenta aqui iteraciones adicionales.

### 9.1 Mejoras agregadas ([periodo])

| Mejora | Descripcion | Fecha |
|--------|-------------|-------|
| [Mejora 1] | [Descripcion] | [fecha] |
| [Mejora 2] | [Descripcion] | [fecha] |

### 9.2 Resumen de sesiones con IA

| Sesion | Fecha | Duracion | Commits | Actividad principal |
|--------|-------|----------|---------|---------------------|
| 1 | [fecha] | [N] min | [N] | [descripcion] |
| 2 | [fecha] | [N] h | [N] | [descripcion] |
| **Total** | | **[N]h [M]min** | **[N]** | |

### 9.3 Velocidad de iteracion demostrada

- [Ejemplo 1: ej. Una funcionalidad completa entregada en ~X minutos de sesion activa]
- [Ejemplo 2: ej. Un bug fix de produccion resuelto en menos de Y minutos]

---

## 10. Conclusion

El proyecto **[nombre]** demuestra que es posible [descripcion del logro] en **[N semanas] y con una inversion minima**, utilizando IA como asistente de desarrollo.

**El ahorro generado en este unico proyecto ($[ahorro] [moneda]) equivale a:**
- [Equivalencia 1: ej. Financiar X anos de suscripcion Claude Code Pro]
- [Equivalencia 2: ej. N% del costo anual del proveedor alternativo]
- [Equivalencia 3: ej. N dias de nomina completa del equipo externo]

Esto posiciona la metodologia IA-asistida como **[descripcion estrategica]** para [nombre de la organizacion].

---

*Documento elaborado con asistencia de [herramienta IA] | [Mes Año]*
*Tarifas de referencia: [Fuente — nombre y fecha de la propuesta o referencia de mercado]*

---

## Apendice — Guia de Uso de esta Plantilla

### Datos minimos necesarios para completar el template

| Campo | Donde obtenerlo |
|-------|----------------|
| Horas reales invertidas | Registro de sesiones o historial de la herramienta IA (ej. commits, log de sesiones) |
| Salario del ejecutor | RRHH o nomina interna |
| Horas laborales mensuales | Politica interna (ej. 22 dias × 8h = 176h) |
| Costo herramienta IA | Factura o plan de suscripcion |
| Costo API en produccion | Dashboard de uso del proveedor (ej. Anthropic, OpenAI) |
| Tarifas alternativa externa | Propuesta comercial, lista de precios publica, o benchmark de mercado |
| Horas estimadas equipo externo | Estimacion basada en complejidad por rol (arquitecto, desarrollador, QA, PM, etc.) |

### Formula ROI

```
ROI (%) = ((Ahorro / Inversion) × 100)
Ahorro   = Costo alternativa - Inversion real
```

### Escenarios recomendados a presentar siempre

1. **Conservador:** incluye el tiempo interno valorado a tarifa de nomina (para comparacion honesta).
2. **Marginal:** solo el gasto adicional real (para decision de presupuesto incremental).

### Tips para presentar a gerencia

- Expresa el ahorro en terminos concretos: "equivale a X meses de suscripcion" o "X% del costo anual del proveedor".
- Destaca la velocidad: fecha de codigo en produccion vs. fecha estimada con metodologia tradicional.
- Menciona el riesgo de dependencia de proveedor como beneficio de la metodologia interna.
- No omitas riesgos reales: la credibilidad del informe depende de su honestidad.
