import test from 'node:test';
import assert from 'node:assert/strict';
import {createDashboardModel,classifyOutreachForDashboard} from './dashboard.js';

const describe = (module, program, assignment) => ({
  module, programId: program.id, assignmentId: assignment.id,
  date: assignment.date, time: assignment.time || '09:00',
  title: assignment.id, detail: '', status: assignment.status || 'complete', reasons: []
});
const build = (db, today, selectedDate) => createDashboardModel({
  db, today, selectedDate,
  describePublic: (program, assignment) => describe('public', program, assignment),
  describeOutreach: (program, assignment) => describe('outreach', program, assignment),
  describePublicProgram: program => ({module: 'public', id: program.id}),
  describeOutreachProgram: program => ({module: 'outreach', id: program.id})
});

test('consolidates both modules across a month boundary without counting inactive outings', () => {
  const model = build({
    programs: [{id: 'public-oct', month: '2026-10', assignments: [
      {id: 'today', date: '2026-10-30'},
      {id: 'pending', date: '2026-10-31', status: 'pending'}
    ]}],
    outreach: {programs: [{id: 'outreach-nov', month: '2026-11', assignments: [
      {id: 'conflict', date: '2026-11-01', status: 'warning'},
      {id: 'inactive', date: '2026-11-02', status: 'inactive'}
    ]}]}
  }, new Date(2026, 9, 30, 12));
  assert.equal(model.counts.today, 1);
  assert.equal(model.counts.upcoming, 3);
  assert.equal(model.counts.pending, 1);
  assert.equal(model.counts.warnings, 1);
  assert.deepEqual(model.attentionItems.map(item => item.assignmentId), ['pending', 'conflict']);
  assert.equal(model.weekDays[6].date, '2026-11-01');
  assert.equal(model.weekDays[6].count, 1);
});

test('selects the latest edited program when a month has multiple versions', () => {
  const model = build({programs: [
    {id: 'older', month: '2026-10', updatedAt: '2026-10-01T10:00:00Z', assignments: [{id: 'old', date: '2026-10-01'}]},
    {id: 'latest', month: '2026-10', updatedAt: '2026-10-02T10:00:00Z', assignments: [{id: 'new', date: '2026-10-01'}]}
  ]}, new Date(2026, 9, 1, 12));
  assert.equal(model.programs[0].id, 'latest');
  assert.deepEqual(model.todayActivities.map(item => item.assignmentId), ['new']);
});

test('reports missing current programs and empty activity states', () => {
  const model = build({programs: [], outreach: {programs: []}, participants: [], turns: [], resources: [], logs: []}, new Date(2026, 9, 1, 12));
  assert.equal(model.counts.today, 0);
  assert.equal(model.attentionItems.length, 0);
  assert.equal(model.programs[0].missing, true);
  assert.equal(model.programs[1].missing, true);
  assert.equal(model.weekDays.length, 7);
});

test('prioritizes warnings over pending activities on the same day', () => {
  const model = build({programs: [{id: 'october', month: '2026-10', assignments: [
    {id: 'pending', date: '2026-10-02', time: '08:00', status: 'pending'},
    {id: 'warning', date: '2026-10-02', time: '10:00', status: 'warning'},
    {id: 'later', date: '2026-10-29', status: 'exception'}
  ]}]}, new Date(2026, 9, 1, 12));
  assert.deepEqual(model.attentionItems.map(item => item.assignmentId), ['warning', 'pending', 'later']);
  assert.equal(model.counts.pending, 1);
  assert.equal(model.counts.warnings, 2);
});

test('omits intentionally unassigned public slots from every activity view', () => {
  const model = build({programs: [{id: 'october', month: '2026-10', assignments: [
    {id: 'ignored-today', date: '2026-10-01', status: 'pending', unassignedAccepted: true},
    {id: 'scheduled-today', date: '2026-10-01', status: 'complete'},
    {id: 'ignored-tomorrow', date: '2026-10-02', status: 'warning', unassignedAccepted: true}
  ]}]}, new Date(2026, 9, 1, 12));
  assert.equal(model.counts.today, 1);
  assert.equal(model.counts.upcoming, 1);
  assert.equal(model.counts.pending, 0);
  assert.equal(model.counts.warnings, 0);
  assert.deepEqual(model.weekActivities.map(item => item.assignmentId), ['scheduled-today']);
  assert.equal(model.weekDays[3].count, 1);
  assert.equal(model.attentionItems.length, 0);
});

test('does not reopen an explicitly accepted outreach conflict', () => {
  const message = 'Predicación pública · Plaza Metropolex · 17:00–20:00';
  const label = 'El capitán tiene otra asignación en Predicación pública: Plaza Metropolex (17:00–20:00).';
  const assignment = {exception: true, exceptionNote: message};
  const assessment = {reasons: [label], unavailableReasons: [label]};
  assert.deepEqual(classifyOutreachForDashboard(assignment, assessment, [{message, label}]), {status: 'complete', reasons: []});
});

test('still highlights a new conflict or a configuration problem', () => {
  const accepted = {message: 'Conflicto original', label: 'Cruce original'};
  const changed = {message: 'Conflicto nuevo', label: 'Cruce nuevo'};
  const assignment = {exception: true, exceptionNote: accepted.message};
  assert.deepEqual(classifyOutreachForDashboard(assignment, {
    reasons: [accepted.label, changed.label], unavailableReasons: [accepted.label, changed.label]
  }, [accepted, changed]), {status: 'warning', reasons: [changed.label]});
  assert.deepEqual(classifyOutreachForDashboard(assignment, {
    reasons: [accepted.label, 'El horario asociado está inactivo.'], unavailableReasons: [accepted.label, 'El horario asociado está inactivo.']
  }, [accepted]), {status: 'warning', reasons: ['El horario asociado está inactivo.']});
});

test('navigates the selected week across months without changing today metrics', () => {
  const model = build({programs: [
    {id: 'october', month: '2026-10', assignments: [{id: 'today', date: '2026-10-30'}]},
    {id: 'november', month: '2026-11', assignments: [{id: 'selected', date: '2026-11-02'}]}
  ]}, new Date(2026, 9, 30, 12), new Date(2026, 10, 2, 12));
  assert.equal(model.todayKey, '2026-10-30');
  assert.equal(model.selectedKey, '2026-11-02');
  assert.deepEqual(model.selectedActivities.map(item => item.assignmentId), ['selected']);
  assert.equal(model.weekDays[0].date, '2026-11-02');
  assert.equal(model.counts.today, 1);
  assert.equal(model.counts.upcoming, 2);
  assert.equal(model.programs[0].id, 'october');
});
