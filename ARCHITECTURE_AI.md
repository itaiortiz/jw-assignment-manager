# Contexto técnico para futuras IA

## 1. Propósito

JW Assignment Manager es una aplicación web local para preparar programas mensuales de predicación. Permite administrar participantes, disponibilidad, turnos, puntos de predicación y asignaciones. La interfaz está en español y el nombre visible de la congregación se configura desde la aplicación.

El producto actual es un MVP de uso local. No existe backend, autenticación ni sincronización entre usuarios: cada navegador conserva su propia copia de datos.

## 2. Cómo ejecutar la aplicación

```powershell
cd app
npm start
```

`app/server.mjs` inicia un servidor HTTP estático en el puerto `5173`. Sirve `index.html`, JavaScript y CSS desde la carpeta `app`. No hay bundler ni paso de compilación.

## 3. Mapa del repositorio

```text
/
├─ app/
│  ├─ index.html              # Shell HTML, navegación, modal y carga de módulos
│  ├─ main.js                 # Estado, dominio, renderizado, eventos y persistencia
│  ├─ server.mjs              # Servidor estático local
│  ├─ package.json            # npm start
│  ├─ styles.css              # Tokens y estilos globales
│  ├─ sidebar.css             # Navegación lateral
│  ├─ program-table.css       # Calendario, agenda, tarjetas y estados de programa
│  ├─ participant-table.css   # Tabla y ficha de participantes
│  ├─ outreach.js             # Módulo de Salidas de predicación
│  ├─ outreach.css            # Calendario y controles visuales de salidas
│  ├─ outreach-pdf.js         # Exportación PDF y PNG de salidas
│  ├─ frequency.css           # Controles de frecuencia/recurrencia
│  ├─ overrides.css           # Ajustes visuales transversales
│  ├─ tag-overrides.css       # Ajustes para etiquetas y colores
│  ├─ report-import.js        # Datos estáticos usados por la importación inicial
│  └─ pdf-export.js           # Exportación/maquetación para impresión PDF
├─ construir_programa.mjs     # Utilidad auxiliar fuera del runtime de la app
├─ crear_informe_participantes.mjs
├─ plan_mvp_programa_predicacion.md
├─ plan_salidas_predicacion.md
└─ ARCHITECTURE_AI.md
```

`node_modules/`, `output/`, `outputs/` y `tmp/` son artefactos locales y están excluidos por `.gitignore`.

## 4. Arquitectura actual

La aplicación es un frontend vanilla basado en módulos ES. `main.js` concentra varias responsabilidades:

1. Inicialización y normalización del estado.
2. Reglas de dominio para disponibilidad, generación y validación.
3. Renderizado de vistas mediante plantillas HTML.
4. Delegación de acciones mediante atributos `data-action`.
5. Persistencia en `localStorage`.
6. Mejoras de comportamiento y accesibilidad aplicadas después del renderizado.

No introducir un framework parcialmente. Si se migra a React, Vue o Tauri, primero conviene separar el dominio de `main.js` en módulos puros y conservar pruebas sobre las reglas antes de cambiar la capa visual.

## 5. Estado y persistencia

La clave principal es `predicacion.mvp.v1`. `main.js` carga el objeto global `db` desde esa clave o usa `seed` cuando no existe.

Colecciones principales:

- `participants`: personas, estado, roles configurables, notas, frecuencia y relaciones.
- `types`: roles asignables, con color, `isSystemDefault` y `systemKey` opcional.
- `states`: estados de participante, si permiten programación y `isSystemDefault`.
- `turns`: nombre, horario, días habilitados y estado activo.
- `resources`: puntos, ubicación, mínimo/máximo y estado activo.
- `availabilities`: relación participante-turno-día.
- `participantResources`: puntos habilitados por participante.
- `programs`: programas mensuales y sus asignaciones.
- `outreach`: configuración y programas independientes de Salidas de predicación:
  - `places`: lugares de encuentro.
  - `rules`: horarios puntuales por día de la semana.
  - `programs`: programas mensuales con bloques, semanas de visita y citas.
- `logs`: historial de acciones.
- `settings`: configuración general, incluido el nombre de congregación.

Cada escritura debe pasar por `save(action, detail)`. Esta función normaliza configuraciones, sincroniza estados de programa, registra el historial y serializa `db` en `localStorage`.

Preferir cambios compatibles y normalizaciones idempotentes. Los datos existentes pueden venir de versiones anteriores y no deben romperse por agregar campos nuevos.

