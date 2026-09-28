# Plan de implementación - Salidas de predicación

## Objetivo

Incorporar un módulo independiente de **Salidas de predicación** que comparta participantes y detección de conflictos con **Predicación pública**, sin mezclar sus programas, lugares, horarios ni reglas de asignación.

## Alcance confirmado

- Menú:
  - Inicio.
  - Predicación pública: Programas, Puntos y Turnos.
  - Salidas de predicación: Programas, Lugares de encuentro y Horarios.
  - Participantes.
  - Configuración: Roles y Estados.
- Inicio no crea programas; por ahora conserva su función de resumen.
- Las salidas usan citas puntuales configurables, no rangos obligatorios:
  - Lunes a sábado a las 09:00.
  - Domingo a las 09:30.
  - Martes y jueves también a las 18:00.
- Cada cita programada puede tener un capitán; el selector valida la disponibilidad declarada para ese horario, las colisiones con Predicación pública y otras salidas. Si se selecciona uno incompatible, debe confirmarse explícitamente con `Guardar de todos modos`.
- Solamente los participantes activos con el rol existente `Capitan` son candidatos iniciales.
- Una semana de visita omite las citas normales y queda identificada en el programa.
- Una colisión se puede guardar como excepción explícita.
- La exportación del nuevo módulo ofrece PDF y PNG; Excel y CSV quedan fuera del alcance de este módulo.

## Estado de implementación

El prototipo actual ya incluye la navegación separada, catálogos de lugares y horarios, programas mensuales, generación de citas, edición de capitán/lugar/estado, validación de disponibilidad declarada de capitanes, conflictos con Predicación pública y otras salidas, y exportación PDF/PNG. El botón `Exportar` ofrece ambos formatos usando la misma vista mensual de una sola hoja; el PNG se descarga como imagen de alta resolución. También incorpora los estados `Sin actividad` y `Otros planes`, tarjetas con indicadores por estado y referencias persistentes de mes, semana y día durante el scroll. Los listados de programas muestran directamente sus tablas, con un encabezado contextual y fechas de creación y modificación en Salidas de predicación para distinguir programas del mismo mes. El menú de Salidas de predicación inicia desplegado junto al de Predicación pública. Los datos faltantes se muestran como pendientes en naranja; los conflictos se agrupan en Advertencias rojas. Cuando no hay capitán, el buscador recibe foco y muestra las opciones; la confirmación `Guardar de todos modos` solo aparece al seleccionar un capitán con conflicto. PDF/PNG omiten las salidas pendientes o con advertencias no confirmadas.

La ficha de participantes comparte los capitanes disponibles con el módulo de salidas y conserva sus encabezados y filtros durante el scroll. Para participantes con rol `Capitan`, la pestaña de disponibilidad permite marcar cada horario puntual de salida. La pestaña de notas guarda texto libre y la de actividad resume la participación pública y, cuando aplica, el servicio como capitán con filtros por año y mes.

El programa de Predicación pública también cuenta con un panel de distribución que resume participantes habilitados, con asignación y sin asignación, y permite filtrar por participante.

El programa de Salidas de predicación cuenta con un panel de distribución de capitanes colapsable. El botón aparece después del buscador, usa la etiqueta `Ver Distribución`, el tooltip `Ver distribución de capitanes` y cambia a `Ocultar distribución` cuando está abierto. El panel muestra salidas, asignadas y sin capitán; los capitanes se ordenan por carga descendente, tocar un capitán filtra el calendario y tocar nuevamente el mismo capitán quita el filtro. El scroll se conserva al seleccionar un capitán o al actualizar el calendario.

El buscador de capitanes permite seleccionar varios filtros mediante chips. Sus resultados se cierran al pulsar fuera del control y el manejo de composición evita que Chrome en Android duplique las letras escritas.

Los roles y estados predeterminados de Configuración están protegidos: los nombres de roles y estados no se pueden modificar ni eliminar; el color de un rol predeterminado sí puede editarse. Los roles y estados adicionales conservan sus acciones de edición y eliminación.

Quedan como evolución posterior la captura inicial de datos históricos de agosto de 2026 y las pruebas automatizadas de regresión.

## Principios de diseño

1. `Programas` de predicación pública y de salidas son colecciones distintas.
2. `Puntos` públicos y `Lugares de encuentro` son catálogos distintos.
3. Las reglas de horario de salidas representan una fecha y hora puntual.
4. Las asignaciones guardan su fecha y hora concreta para conservar el historial aunque se editen las reglas generales.
5. La detección de conflictos usa una vista común de compromisos, pero cada módulo conserva su propia interfaz y reglas.
6. Las excepciones nunca convierten un conflicto en disponibilidad: lo registran y lo hacen visible.
7. La disponibilidad declarada de un capitán es independiente de la disponibilidad de Predicación pública; ambas se validan al asignar una salida.

## Modelo de datos

```text
outreach
  places[]
    id, name, address, notes, active

  rules[]
    id, name, weekday, time, active

  programs[]
    id, month, status, createdAt, updatedAt,
    blocks[], visitWeeks[], assignments[]

  blocks[]
    id, startDate, endDate, placeId

  visitWeeks[]
    id, startDate, endDate, label, notes

  assignments[]
    id, date, time, placeId, captainId,
    origin, protected, exceptionNote, notes
```

## Reglas de conflicto

Un capitán está ocupado si, en la misma fecha:

- Tiene otra cita de salida a la misma hora.
- Tiene una asignación pública cuyo turno contiene la hora de la cita.

Una persona asignada a predicación pública está ocupada si, en la misma fecha, tiene una cita de salida cuya hora cae dentro del turno público.

El sistema mostrará el origen del conflicto: módulo, programa, lugar o punto, y horario relacionado. Una excepción consciente conserva ese detalle para revisión, pero requiere confirmación explícita y permanece visualmente pendiente.

## Fases

### Fase A - Terra High: arquitectura crítica

- Guardar este plan en el proyecto.
- Reorganizar la navegación para reflejar los dos módulos.
- Incorporar el esquema de datos de salidas y las reglas iniciales de horario.
- Crear el módulo aislado de Salidas de predicación.
- Implementar catálogo base de lugares y horarios.
- Implementar el servicio común de conflictos en ambas direcciones.
- Proteger la compatibilidad de predicación pública con pruebas manuales de navegación.

### Fase B - Terra Medium: flujo operativo

- Constructor de programas mensuales.
- Bloques de fechas y lugares.
- Semanas de visita.
- Generación de citas.
- Selector de capitanes, disponibilidad declarada y guardado explícito con excepción.
- Vista mensual, publicación e historial.

### Fase C - Terra Medium: entrega

- Exportación PDF y PNG para salidas, con la misma hoja mensual y filtrado de citas publicables.
- Revisión visual e impresión.
- Captura inicial de agosto de 2026 con conciliación manual de nombres.
- Pruebas de regresión de ambos módulos.

## Criterios de aceptación

- La predicación pública conserva su funcionamiento y sus programas existentes.
- La barra lateral separa claramente ambos módulos.
- Lugares y horarios de salidas se administran sin afectar Puntos ni Turnos públicos.
- Los horarios predeterminados se crean una sola vez y son editables.
- Los participantes con rol `Capitan` pueden identificarse sin duplicar personas.
- Una asignación pública y una salida incompatible se señalan en ambas direcciones.
- El usuario puede guardar una excepción de forma deliberada; la tarjeta queda roja como advertencia y el PDF deja vacío el capitán de esa cita.
- Una semana de visita no genera citas normales.
- El programa de salidas permite exportar PDF o PNG al finalizar la fase C, sin alterar la exportación de Predicación pública.
