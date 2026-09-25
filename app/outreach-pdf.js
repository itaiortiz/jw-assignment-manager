const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const localDate = value => new Date(`${value}T12:00:00`);
const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };
const mondayOf = date => addDays(date, -((date.getDay() + 6) % 7));
const capitalize = value => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';

const monthLabel = month => {
  const [year, number] = String(month).split('-').map(Number);
  return capitalize(new Date(year, number - 1, 1).toLocaleDateString('es-MX', {month:'long',year:'numeric'}));
};
const dayLabel = date => capitalize(localDate(date).toLocaleDateString('es-MX', {weekday:'long',day:'numeric',month:'long'}));
const weekLabel = start => {
  const first = localDate(start), last = addDays(first, 6);
  return `Semana del ${first.toLocaleDateString('es-MX',{day:'numeric',month:'long'})} al ${last.toLocaleDateString('es-MX',{day:'numeric',month:'long'})}`;
};

export function buildOutreachPdfDocument({program, places, participants, settings}) {
  const placeById = new Map(places.map(place => [place.id, place]));
  const personById = new Map(participants.map(person => [person.id, person]));
  const appointmentsByDate = new Map();
  (program.assignments || []).forEach(appointment => {
    const day = appointmentsByDate.get(appointment.date) || [];
    day.push(appointment);
    appointmentsByDate.set(appointment.date, day);
  });
  const [year, month] = program.month.split('-').map(Number);
  const first = new Date(year, month - 1, 1, 12), last = new Date(year, month, 0, 12);
  const weeks = new Map();
  for (let date = first; date <= last; date = addDays(date, 1)) {
    const key = isoDate(mondayOf(date));
    const week = weeks.get(key) || [];
    week.push(isoDate(date));
    weeks.set(key, week);
  }
  const weekMarkup = [...weeks.entries()].map(([weekStart, dates]) => `<section class="week"><h2>${escapeHtml(weekLabel(weekStart))}</h2>${dates.map(date => {
    const appointments = (appointmentsByDate.get(date) || []).sort((left,right) => left.time.localeCompare(right.time));
    if (!appointments.length) return '';
    return `<article class="day"><h3>${escapeHtml(dayLabel(date))}</h3>${appointments.map(appointment => {
      if (appointment.inactive) return `<div class="appointment inactive"><div><strong>${escapeHtml(appointment.time)}</strong><span>Sin actividad</span></div><div class="reason"><b>Motivo</b><span>${escapeHtml(appointment.inactiveReason || 'Sin especificar')}</span></div></div>`;
      const place = placeById.get(appointment.placeId), captain = personById.get(appointment.captainId);
      return `<div class="appointment"><div><strong>${escapeHtml(appointment.time)}</strong><span>${escapeHtml(place?.name || 'Sin lugar de encuentro')}</span>${place?.address ? `<small>${escapeHtml(place.address)}</small>` : ''}</div><div class="captain"><b>Capitán</b><span>${escapeHtml(captain?.name || 'Sin asignar')}</span></div></div>`;
    }).join('')}</article>`;
  }).join('')}</section>`).join('');
  const congregation = settings?.congregationName || 'Congregación';
  const title = `Programa de salidas de predicación - ${monthLabel(program.month)}`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:A4 portrait;margin:12mm 12mm 16mm}*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#edf3f5;color:#173f59;font-family:Arial,Helvetica,sans-serif}.controls{display:flex;justify-content:space-between;gap:12px;max-width:210mm;margin:12px auto;padding:10px 14px;background:#eef7fc;border:1px solid #b9dceb}.controls p{margin:0;font-size:13px}.controls button{border:0;border-radius:6px;background:#1769aa;color:#fff;font:700 14px Arial;padding:9px 13px;cursor:pointer}.document{max-width:210mm;margin:auto;padding:12mm;background:#fff}.header{padding:8mm 9mm;background:#173f59;color:white}.header h1{margin:0;font-size:18pt}.header p{margin:2mm 0 0;color:#dcebf3;font-weight:700;font-size:9pt}.header strong{display:block;margin-top:3mm;font-size:11pt}.week{margin-top:6mm;break-inside:avoid}.week h2{margin:0;padding:3mm 5mm;background:#e7f0f3;border-left:3px solid #0f766e;font-size:11pt}.day{margin-top:3mm;border:1px solid #d9e5eb;break-inside:avoid}.day h3{margin:0;padding:3mm 4mm;background:#f5f8f9;font-size:10pt}.appointment{display:grid;grid-template-columns:55% 45%;border-top:1px solid #d9e5eb;min-height:15mm}.appointment>div{padding:3mm 4mm}.appointment>div:first-child{border-right:1px solid #e8eff3}.appointment strong,.captain b,.reason b{display:block;color:#0f766e;font-size:9pt}.appointment span{display:block;margin-top:1mm;font-size:10pt;font-weight:700}.appointment small{display:block;margin-top:1mm;color:#637482;font-size:8.5pt}.captain,.reason{display:flex;flex-direction:column;justify-content:center}.appointment.inactive{border-color:#d7b75d;background:#fff8df}.appointment.inactive strong,.appointment.inactive .reason b{color:#785a12}@media screen{.document{box-shadow:0 4px 18px #17344d24}}@media print{body{background:#fff}.controls{display:none}.document{max-width:none;padding:0;box-shadow:none}}
  </style></head><body><aside class="controls"><p>Para conservar el diseño, activa <b>Gráficos de fondo</b> y desactiva <b>Encabezados y pies de página</b>.</p><button onclick="window.print()">Imprimir / Guardar PDF</button></aside><main class="document"><header class="header"><h1>Programa de salidas de predicación</h1><p>${escapeHtml(congregation)}</p><strong>${escapeHtml(monthLabel(program.month))}</strong></header>${weekMarkup || '<p>No hay salidas para este programa.</p>'}</main></body></html>`;
}

export function exportOutreachPdf(data) {
  const preview = window.open('', '_blank');
  if (!preview) { window.alert('No se pudo abrir la vista previa. Permite las ventanas emergentes e inténtalo de nuevo.'); return false; }
  preview.document.open();
  preview.document.write(buildOutreachPdfDocument(data));
  preview.document.close();
  preview.focus();
  return true;
}