Los roles y estados existentes se normalizan como predeterminados del sistema cuando todavía no tienen la marca `isSystemDefault`. Los roles predeterminados no se pueden renombrar ni eliminar, pero su color sí puede editarse; los estados predeterminados no se pueden editar ni eliminar. Los registros nuevos se crean con `isSystemDefault: false`. La protección debe existir tanto en la interfaz como en los manejadores de acciones para evitar que una acción invocada manualmente la omita. El rol `Regular` recibe `systemKey: 'precursor-regular'` para identificarlo sin depender únicamente del texto visible.

## 6. Modelo de programa y asignación

Un programa tiene, entre otros, `id`, `month`, `status`, `createdAt`, `updatedAt` y `assignments`.

Una asignación contiene:

- `id`
- `date`
- `turnId`
- `resourceId`
- `participantIds`
- `origin`
- `protected`
- `unassignedAccepted`

La identidad estructural de una asignación es `date + turnId + resourceId`, no su `id`. Esta regla es importante para comparar un programa existente con la configuración actual.

### Salidas de predicación

El módulo de salidas conserva sus programas separados de los programas de predicación pública, pero comparte participantes y reglas de conflicto. Una cita de salida contiene `date`, `time`, `placeId` y `captainId`, además de `origin`, `protected`, `exception`, `exceptionNote` y `notes`.

Los estados `Sin actividad` y `Otros planes` se almacenan como citas sin capitán ni lugar. Si no se captura una razón, se usa por defecto el nombre del estado. En la interfaz se muestran como tarjetas grises con el texto `Sin Actividad / Otros` en el resumen.

Un capitán con conflicto de disponibilidad puede asignarse únicamente mediante una confirmación explícita como excepción consciente. La cita conserva el capitán seleccionado y se identifica con una tarjeta roja; el tooltip nombra al capitán y la asignación que genera el conflicto. La exportación PDF deja vacío el nombre del capitán para que la excepción no se publique como disponibilidad confirmada.

`outreach.js` administra lugares, reglas de horario, programas mensuales, generación de citas, edición de asignaciones y conflictos en ambas direcciones. `main.js` integra las reglas de disponibilidad de capitanes y la presentación del modal de edición con la ficha de participantes. `outreach-pdf.js` genera la versión imprimible PDF y la imagen PNG del programa de salidas a partir de la misma hoja mensual.

El botón `Exportar` del programa de salidas ofrece PDF y PNG. El PDF conserva la vista de impresión; el PNG captura únicamente la hoja mensual, con resolución ampliada para compartirla como imagen. Ambos formatos filtran las citas pendientes o con advertencias no confirmadas y muestran las marcadas explícitamente como excepción o sin actividad según las reglas del módulo. Este flujo no modifica `pdf-export.js`, que pertenece a Predicación pública.

La ficha de participante integra tres áreas operativas: información y disponibilidad de Predicación pública, notas libres y actividad. La actividad permite filtrar por año y mes, muestra estadísticas de asignaciones públicas y, cuando la persona tiene el rol `Capitan`, estadísticas de sus salidas. La pestaña de disponibilidad de capitán solo se agrega a participantes con ese rol y guarda la disponibilidad para cada horario puntual de `outreach.rules`.

Al seleccionar un capitán para una salida, la validación combina la disponibilidad declarada para el día y horario con las colisiones contra Predicación pública y otras Salidas de predicación. Si no hay conflicto, no se muestra una advertencia ni una opción adicional; si existe conflicto, se muestra la advertencia y la confirmación `Guardar de todos modos`. Cuando una salida no tiene capitán, el buscador recibe foco y despliega las opciones automáticamente.

El programa de Predicación pública incluye un panel de distribución con los conteos de participantes habilitados, con asignación y sin asignación. El texto `sin asignación` es intencional: identifica a personas habilitadas que no aparecen en las asignaciones del periodo.

El panel público se ordena por carga descendente. Pulsar una persona filtra el calendario; pulsar nuevamente la misma persona activa quita el filtro. Las filas de participantes con el rol `Regular` conservan el color configurado para ese rol en un borde izquierdo y muestran el tooltip `Precursor Regular`, además de una descripción accesible. El color del borde identifica el rol y los colores de la barra inferior y del indicador circular continúan representando la carga.

