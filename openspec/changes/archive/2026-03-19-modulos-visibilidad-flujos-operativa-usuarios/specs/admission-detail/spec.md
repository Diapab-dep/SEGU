## ADDED Requirements

### Requirement: Endpoint de detalle de admisión
El sistema SHALL exponer `GET /api/admissions/:id` que devuelva la información completa de una admisión incluyendo:
- Campos de `Merchandise`: id, status, rejectionReason, description, weight, dimensions, createdAt, updatedAt
- Relación `Client`: id, name, email
- Relación `PointOfSale`: id, name, type
- Relación `MerchandiseTypeCatalog`: id, code, name, requiresChecklist
- Relación `MerchandiseChecklist` (si existe): id, status, completionDate, responses (parseado), template con sus items, completedByUser.username

#### Scenario: Admisión con checklist completado
- **WHEN** se llama a `GET /api/admissions/:id` para una admisión con status `accepted` que pasó por DeprisaCheck
- **THEN** la respuesta incluye el checklist con sus respuestas y el usuario que lo completó

#### Scenario: Admisión rechazada sin checklist
- **WHEN** se llama a `GET /api/admissions/:id` para una admisión con status `rejected` rechazada en la admisión inicial
- **THEN** la respuesta incluye `rejectionReason` y `checklist: null`

#### Scenario: Admisión no encontrada
- **WHEN** se llama a `GET /api/admissions/:id` con un id inexistente
- **THEN** el sistema devuelve HTTP 404

---

### Requirement: Página de detalle de admisión en el frontend
El sistema SHALL mostrar en `/admissions/:id` una página con:
1. Información de cabecera: número de admisión, fecha, cliente, POS, tipo de mercancía
2. Indicador visual del flujo de estados: `pendiente → [requires_deprisacheck →] aceptado/rechazado`
3. Si fue rechazada: razón del rechazo destacada
4. Si tiene checklist: sección colapsable con cada pregunta y su respuesta (Sí / No / N/A / texto)
5. Botón "Volver" al panel de supervisión

La página SHALL ser de solo lectura. El supervisor NO SHALL poder modificar ningún dato desde esta vista.

#### Scenario: Ver detalle desde el panel supervisor
- **WHEN** el supervisor hace clic en una fila de la tabla de admisiones
- **THEN** el sistema navega a `/admissions/:id` y muestra el detalle completo

#### Scenario: Visualización del flujo de estados — admisión directa
- **WHEN** la admisión tiene status `accepted` sin checklist
- **THEN** el indicador muestra: `pendiente ✓ → aceptado ✓` (sin paso de DeprisaCheck)

#### Scenario: Visualización del flujo de estados — con DeprisaCheck
- **WHEN** la admisión tiene status `accepted` con checklist completado
- **THEN** el indicador muestra: `pendiente ✓ → DeprisaCheck ✓ → aceptado ✓`
