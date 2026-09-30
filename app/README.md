# Programa de predicación — MVP local

## Ejecutar

Desde esta carpeta, ejecutar `npm start` y abrir `http://localhost:5173`.

La aplicación funciona sin internet y guarda los datos en el almacenamiento local del navegador. `Respaldar` descarga un JSON restaurable. La exportación CSV puede abrirse en Excel y `Exportar PDF` abre una vista limpia lista para guardar con el diálogo de impresión de Windows. El módulo de Salidas de predicación ofrece un menú `Exportar` con las opciones PDF y PNG; ambos formatos usan la misma vista mensual de una sola hoja. El PNG conserva la tipografía sans-serif y el estilo visual del calendario, y se genera en alta resolución para compartirlo o imprimirlo.

## Alcance implementado

- Participantes con ficha editable de nombre, estado, roles, notas y disponibilidad.
- Ficha de participante con pestañas de información, notas y actividad; la pestaña de disponibilidad de capitán solo aparece cuando la persona tiene el rol `Capitan`.
- Actividad consultable por año y mes, con participación en Predicación pública y estadísticas de servicio como capitán cuando corresponde.
- Roles predeterminados protegidos: su nombre no se puede cambiar, los roles permiten editar únicamente el color y no se pueden eliminar; los roles adicionales sí son configurables.
- Estados predeterminados protegidos contra edición y eliminación; los estados adicionales sí son configurables.
- Turnos y puntos configurables, editables y eliminables cuando no tienen historial asociado.
- Disponibilidad pública por día y turno, editable desde la ficha o desde su pantalla.
- Cobertura conjunta opcional por cónyuges: al asignarlos juntos al mismo punto y horario, pueden compartir disponibilidad de horario y/o habilitación de puntos sin modificar sus registros individuales; el PDF conserva la presentación normal de nombres.
- Editor de asignaciones con filas completas para agregar o quitar participantes, iconos `+`/`−`, estado hover uniforme y motivos de no disponibilidad disponibles mediante tooltip.
- Icono discreto de nota para participantes con notas; muestra la nota completa al pasar el cursor, enfocarlo o tocarlo, sin modificar la asignación.
- Advertencia ámbar informativa cuando una persona queda asignada en días consecutivos; se muestra en las tarjetas y en el editor con el detalle mediante tooltip, sin bloquear la asignación ni cambiar el PDF.
- Disponibilidad de capitán por cada horario puntual configurado en Salidas de predicación.
- Generación mensual automática como borrador, con mínimo de dos personas y distribución por carga.
- Edición manual protegida y regeneración de espacios no protegidos.
- Detección de incompletos, participantes inactivos y solapamientos.
- Estados de revisión del programa, incluyendo edición, revisado y cambios sin revisar.
- Historial, respaldo/restauración, CSV e impresión/PDF.
- Módulo independiente de Salidas de predicación con programas mensuales, lugares de encuentro, horarios puntuales, capitanes y detección de conflictos con predicación pública, otras salidas y la disponibilidad declarada del capitán.
- Selector de capitán con opciones disponibles/no disponibles; la opción `Guardar de todos modos` solo se muestra cuando existe un conflicto.
- Estados `Sin actividad` y `Otros planes` para salidas, con razón predeterminada cuando no se captura texto adicional.
- Calendarios con referencia persistente al mes, semana y día; encabezados sticky para conservar el contexto durante el scroll.
- Panel de distribución de Predicación pública con los conteos `habilitados`, `con asignación` y `sin asignación`, filtrado por participante y orden descendente por carga.
- Panel de distribución de Salidas de predicación con conteos de salidas, asignaciones y salidas sin capitán; ambos paneles son colapsables, conservan el scroll y permiten quitar el filtro al pulsar nuevamente la misma persona.
- Los Precursores Regulares se distinguen con el color del rol en el borde izquierdo de su tarjeta y el tooltip `Precursor Regular`.
- Los buscadores con autocompletado protegen la composición de texto en Android y cierran sus resultados al pulsar fuera del control.
- El modal `Editar salida` identifica cada cita con el día, fecha, horario y hora completos.
- Tabla de participantes con encabezados y filtros sticky, además de un resumen dinámico del total, resultados mostrados y filtros activos.
- Tarjetas de calendario con indicadores visuales por estado: completada, pendiente, requiere atención, no disponible o sin actividad.
- Exportación mensual de Salidas de predicación en PDF o PNG; solo se incluyen salidas válidas, sin pendientes ni advertencias no confirmadas. La imagen PNG aplica explícitamente la tipografía del calendario al documento exportado para evitar sustituciones de fuente del navegador.

La siguiente evolución recomendada es sustituir el adaptador de `localStorage` por repositorios SQLite y migrar la interfaz a React/Tauri sin mover las reglas de generación y validación.