El panel de distribución de Salidas de predicación se puede mostrar u ocultar desde el control situado después del buscador. El botón usa `Ver Distribución` con tooltip `Ver distribución de capitanes` y, al abrirse, `Ocultar distribución`. Sus contadores permiten filtrar por todas las salidas, asignadas o sin capitán; sus capitanes se ordenan por carga descendente y pulsar nuevamente el capitán activo quita el filtro. La posición de scroll se conserva al seleccionar y al volver a renderizar el calendario.

Las vistas de listado de ambos módulos presentan la tabla directamente bajo la cabecera contextual de la sección, sin un subtítulo redundante. Puntos y Turnos muestran el contexto `Predicación pública`; Lugares de encuentro y Horarios muestran `Salidas de predicación`; Roles y Estados muestran `Configuración`. Los menús de Predicación pública y Salidas de predicación comienzan desplegados. La tabla de programas de salidas incluye `Creado`, `Modificado` y `Salidas` para distinguir rápidamente programas del mismo mes.

## 7. Reglas de negocio importantes

### Generación

`blankAssignmentsForMonth(month)` crea una asignación vacía por combinación de fecha, turno activo habilitado ese día y punto activo. Los programas nuevos pueden crearse en blanco o copiar la distribución de otro programa. La autoasignación se ejecuta después desde el botón de la pantalla del programa.

### Resolución y advertencias

`assignmentIsResolved` determina si una tarjeta cumple el mínimo requerido. `warningReasonsForAssignment` detecta sobrecupo, participante inactivo, falta de habilitación para un punto, falta de disponibilidad y solapamientos. En Salidas de predicación, los datos faltantes se clasifican como `Pendientes` (naranja) y los conflictos o configuraciones inválidas como `Advertencias` (rojo).

La disponibilidad y los puntos elegibles se registran individualmente. Una pareja puede habilitar, por separado, la cobertura conjunta de horarios y de puntos: solo al estar ambos cónyuges en la misma asignación, uno puede cubrir la disponibilidad o habilitación que el otro no tenga declarada. La cobertura no modifica los registros individuales, exige que ambos estén activos y sin conflictos, y nunca habilita un punto para el que ninguno de los dos esté registrado. La interfaz lo indica como información; las exportaciones conservan únicamente los nombres asignados.

El editor de una asignación muestra un icono de nota solo cuando el participante tiene notas en su ficha. Al pasar el cursor, enfocarlo o pulsarlo se abre una tarjeta con la nota completa; la tarjeta se mantiene dentro de los límites del modal y se posiciona al lado con espacio disponible. Las filas de asignados y candidatos son interactivas en toda su superficie: pulsarlas quita o agrega a la persona, mientras los iconos de nota y `+`/`−` conservan su propia acción. Las personas no disponibles se distinguen por color y el motivo se conserva en el tooltip, sin texto adicional dentro de la fila.

Para una salida, la disponibilidad del capitán se evalúa en este orden conceptual: el participante debe tener el rol `Capitan`, debe haber declarado disponibilidad para el horario puntual y no debe tener una colisión con Predicación pública ni con otra salida. Una excepción guardada conserva el conflicto para revisión; no convierte al capitán en disponible.

`classifyProgramAssignments` divide las tarjetas en:

- `all`: todas las asignaciones.
- `complete`: cumplen el mínimo y no tienen advertencias.
- `pending`: necesitan participantes y no están aceptadas como “Sin asignar”.
- `warning`: tienen problemas de configuración o de participantes.

Las tarjetas cuyo turno o punto ya no existe, está inactivo o no está habilitado ese día usan el estado `No disponible` y se contabilizan en `Advertencias`.

### Cambios de configuración

`configurationChangesForProgram(program)` compara las asignaciones existentes contra `blankAssignmentsForMonth(program.month)`:

- `unavailable`: asignaciones históricas que ya no coinciden con la configuración activa.
- `missing`: combinaciones actualmente disponibles que todavía no existen en el programa.

El botón `Actualizar programa` aparece únicamente si existe alguno de esos cambios. La confirmación elimina las asignaciones no disponibles y agrega las nuevas como tarjetas vacías. No debe ejecutarse automáticamente porque la actualización puede cambiar asignaciones históricas.

En la lista de programas, el chip azul `Nuevas asignaciones disponibles` indica `missing`; el chip ámbar indica asignaciones no disponibles. Si aparecen ambos tipos, se muestra `Configuración desactualizada`.

## 8. Renderizado y eventos

