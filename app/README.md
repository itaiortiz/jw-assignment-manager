# Programa de predicación — aplicación local

## Ejecutar

Desde esta carpeta, ejecutar `npm install` una vez, luego `npm start` y abrir `http://localhost:5173`. La dependencia del editor de Inicio queda instalada localmente; después la aplicación puede funcionar sin internet.

La aplicación funciona sin internet y guarda los datos en el almacenamiento local del navegador; no envía los respaldos ni la información importada a Internet. Una instalación nueva inicia completamente vacía: no crea participantes, roles, estados, turnos, puntos, horarios ni programas. `Respaldar` descarga un JSON restaurable; la restauración es la única forma de cargar datos de manera masiva. La exportación CSV puede abrirse en Excel. En Predicación pública, `Exportar PDF` permite elegir el formato original, una versión compacta optimizada para lectura o una imagen PNG por semana; esta última está pensada para compartir por WhatsApp. El módulo de Salidas de predicación ofrece un menú `Exportar` con las opciones PDF y PNG; ambos formatos usan la misma vista mensual de una sola hoja. El PNG conserva la tipografía sans-serif y el estilo visual del calendario, y se genera en alta resolución para compartirlo o imprimirlo.

## Alcance implementado

- Inicio personalizable: arrastrar módulos sobre una cuadrícula de cuatro columnas, redimensionarlos desde el borde a medio ancho o ancho completo, guardar/cancelar/restablecer el diseño y conservar la altura automática del contenido. En pantallas estrechas los módulos se apilan sin recortar actividades.

  El acomodo predeterminado sitúa indicadores y Agenda a la izquierda; Programas en curso y Últimos cambios a la derecha; Configuración debajo de la Agenda. Atención requerida solo aparece cuando hay avisos. Los diseños ya guardados no se sobrescriben: usa `Personalizar Inicio → Restablecer diseño → Guardar diseño` para aplicar el nuevo predeterminado. La preferencia se conserva en este navegador por espacio de trabajo y no viaja con el respaldo de datos.

- Participantes con ficha editable de nombre, estado, roles, notas y disponibilidad.
- Ficha de participante con pestañas de información, notas y actividad; la pestaña de disponibilidad de capitán solo aparece cuando la persona tiene el rol `Capitan`.
- Actividad consultable por año y mes, con participación en Predicación pública y estadísticas de servicio como capitán cuando corresponde.
- Roles configurables; una instalación nueva no incluye roles.
- Estados configurables; una instalación nueva no incluye estados.
- Turnos y puntos configurables, editables y eliminables cuando no tienen historial asociado; cada turno tiene un color configurable que se usa en sus etiquetas de exportación.
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
- Historial con operador declarado, respaldos versionados con detección de revisiones antiguas, CSV e impresión/PDF.
- Módulo independiente de Salidas de predicación con programas mensuales, lugares de encuentro, horarios puntuales, capitanes y detección de conflictos con predicación pública, otras salidas y la disponibilidad declarada del capitán.
- Selector de capitán con opciones disponibles/no disponibles; la opción `Guardar de todos modos` solo se muestra cuando existe un conflicto.
- Estados `Sin actividad` y `Otros planes` para salidas, con razón predeterminada cuando no se captura texto adicional.
- Calendarios con referencia persistente al mes, semana y día; encabezados sticky para conservar el contexto durante el scroll.
- Panel de distribución de Predicación pública con los conteos `habilitados`, `con asignación` y `sin asignación`, filtrado por participante y orden descendente por carga.
- Panel de distribución con búsqueda inmediata y filtros locales `Todos`, `Regulares` y `sin asignación`; los filtros se combinan con el texto buscado sin modificar el programa.
- Panel de distribución de Salidas de predicación con conteos de salidas, asignaciones y salidas sin capitán; ambos paneles son colapsables, conservan el scroll y permiten quitar el filtro al pulsar nuevamente la misma persona.
- Los Precursores Regulares se distinguen con el color del rol en el borde izquierdo de su tarjeta y el tooltip `Precursor Regular`.
- Los buscadores con autocompletado protegen la composición de texto en Android y cierran sus resultados al pulsar fuera del control.
- El modal `Editar salida` identifica cada cita con el día, fecha, horario y hora completos.
- Tabla de participantes con encabezados y filtros sticky, además de un resumen dinámico del total, resultados mostrados y filtros activos.
- Tarjetas de calendario con indicadores visuales por estado: completada, pendiente, requiere atención, no disponible o sin actividad.
- Exportación mensual de Salidas de predicación en PDF o PNG; solo se incluyen salidas válidas, sin pendientes ni advertencias no confirmadas. La imagen PNG aplica explícitamente la tipografía del calendario al documento exportado para evitar sustituciones de fuente del navegador.
- Exportación de Predicación pública con selector de PDF original, PDF compacto y PNG semanal. El formato compacto usa filas alternas, ubicación con pin monocromático, una cuadrícula de nombres de dos columnas, el color configurado para el turno y una semana por página; los PNG incluyen encabezado principal en la primera imagen y pie paginado en todas.

Al abrir la aplicación sin datos activos se muestra una pantalla para importar un espacio de trabajo o crear uno nuevo, con las acciones `Importar` y `Crear nuevo`. El cierre del espacio exige confirmar el respaldo si hay cambios desde la última exportación. La siguiente evolución recomendada es sustituir el adaptador de `localStorage` por repositorios SQLite y migrar la interfaz a React/Tauri sin mover las reglas de generación y validación.

## Pruebas

Desde la raíz del repositorio, ejecuta `node --test app/dashboard.test.mjs app/dashboard-layout.test.mjs` para comprobar los cálculos de Inicio y la normalización/migración de preferencias de distribución.
