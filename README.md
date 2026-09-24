# JW Assignment Manager

Aplicación web local para organizar programas de predicación: participantes, disponibilidad, turnos, puntos y asignaciones mensuales.

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
- `construir_programa.mjs` y `crear_informe_participantes.mjs`: utilidades auxiliares de generación/importación; no son necesarias para iniciar la aplicación.

## Estado del proyecto

Es un MVP local y offline-first. Antes de desplegarlo como servicio multiusuario habría que sustituir `localStorage` por una API y una base de datos, además de incorporar autenticación, permisos y migraciones persistentes.