Las vistas se generan con `shell(html)`, que reemplaza `#app`, conecta botones con `data-action` y ejecuta mejoras posteriores. Las vistas principales son `dashboard`, `participants`, `types`, `states`, `turns`, `resources`, `availability`, `programs`, `openProgram` y las vistas de configuración/calendario de `outreach.js`. `participantDialog` compone las pestañas de información, disponibilidad de capitán, notas y actividad según el rol de la persona.

Las tarjetas de programa tienen dos presentaciones: `calendarProgramMarkup` y `agendaProgramMarkup`. Ambas deben mantener los mismos estados, textos accesibles y atributos `data-program-id`/`data-assignment-id`.

Hay envolturas posteriores alrededor de algunas funciones (`openProgram`, `shell`, `enhanceAssignmentEditors`, `assignmentDialog`). Antes de reemplazar una función, revisar la cadena de envolturas para no perder comportamiento agregado en iteraciones anteriores.

Para acciones nuevas:

1. Renderiza el control con `data-action` o un atributo `data-*` específico.
2. Conecta el evento en el punto de renderizado o en el delegado global correspondiente.
3. Actualiza el modelo `db`.
4. Llama a `save(...)`.
5. Vuelve a renderizar la vista afectada.

## 9. UX y accesibilidad

- Mantener las vistas en español.
- No usar color como único indicador: combinar color con texto (`Completo`, `Pendiente`, `Advertencia`, `No disponible`).
- Conservar `title`, `aria-label`, `aria-pressed` y estados de foco para controles interactivos.
- En modo oscuro, validar contraste de texto, bordes y estados hover.
- Las tarjetas de asignación deben conservar su affordance de edición y no mostrar botones contradictorios con el estado.
- El editor de asignaciones debe conservar el clic de fila completa para agregar o quitar participantes, con el mismo estado hover y foco en ambas columnas. Los iconos de nota no deben disparar ese cambio.
- Las notas de participante dentro del editor se muestran mediante una tarjeta emergente completa, con soporte para cursor, teclado y toque; su posición no debe salirse ni quedar recortada por el modal.
- La ficha de participante debe ocultar la disponibilidad de capitán para personas sin ese rol y mostrar las estadísticas de capitán solo cuando correspondan.
- La confirmación para guardar una asignación incompatible solo debe existir cuando hay conflicto; una asignación compatible no necesita un mensaje de disponibilidad positivo.
- Los buscadores con autocompletado deben manejar `compositionstart`/`compositionend` y una cola con `requestAnimationFrame` para no duplicar caracteres en Chrome para Android; los listeners deben asignarse de forma idempotente.
- Al cerrar una lista de autocompletado se debe detectar un `pointerdown` fuera de su contenedor.
- Las insignias de protección y los indicadores de Precursor Regular deben conservar tooltip y descripción accesible; el color del rol no debe confundirse con los colores de carga.
- Los calendarios conservan visible el contexto de mes, semana y día durante el scroll mediante encabezados sticky.
- El modal de edición de salidas muestra la fecha completa y el horario asociado (`día, fecha - nombre del horario - hora`).
- La tabla de participantes mantiene sticky la fila de resultados, los nombres de columnas y los filtros. El resumen informa el total, los resultados mostrados y los filtros activos.
- Las acciones destructivas o que cambian estructura requieren confirmación explícita.

## 10. Límites conocidos y próximos pasos

- `main.js` es grande y mezcla dominio, vistas y eventos; modularizarlo es la principal mejora técnica.
- `localStorage` no ofrece concurrencia, respaldo automático ni control de acceso.
- No hay pruebas automatizadas; antes de una refactorización importante conviene crear pruebas para generación, disponibilidad, validación y comparación estructural.
- El servidor local es deliberadamente mínimo y no debe considerarse una capa de seguridad.
- Los scripts raíz son utilidades históricas y no forman parte del arranque de la aplicación.

## 11. Reglas para futuras modificaciones

1. No borrar datos históricos al cambiar la configuración; marcar diferencias como `No disponible` y ofrecer una acción explícita.
2. No regenerar ni reasignar participantes automáticamente cuando el usuario solo cambia la configuración.
3. Mantener la identidad estructural `date|turnId|resourceId` al comparar programas.
4. Registrar cambios persistentes mediante `save`.
5. Ejecutar `node --check app/main.js`, `node --check app/outreach.js` y `node --check app/outreach-pdf.js` después de modificar esos archivos.
6. Probar ambas vistas (`Calendario` y `Agenda`), el calendario de salidas, la tabla y ficha de participantes, los filtros de actividad, la disponibilidad de capitanes y ambos temas antes de entregar cambios.
