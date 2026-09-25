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
│  ├─ outreach-pdf.js         # Exportación PDF de salidas
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

- `participants`: personas, estado, etiquetas, frecuencia y relaciones.
- `types`: etiquetas configurables.
- `states`: estados de participante y si permiten programación.
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

El módulo de salidas conserva sus programas separados de los programas de predicación pública, pero comparte participantes y reglas de conflicto. Una cita de salida contiene `date`, `time`, `placeId` y `captainId`, además de `origin`, `protected`, `exceptionNote` y `notes`.

Los estados `Sin actividad` y `Otros planes` se almacenan como citas sin capitán ni lugar. Si no se captura una razón, se usa por defecto el nombre del estado. En la interfaz se muestran como tarjetas grises con el texto `Sin Actividad / Otros` en el resumen.

`outreach.js` administra lugares, reglas de horario, programas mensuales, generación de citas, edición de asignaciones y conflictos en ambas direcciones. `outreach-pdf.js` genera la versión imprimible del programa de salidas.

## 7. Reglas de negocio importantes

### Generación

`blankAssignmentsForMonth(month)` crea una asignación vacía por combinación de fecha, turno activo habilitado ese día y punto activo. Los programas nuevos pueden crearse en blanco o copiar la distribución de otro programa. La autoasignación se ejecuta después desde el botón de la pantalla del programa.

### Resolución y advertencias

`assignmentIsResolved` determina si una tarjeta cumple el mínimo requerido. `warningReasonsForAssignment` detecta sobrecupo, participante inactivo, falta de habilitación para un punto, falta de disponibilidad y solapamientos.

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

Las vistas se generan con `shell(html)`, que reemplaza `#app`, conecta botones con `data-action` y ejecuta mejoras posteriores. Las vistas principales son `dashboard`, `participants`, `types`, `states`, `turns`, `resources`, `availability`, `programs`, `openProgram` y las vistas de configuración/calendario de `outreach.js`.

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
- Los calendarios conservan visible el contexto de mes, semana y día durante el scroll mediante encabezados sticky.
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
6. Probar ambas vistas (`Calendario` y `Agenda`), el calendario de salidas, la tabla de participantes y ambos temas antes de entregar cambios.
