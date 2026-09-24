const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const localDate = value => new Date(`${value}T12:00:00`);
const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };
const mondayOf = date => addDays(date, -((date.getDay() + 6) % 7));
const capitalize = value => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
const escapeCssContent = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');

const monthLabel = month => {
  const [year, number] = String(month).split('-').map(Number);
  return capitalize(new Date(year, number - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }));
};

const dayLabel = value => capitalize(localDate(value).toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long'
}));

const weekLabel = value => {
  const first = localDate(value), last = addDays(first, 6);
  return `Semana del ${first.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} al ${last.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`;
};

export function buildPublicPdfDocument({ program, settings, resources, turns, participants }) {
  const resourceById = new Map(resources.map(resource => [resource.id, resource]));
  const turnById = new Map(turns.map(turn => [turn.id, turn]));
  const participantById = new Map(participants.map(person => [person.id, person]));
  const assignments = program.assignments
    .map(assignment => ({
      ...assignment,
      people: assignment.participantIds.map(id => participantById.get(id)?.name).filter(Boolean)
    }))
    .filter(assignment => assignment.people.length > 0)
    .sort((left, right) => left.date.localeCompare(right.date) || (turnById.get(left.turnId)?.start || '').localeCompare(turnById.get(right.turnId)?.start || ''));
  const weeks = new Map();

  assignments.forEach(assignment => {
    const weekStart = isoDate(mondayOf(localDate(assignment.date)));
    const week = weeks.get(weekStart) || new Map();
    const day = week.get(assignment.date) || [];
    day.push(assignment);
    week.set(assignment.date, day);
    weeks.set(weekStart, week);
  });

  const dayMarkup = ([date, dayAssignments]) => `
        <section class="pdf-day">
          <header><h3>${escapeHtml(dayLabel(date))}</h3><span>${dayAssignments.length} ${dayAssignments.length === 1 ? 'asignación' : 'asignaciones'}</span></header>
          ${dayAssignments.map(assignment => {
            const turn = turnById.get(assignment.turnId);
            const resource = resourceById.get(assignment.resourceId);
            const point = resource?.name || resource?.location || 'Punto sin configurar';
            const people = assignment.people;
            const peopleMarkup = people.map(name => `<span class="participant-name">${escapeHtml(name)}</span>`).join('<span class="participant-separator" aria-hidden="true"> · </span>');
            return `<article class="assignment-row">
              <div class="assignment-summary"><strong>${escapeHtml(turn?.name || 'Turno')}${turn?.start ? ` · ${escapeHtml(turn.start)}${turn?.end ? ` - ${escapeHtml(turn.end)}` : ''}` : ''}</strong><span>${escapeHtml(point)}</span></div>
              <div class="assignment-people">${peopleMarkup}</div>
            </article>`;
          }).join('')}
        </section>`;

  const weeksMarkup = [...weeks.entries()].map(([weekStart, days]) => {
    const dayEntries = [...days.entries()];
    const [firstDay, ...remainingDays] = dayEntries;
    return `
    <section class="pdf-week">
      <div class="pdf-week-opening"><h2>${escapeHtml(weekLabel(weekStart))}</h2>${dayMarkup(firstDay)}</div>
      ${remainingDays.map(dayMarkup).join('')}
    </section>`;
  }).join('');

  const congregation = settings?.congregationName || 'Congregación';
  const title = `Programa de predicación pública - ${congregation} - ${monthLabel(program.month)}`;
  const footerLabel = `${congregation} | Programa de predicación pública - ${monthLabel(program.month)}`;
  return `<!doctype html>
  <html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page { size: A4 portrait; margin: 13mm 12mm 20mm; @bottom-left { content: "${escapeCssContent(footerLabel)}"; color: #637482; font-family: Arial, Helvetica, sans-serif; font-size: 7.5pt; } @bottom-right { content: counter(page); color: #637482; font-family: Arial, Helvetica, sans-serif; font-size: 7.5pt; } }
    * { box-sizing: border-box; } html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; background: #eef3f6; color: #173f59; font-family: Arial, Helvetica, sans-serif; }
    .print-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; max-width: 210mm; margin: 12px auto 0; padding: 10px 14px; border: 1px solid #b9dceb; background: #eef7fc; color: #175878; font-size: 14px; }.print-controls p { margin: 0; }.print-controls button { border: 0; border-radius: 6px; padding: 9px 13px; background: #1769aa; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    .pdf-document { width: 100%; max-width: 210mm; margin: 0 auto; padding: 13mm 12mm 15mm; background: #fff; }
    .pdf-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 8mm; padding: 8mm 9mm; background: #173f59; color: #fff; }.pdf-header > div { min-width: 0; }
    .pdf-header h1 { margin: 0; font-size: 17pt; line-height: 1.15; }.pdf-header p { margin: 1.5mm 0 0; color: #dcebf3; font-size: 8.5pt; font-weight: 700; letter-spacing: .03em; }.pdf-header-meta { text-align: right; white-space: nowrap; }.pdf-header-meta strong { display: block; font-size: 10.5pt; }.pdf-header-meta span { display: block; margin-top: 1mm; color: #dcebf3; font-size: 8pt; }
    .pdf-week { margin: 0 0 7mm; }.pdf-header + .pdf-week { margin-top: 5mm; }.pdf-week-opening { break-inside: avoid; }.pdf-week h2 { margin: 0; padding: 3.5mm 5mm; border-left: 3px solid #0f766e; background: #e7f0f3; color: #173f59; font-size: 11.5pt; }.pdf-day { margin-top: 4mm; border: 1px solid #d9e5eb; break-inside: avoid; }.pdf-day header { display: flex; align-items: baseline; justify-content: space-between; gap: 6mm; padding: 3mm 4mm; background: #f5f8f9; }.pdf-day h3 { margin: 0; font-size: 10.5pt; }.pdf-day header span { color: #637482; font-size: 8.5pt; font-weight: 700; white-space: nowrap; }
    .assignment-row { display: grid; grid-template-columns: 42% 58%; min-height: 14mm; border-top: 1px solid #d9e5eb; break-inside: avoid; }.assignment-row > div { padding: 3mm 4mm; }.assignment-summary { border-right: 1px solid #e8eff3; }.assignment-summary strong { display: block; color: #0f766e; font-size: 8.5pt; }.assignment-summary span { display: block; margin-top: 1mm; color: #9a4f26; font-size: 9.3pt; font-weight: 700; line-height: 1.3; }.assignment-people { display: flex; align-items: center; flex-wrap: wrap; color: #122f44; font-size: 10pt; font-weight: 500; line-height: 1.45; }.participant-name { white-space: nowrap; }.participant-separator { color: #9aa8b2; padding: 0 1.2mm; }.pdf-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 7mm; color: #637482; font-size: 7.5pt; }.pdf-page-number::after { content: counter(page); }
    @media screen { .pdf-document { margin: 12px auto; box-shadow: 0 4px 18px #17344d24; } } @media print { body { background: #fff; }.print-controls, .pdf-footer { display: none !important; }.pdf-document { max-width: none; margin: 0; padding: 0; box-shadow: none; }.pdf-week { break-inside: auto; }.pdf-day { break-inside: avoid; } }
  </style></head><body><aside class="print-controls"><p>Para conservar el diseño: activa <b>Gráficos de fondo</b> y desactiva <b>Encabezados y pies de página</b> en Más configuraciones.</p><button type="button" onclick="window.print()">Imprimir / Guardar PDF</button></aside><main class="pdf-document">
    <header class="pdf-header"><div><h1>Programa de predicación pública</h1><p>${escapeHtml(congregation)}</p></div><div class="pdf-header-meta"><strong>${escapeHtml(monthLabel(program.month))}</strong><span>${assignments.length} ${assignments.length === 1 ? 'asignación' : 'asignaciones'}</span></div></header>
    ${weeksMarkup || '<p>No hay asignaciones para este programa.</p>'}
    <footer class="pdf-footer"><span>${escapeHtml(footerLabel)}</span><span class="pdf-page-number"></span></footer>
  </main></body></html>`;
}

export function exportPublicPdf(data) {
  const preview = window.open('', '_blank');
  if (!preview) {
    window.alert('No se pudo abrir la vista previa. Permite las ventanas emergentes e inténtalo de nuevo.');
    return false;
  }
  preview.document.open();
  preview.document.write(buildPublicPdfDocument(data));
  preview.document.close();
  preview.focus();
  return true;
}
