# Plan definitivo para construir el MVP

## Aplicación local para crear programas de predicación

## Contexto del proyecto

Construir una aplicación local para Windows que permita crear programas de predicación pública con participantes, turnos y recursos.

La aplicación funcionará inicialmente sin internet y será utilizada por un solo usuario. Sin embargo, debe diseñarse con una arquitectura preparada para convertirse posteriormente en un servicio web multiusuario.

No se requiere importar el archivo Excel o las imágenes actuales. Los datos se registrarán desde cero.

## Objetivo principal

El usuario debe poder:

1. Registrar participantes.
2. Registrar recursos o lugares.
3. Definir turnos configurables.
4. Registrar la disponibilidad de cada participante.
5. Crear automáticamente un programa mensual inicial.
6. Modificar manualmente las asignaciones.
7. Detectar conflictos.
8. Guardar y revisar el programa.
9. Consultar un historial básico.
10. Exportar el programa a Excel y PDF.

## Decisiones funcionales confirmadas

### Plataforma

- Inicialmente Windows.
- Funcionamiento local.
- Sin necesidad de conexión a internet.
- Preparado para migrar posteriormente a una aplicación web.

### Participantes

Cada participante tendrá:

- Nombre.
- Tipo: persona, familia o grupo.
- Estado: activo o inactivo.
- Observaciones.
- Disponibilidad.

No se eliminarán físicamente los participantes; se podrán desactivar.

### Recursos iniciales

- Carrito 1 — O Primera y Concordia.
- Carrito 2 — Plaza Metroplex.
- Exhibidor 1 — Plaza Venecia.

La aplicación debe permitir agregar, editar o desactivar recursos.

### Turnos

Los turnos se definirán en una tabla configurable.

Ejemplo:

| Turno | Hora inicial | Hora final |
|---|---:|---:|
| Mañana | 08:00 | 11:00 |
| Tarde | 17:00 | 19:00 |

El nombre “Tarde” no tendrá un significado fijo dentro del código. El usuario definirá qué rango horario representa.

Cada turno deberá contener:

- Identificador.
- Nombre.
- Hora inicial.
- Hora final.
- Estado activo/inactivo.
- Días permitidos, opcionalmente.
- Observaciones.

### Disponibilidad

La disponibilidad se definirá relacionando:

```text
Participante + Día de la semana + Turno
```

Ejemplo:

| Participante | Día | Turno |
|---|---|---|
| Américo Salas C. | Martes | Mañana |
| Américo Salas C. | Jueves | Mañana |

Regla:

> Si una combinación de participante, día y turno no está registrada, el participante se considera no disponible.

No es necesario comenzar con rangos de disponibilidad complejos.

Debe existir una opción sencilla para bloquear una fecha específica, por ejemplo:

```text
Américo Salas C.
Disponible normalmente: martes y jueves por la mañana
Excepción: no disponible el martes 15
```

### Número de participantes

Cada asignación debe tener como mínimo 2 participantes.

El sistema debe marcar como incompleta cualquier asignación que tenga menos de 2 personas.

No se establecerá un máximo inicialmente.

### Conflicto principal

La misma persona no puede estar asignada a dos turnos que se solapen.

Ejemplo:

- Lunes 17:00–19:00 y lunes 17:00–19:00: conflicto.
- Lunes 17:00–19:00 y lunes 18:00–20:00: conflicto.
- Lunes 17:00–19:00 y lunes 20:00–22:00: permitido.

La validación debe funcionar aunque los turnos pertenezcan a recursos diferentes.

### Roles

No se implementarán roles de participación en la primera versión. El programa trabajará con:

```text
Fecha + Turno + Recurso + Participantes
```

## Generación automática mensual

El sistema debe permitir seleccionar un mes y generar automáticamente un borrador inicial.

Flujo:

1. El usuario selecciona el mes.
2. El sistema genera las fechas.
3. El sistema crea los turnos configurados.
4. El sistema crea los espacios para cada recurso.
5. Busca participantes disponibles.
6. Excluye participantes inactivos.
7. Excluye personas con conflictos de horario.
8. Asigna participantes hasta alcanzar el mínimo de 2.
9. Distribuye razonablemente la carga.
10. Marca los espacios que no pudo completar.
11. Presenta el resultado como borrador.

La generación automática no debe publicar inmediatamente el programa.

Debe existir un botón similar a:

```text
Generar borrador mensual
```

Después el usuario podrá:

- Revisar.
- Cambiar participantes.
- Quitar participantes.
- Agregar participantes.
- Bloquear asignaciones.
- Regenerar solo los espacios pendientes.
- Publicar el programa.
- Exportarlo.

