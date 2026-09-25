# Programa de predicación — MVP local

## Ejecutar

Desde esta carpeta, ejecutar `npm start` y abrir `http://localhost:5173`.

La aplicación funciona sin internet y guarda los datos en el almacenamiento local del navegador. `Respaldar` descarga un JSON restaurable. La exportación CSV puede abrirse en Excel y `Exportar PDF` abre una vista limpia lista para guardar con el diálogo de impresión de Windows. El módulo de Salidas de predicación ofrece un menú `Exportar` con las opciones PDF y PNG; ambos formatos usan la misma vista mensual de una sola hoja.

## Alcance implementado

- Participantes con ficha editable de nombre, estado, tipo y disponibilidad.
- Catálogo de tipos de participante completamente configurable.
- Turnos y puntos configurables, editables y eliminables cuando no tienen historial asociado.
- Disponibilidad por día y turno, editable desde la ficha o desde su pantalla.
- Generación mensual automática como borrador, con mínimo de dos personas y distribución por carga.
- Edición manual protegida y regeneración de espacios no protegidos.
- Detección de incompletos, participantes inactivos y solapamientos.
- Estados de borrador/publicado.
- Historial, respaldo/restauración, CSV e impresión/PDF.
- Módulo independiente de Salidas de predicación con programas mensuales, lugares de encuentro, horarios puntuales, capitanes y detección de conflictos con predicación pública.
- Estados `Sin actividad` y `Otros planes` para salidas, con razón predeterminada cuando no se captura texto adicional.
- Calendarios con referencia persistente al mes, semana y día; encabezados sticky para conservar el contexto durante el scroll.
- El modal `Editar salida` identifica cada cita con el día, fecha, horario y hora completos.
- Tabla de participantes con encabezados y filtros sticky, además de un resumen dinámico del total, resultados mostrados y filtros activos.
- Tarjetas de calendario con indicadores visuales por estado: completada, pendiente, requiere atención, no disponible o sin actividad.
- Exportación mensual de Salidas de predicación en PDF o PNG; solo se incluyen salidas válidas, sin pendientes ni advertencias no confirmadas.

La siguiente evolución recomendada es sustituir el adaptador de `localStorage` por repositorios SQLite y migrar la interfaz a React/Tauri sin mover las reglas de generación y validación.
