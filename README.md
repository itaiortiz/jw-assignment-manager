# JW Assignment Manager

Aplicación web local para organizar programas de predicación pública y salidas de predicación: participantes, disponibilidad, turnos, puntos, lugares de encuentro y asignaciones mensuales.

## Ejecutar en desarrollo

```powershell
cd app
npm start
```

Después abre <http://localhost:5173>.

La aplicación no requiere base de datos ni conexión a internet. Los datos se guardan en `localStorage` del navegador. Para mover datos entre navegadores utiliza la opción de respaldo/restauración dentro de la aplicación.

## Estructura

- `app/`: aplicación ejecutable, interfaz, reglas de negocio y servidor estático local.
- `ARCHITECTURE_AI.md`: contexto técnico detallado para futuras personas o agentes de IA.
- `plan_mvp_programa_predicacion.md`: documento histórico de alcance y decisiones del MVP.
- `plan_salidas_predicacion.md`: alcance y decisiones del módulo de Salidas de predicación.
- `construir_programa.mjs` y `crear_informe_participantes.mjs`: utilidades auxiliares de generación/importación; no son necesarias para iniciar la aplicación.

## Estado del proyecto

Es un MVP local y offline-first. Actualmente incluye los módulos de Predicación pública y Salidas de predicación, ambos con calendarios mensuales y persistencia local. Las listas de programas muestran directamente sus tablas, con el encabezado contextual de cada módulo y fechas de creación/modificación para distinguir programas del mismo mes. Las vistas de Puntos y Turnos identifican el módulo de Predicación pública, mientras Roles y Estados identifican Configuración; los menús de Predicación pública y Salidas de predicación se muestran desplegados al iniciar. La ficha de participante permite guardar notas, consultar actividad por año y mes y, únicamente para participantes con rol Capitán, declarar disponibilidad específica para los horarios de Salidas de predicación. La disponibilidad y la habilitación de puntos se pueden compartir opcionalmente entre cónyuges cuando ambos se asignan juntos. El editor de asignaciones permite agregar o quitar participantes al pulsar toda su fila y muestra las notas existentes con un icono discreto y una tarjeta emergente. Al asignar un capitán se validan su disponibilidad declarada y las colisiones con Predicación pública u otras salidas; la confirmación para guardar de todos modos solo aparece cuando existe un conflicto. Ambos calendarios tienen búsqueda de participantes/capitanes y paneles de distribución colapsables, ordenados por carga; tocar nuevamente el mismo registro activo quita el filtro. El panel público resume participantes habilitados, con asignación y sin asignación; el panel de salidas resume salidas, asignaciones y capitanes sin asignar. Los Precursores Regulares se identifican con el color de su rol en el borde izquierdo de la tarjeta y el tooltip `Precursor Regular`. Los roles y estados predeterminados están protegidos: los nombres no se pueden modificar, los roles permiten editar únicamente el color y ninguno puede eliminarse; los elementos adicionales sí son configurables. Salidas de predicación permite marcar excepciones de disponibilidad con confirmación explícita; las tarjetas con datos faltantes se muestran en naranja y las que tienen conflictos en rojo. El menú Exportar permite descargar el calendario mensual en PDF o PNG; ambos formatos omiten las salidas pendientes y las advertencias no confirmadas. Antes de desplegarlo como servicio multiusuario habría que sustituir `localStorage` por una API y una base de datos, además de incorporar autenticación, permisos y migraciones persistentes.