## Asignaciones automáticas y manuales

Cada asignación debe tener un origen:

- Automática.
- Manual.

Si el usuario modifica una asignación automática, debe convertirse en manual y quedar protegida.

Cuando se vuelva a ejecutar la generación automática, no se deben modificar las asignaciones manuales protegidas.

El sistema debe poder regenerar únicamente:

- Turnos vacíos.
- Turnos incompletos.
- Asignaciones automáticas desbloqueadas.

## Pantallas del MVP

### 1. Inicio

- Programas existentes.
- Estado.
- Fecha de última modificación.
- Abrir.
- Duplicar.
- Exportar.
- Respaldar.

### 2. Participantes

- Lista.
- Buscar.
- Crear.
- Editar.
- Desactivar.
- Tipo.
- Disponibilidad.
- Número de asignaciones.

### 3. Disponibilidad

Vista sencilla para marcar:

- Día de la semana.
- Turno.
- Disponible o no disponible.

También debe permitir bloquear una fecha específica.

### 4. Turnos

- Crear turno.
- Editar turno.
- Activar o desactivar.
- Definir hora inicial.
- Definir hora final.
- Definir días permitidos.

### 5. Recursos

- Crear recurso.
- Editar recurso.
- Activar o desactivar.
- Definir ubicación.
- Configurar turnos permitidos.

### 6. Constructor del programa

Vista principal:

| Fecha | Turno | Carrito 1 | Carrito 2 | Exhibidor 1 |
|---|---|---|---|---|
| Lunes 31 | Tarde | — | Diana, Nallely | — |
| Martes 1 | Mañana | Juliana, Aracely | Rubén, Juany | — |

Funciones:

- Generar borrador mensual.
- Editar participantes.
- Agregar y quitar personas.
- Copiar una semana.
- Duplicar un programa.
- Bloquear asignaciones.
- Ver conflictos.
- Ver turnos incompletos.
- Filtrar por fecha, recurso o participante.

### 7. Conflictos

Mostrar:

- Persona involucrada.
- Asignaciones relacionadas.
- Horarios.
- Recursos.
- Explicación.
- Estado del conflicto.

Tipos iniciales:

- Persona asignada a dos turnos simultáneos.
- Menos de 2 participantes.
- Participante inactivo.
- Turno sin participantes.
- Recurso inactivo.

### 8. Historial básico

Registrar:

- Creación de programa.
- Modificación de programa.
- Cambio de estado.
- Creación, edición y eliminación de asignaciones.
- Cambios en turnos.
- Cambios en participantes.
- Creación de respaldos.
- Restauración de respaldos.

Cada registro tendrá:

- Fecha y hora.
- Acción.
- Elemento afectado.
- Usuario local.
- Descripción breve.

### 9. Exportación

Prioridad:

1. Excel.
2. PDF.

Excel debe incluir:

- Programa completo.
- Fechas.
- Turnos.
- Recursos.
- Participantes.
- Observaciones.
- Estado de validación.

PDF debe incluir:

- Vista semanal o mensual.
- Encabezados legibles.
- Recursos.
- Turnos.
- Participantes.
- Formato apto para imprimir y compartir.

## Estados del programa

- Borrador.
- En revisión.
- Publicado.
- Cerrado.
- Archivado.

La publicación debe mostrar advertencias si existen conflictos o turnos incompletos.

## Arquitectura técnica propuesta

Construir una aplicación web empaquetada como aplicación de escritorio para Windows.

```text
Interfaz React
      ↓
Casos de uso
      ↓
Reglas de negocio
      ↓
Repositorios
      ↓
SQLite local
```

Stack recomendado:

- React.
- TypeScript.
- Vite.
- Tauri 2 para el ejecutable de Windows.
- SQLite para persistencia local.
- Módulo independiente para exportación Excel.
- Módulo independiente para exportación PDF.

La interfaz no debe consultar directamente SQLite.

La lógica debe estar separada para que posteriormente pueda exponerse mediante una API web y utilizar PostgreSQL.

## Modelo de datos inicial

Crear como mínimo las siguientes entidades:

- `Participant`
- `Family`
- `Group`
- `Resource`
- `Turn`
- `Program`
- `ProgramDate`
- `Assignment`
- `Availability`
- `AvailabilityException`
- `Conflict`
- `ActivityLog`
- `Backup`

Campos comunes recomendados:

- `id`
- `createdAt`
- `updatedAt`
- `active`
- `version`

Las asignaciones deben incluir:

- Programa.
- Fecha.
- Turno.
- Recurso.
- Participante.
- Origen: automática o manual.
- Protegida: sí/no.
- Observaciones.

## Respaldos

Incluir:

- Respaldo manual.
- Respaldo automático opcional.
- Restauración.
- Fecha del respaldo.
- Versión de la aplicación.
- Validación básica de integridad.

## Fases de construcción

### Fase 1: base técnica

- Crear proyecto.
- Configurar React y TypeScript.
- Configurar Tauri.
- Crear SQLite.
- Crear migraciones.
- Crear estructura modular.
- Crear respaldo básico.

### Fase 2: catálogos

- Participantes.
- Familias y grupos.
- Recursos.
- Turnos.
- Disponibilidad.

### Fase 3: constructor manual

- Crear programa.
- Crear periodos.
- Generar fechas.
- Crear asignaciones.
- Editar asignaciones.
- Guardar programa.
- Cambiar estado.

### Fase 4: generación automática

- Generar mes.
- Buscar candidatos.
- Validar disponibilidad.
- Evitar solapamientos.
- Cumplir mínimo de 2.
- Distribuir carga.
- Marcar espacios incompletos.
- Proteger cambios manuales.
- Regenerar espacios pendientes.

### Fase 5: conflictos e historial

- Motor de validación.
- Panel de conflictos.
- Historial básico.
- Estados del programa.

### Fase 6: exportación

- Excel.
- PDF.
- Vista previa.
- Revisión visual.
- Impresión.

### Fase 7: pruebas y entrega

- Pruebas con datos reales.
- Pruebas de disponibilidad.
- Pruebas de solapamientos.
- Pruebas de generación mensual.
- Pruebas de modificaciones manuales.
- Pruebas de respaldo.
- Pruebas de exportación.
- Instalador para Windows.
- Manual básico.

## Criterios de aceptación

El MVP estará terminado cuando:

- Se puedan registrar participantes.
- Se puedan registrar turnos y horarios.
- Se pueda registrar disponibilidad por día y turno.
- Un participante no disponible no sea considerado por el generador.
- Se pueda crear un programa mensual.
- Se pueda generar un borrador automático.
- Cada asignación tenga al menos 2 participantes o quede marcada como incompleta.
- Se detecten solapamientos.
- Se puedan hacer cambios manuales.
- Los cambios manuales estén protegidos.
- Se puedan regenerar únicamente espacios pendientes.
- Se pueda consultar el historial básico.
- Se pueda guardar y reabrir el programa.
- Se pueda exportar a Excel.
- Se pueda exportar a PDF.
- Funcione sin internet en Windows.

## Límites del desarrollo inicial

No agregar todavía:

- Multiusuario.
- Usuarios y permisos.
- Servidor remoto.
- Sincronización.
- WhatsApp.
- Notificaciones.
- Importación del Excel existente.
- Algoritmo avanzado de optimización.
- Roles complejos.
- Aplicación móvil.

Primero debe validarse que el flujo de disponibilidad, generación mensual, revisión manual y exportación sea cómodo y correcto.

## Instrucción para iniciar el desarrollo

Comienza por:

1. Inspeccionar el repositorio actual.
2. Confirmar si está vacío o contiene una aplicación existente.
3. Crear la estructura base del proyecto.
4. Implementar primero el modelo de datos y la tabla de turnos.
5. Crear las pantallas de participantes, turnos, recursos y disponibilidad.
6. Implementar después el constructor manual.
7. Antes de construir la generación automática, probar el flujo manual con datos de ejemplo.
8. Implementar la generación mensual como borrador.
9. Verificar conflictos y modificaciones manuales.
10. Finalizar con Excel, PDF, historial y respaldos.
11. Ejecutar pruebas y mostrar una versión funcional antes de agregar características fuera de este plan.

No agregues funciones no contempladas sin explicar primero por qué son necesarias.

## Modelo recomendado para desarrollar

Modelo principal recomendado:

```text
GPT-5.6 Terra
Razonamiento: High
```

Modelo auxiliar para tareas acotadas:

```text
GPT-5.6 Luna
Razonamiento: Medium
```

Usar Terra como modelo principal para arquitectura, implementación, pruebas y decisiones que involucren varias partes del sistema. Usar Luna para exploración, tareas repetitivas o revisiones acotadas.

Si está disponible el modelo completo GPT-5.6, puede utilizarse para problemas arquitectónicos especialmente difíciles, con razonamiento High o XHigh.

Referencias oficiales:

- https://developers.openai.com/api/docs/guides/model-selection
- https://learn.chatgpt.com/docs/agent-configuration/subagents
