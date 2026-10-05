const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const localDate = value => new Date(`${value}T12:00:00`);
const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };
const mondayOf = date => addDays(date, -((date.getDay() + 6) % 7));
const capitalize = value => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';

const monthLabel = month => {
  const [year, number] = String(month).split('-').map(Number);
  return capitalize(new Date(year, number - 1, 1).toLocaleDateString('es-MX', {month: 'long', year: 'numeric'}));
};

const updatedLabel = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Actualizado: ${capitalize(date.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: 'numeric'}))}`;
};

export function buildOutreachPdfDocument({program, places = [], participants = [], rules = [], settings}) {
  const placeById = new Map(places.map(place => [place.id, place]));
  const personById = new Map(participants.map(person => [person.id, person]));
  const scheduleLabel = appointment => {
    const weekday = localDate(appointment.date).getDay();
    const rule = rules.find(item => Number(item.weekday) === weekday && item.time === appointment.time);
    const period = appointment.time && appointment.time < '12:00' ? 'Mañana' : 'Tarde';
    return [rule?.name || period, appointment.time].filter(Boolean).join(' ') || appointment.time;
  };
  const appointmentMarkup = appointment => {
    const schedule = escapeHtml(scheduleLabel(appointment));
    if (appointment.inactive) {
      return `<article class="appointment-card inactive"><strong class="appointment-time">${schedule}</strong><span class="inactive-reason">${escapeHtml(appointment.inactiveReason || 'Sin actividad')}</span></article>`;
    }
    const captain = personById.get(appointment.captainId);
    const place = placeById.get(appointment.placeId);
    if (!captain || !place) return '';
    return `<article class="appointment-card"><strong class="appointment-time">${schedule}</strong><span class="appointment-detail captain-detail"><span class="calendar-icon" aria-hidden="true">🧑‍💼</span><span class="appointment-text">${escapeHtml(captain.name)}</span></span><span class="appointment-detail place-detail"><span class="calendar-icon" aria-hidden="true">🏠</span><span class="appointment-text">${escapeHtml(place.name)}</span></span></article>`;
  };
  const appointmentsByDate = new Map();
  (program.assignments || []).forEach(appointment => {
    const markup = appointmentMarkup(appointment);
    if (!markup) return;
    const day = appointmentsByDate.get(appointment.date) || [];
    day.push({appointment, markup});
    appointmentsByDate.set(appointment.date, day);
  });
  appointmentsByDate.forEach(day => day.sort((left, right) => left.appointment.time.localeCompare(right.appointment.time)));
  const meetingPlaces = [...new Set([...appointmentsByDate.values()].flatMap(day => day.map(item => item.appointment.placeId)))]
    .map(id => placeById.get(id))
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));
  const meetingPlacesMarkup = meetingPlaces.map(place => `<div class="footer-place"><strong>${escapeHtml(place.name)}</strong><div class="footer-address">${escapeHtml(place.address?.trim() || 'Dirección no registrada')}</div></div>`).join('');

  const [year, month] = program.month.split('-').map(Number);
  const first = new Date(year, month - 1, 1, 12);
  const last = new Date(year, month, 0, 12);
  const firstCell = mondayOf(first);
  const lastCell = addDays(last, 6 - ((last.getDay() + 6) % 7));
  const cells = [];
  for (let date = firstCell; date <= lastCell; date = addDays(date, 1)) cells.push(new Date(date));
  const weekCount = Math.ceil(cells.length / 7);
  const calendarMarkup = cells.map(date => {
    const value = isoDate(date);
    const appointments = appointmentsByDate.get(value) || [];
    const outside = date < first || date > last;
    const countClass = `count-${Math.min(appointments.length, 3)}`;
    return `<section class="calendar-day ${outside ? 'outside-month' : ''} ${countClass}"><header>${date.getDate()}</header>${appointments.map(item => item.markup).join('')}</section>`;
  }).join('');
  const congregation = settings?.congregationName || 'Congregación';
  const title = `Programa de predicación - ${monthLabel(program.month)}`;
  const updated = updatedLabel(program.updatedAt);

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    .header-meta strong{font-size:13pt!important}.appointment-detail.captain-detail{font-size:8.6pt!important;font-weight:700!important;line-height:1.08!important}.appointment-detail.place-detail{font-size:7.6pt!important;font-weight:400!important;line-height:1.04!important}.calendar-day.count-2 .appointment-detail.captain-detail{font-size:8pt!important}.calendar-day.count-2 .appointment-detail.place-detail{font-size:7.1pt!important;font-weight:400!important}.calendar-day.count-3 .appointment-detail.captain-detail{font-size:7pt!important}.calendar-day.count-3 .appointment-detail.place-detail{font-size:6.2pt!important;font-weight:400!important}
    @page{size:A4 landscape;margin:8mm 8mm 9mm}*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#edf3f5;color:#173f59;font-family:Arial,Helvetica,sans-serif}.controls{display:flex;justify-content:space-between;gap:12px;max-width:297mm;margin:12px auto 0;padding:10px 14px;background:#eef7fc;border:1px solid #b9dceb}.controls p{margin:0;font-size:13px}.controls button{border:0;border-radius:6px;background:#1769aa;color:#fff;font:700 14px Arial;padding:9px 13px;cursor:pointer}.document{display:flex;flex-direction:column;width:281mm;height:193mm;margin:12px auto;padding:0;background:#fff}.header{display:flex;align-items:center;justify-content:space-between;gap:12mm;min-height:23mm;padding:5mm 6mm;background:#173f59;color:#fff}.header>div{min-width:0}.header h1{margin:0;font-size:16pt;line-height:1.05}.header p{margin:1.2mm 0 0;color:#dcebf3;font-weight:700;font-size:8pt;letter-spacing:.03em}.header-meta{text-align:right}.header-meta strong{display:block;font-size:11pt;white-space:nowrap}.header-meta span{display:block;margin-top:1mm;color:#dcebf3;font-size:7.5pt;white-space:nowrap}.calendar{display:flex;flex:1;flex-direction:column;min-height:0;margin-top:2.5mm}.calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.calendar-weekdays{flex:0 0 7mm;border:1px solid #d5e2e9;border-bottom:0;background:#e7f0f3;color:#173f59;font-size:7.2pt;font-weight:700}.calendar-weekdays span{display:grid;place-items:center;border-right:1px solid #d5e2e9}.calendar-weekdays span:last-child{border-right:0}.calendar-grid{flex:1;min-height:0;grid-template-rows:repeat(${weekCount},minmax(0,1fr));border-top:1px solid #d5e2e9;border-left:1px solid #d5e2e9}.calendar-day{position:relative;min-width:0;min-height:0;padding:5.7mm .8mm .7mm;border-right:1px solid #d5e2e9;border-bottom:1px solid #d5e2e9;background:#fff}.calendar-day.outside-month{background:#f7fafb;color:#8194a0}.calendar-day header{position:absolute;top:1.4mm;right:1.8mm;color:#173f59;font-size:7.3pt;font-weight:700}.outside-month header{color:#8194a0}.appointment-card{display:grid;gap:.6mm;margin-bottom:.85mm;padding:1.35mm 1.2mm;border:1px solid #c7dce8;border-left:2px solid #4b9ac3;border-radius:2.2mm;background:#f3f9fc;overflow-wrap:anywhere;font-size:6.9pt;line-height:1.08}.appointment-time{color:#0f766e;font-size:7.7pt;line-height:1.04}.appointment-detail{display:flex;align-items:flex-start;gap:.65mm;color:#173f59;font-weight:700}.calendar-icon{display:inline-block;flex:0 0 3.2mm;width:3.2mm;font-size:7.8pt;line-height:1;text-align:center}.appointment-card.inactive{border-color:#d7b75d;border-left-color:#b18a22;background:#fff8df;color:#785a12}.appointment-card.inactive .appointment-time{color:#785a12}.inactive-reason{font-weight:700;overflow-wrap:anywhere}.calendar-day.count-2{padding-top:5.2mm}.calendar-day.count-2 .appointment-card{gap:.4mm;margin-bottom:.55mm;padding:.95mm 1mm;font-size:6.4pt;line-height:1.02}.calendar-day.count-2 .appointment-time{font-size:6.8pt}.calendar-day.count-2 .calendar-icon{flex-basis:2.9mm;width:2.9mm;font-size:7pt}.calendar-day.count-3 .appointment-card{gap:.25mm;margin-bottom:.3mm;padding:.6mm .8mm;font-size:5.7pt;line-height:1}.calendar-day.count-3 .appointment-time{font-size:6.2pt}.calendar-day.count-3 .calendar-icon{flex-basis:2.6mm;width:2.6mm;font-size:6.2pt}.footer{display:flex;align-items:center;justify-content:space-between;gap:8mm;flex:0 0 5mm;margin-top:1.5mm;border-top:1px solid #d5e2e9;color:#637482;font-size:6.6pt}.footer span:last-child{text-align:right}.empty-message{display:grid;place-items:center;flex:1;border:1px solid #d5e2e9;background:#f7fafb;color:#637482;font-size:10pt}@media screen{.document{box-shadow:0 4px 18px #17344d24}}@media print{body{background:#fff}.controls{display:none}.document{margin:0;box-shadow:none}}
    .header{min-height:18mm;padding:3.4mm 6mm}.footer{display:block;flex:0 0 auto;padding:2mm 5mm 4mm;background:#fff;border-top:2px solid #aab5bb}.footer-places{display:grid;grid-template-columns:42mm minmax(0,1fr);align-items:center;gap:4mm}.footer-places h2{display:flex;align-items:center;gap:1.7mm;margin:0;color:#5c6770;font-size:8.5pt;line-height:1.2;letter-spacing:.04em}.footer-title-pin{position:relative;display:inline-block;flex:0 0 2.7mm;width:2.7mm;height:2.7mm;border:1.1px solid #b64f48;border-radius:50% 50% 50% 0;transform:rotate(-45deg)}.footer-title-pin::after{position:absolute;top:.55mm;left:.55mm;width:.6mm;height:.6mm;border-radius:50%;background:#b64f48;content:""}.footer-place-list{display:grid;grid-template-columns:repeat(var(--place-columns),minmax(0,1fr));gap:1.5mm 0}.footer-place{min-width:0;padding:0 3mm;border-left:1px solid #d9dfe2;line-height:1.2}.footer-place strong{display:block;color:#59636b;font-size:8pt}.footer-address{margin-top:.5mm;color:#68747c;font-size:7.5pt;line-height:1.2}
    .calendar-day{padding-left:.5mm;padding-right:.5mm}.appointment-card{padding-left:.75mm;padding-right:.75mm}.calendar-day.count-1 .appointment-card{padding-top:1.7mm;padding-bottom:1.7mm}.appointment-detail{min-width:0;gap:.4mm}.appointment-text{display:block;flex:1;min-width:0;white-space:nowrap}.calendar-icon{flex-basis:2.9mm;width:2.9mm}.appointment-detail.captain-detail{font-size:9pt!important}.appointment-detail.place-detail{font-size:8pt!important}.calendar-day.count-2 .appointment-card{padding:.8mm .7mm}.calendar-day.count-2 .calendar-icon{flex-basis:2.7mm;width:2.7mm}.calendar-day.count-2 .appointment-detail.captain-detail{font-size:8.4pt!important}.calendar-day.count-2 .appointment-detail.place-detail{font-size:7.5pt!important}.calendar-day.count-3 .appointment-card{padding-left:.55mm;padding-right:.55mm}.calendar-day.count-3 .calendar-icon{flex-basis:2.5mm;width:2.5mm}.document.weeks-6 .calendar-day.count-2{padding-top:4.3mm}.document.weeks-6 .calendar-day.count-2 .appointment-card{padding:.25mm .7mm;gap:.15mm;margin-bottom:.15mm}.document.weeks-6 .calendar-day.count-2 .appointment-detail.captain-detail{font-size:8pt!important}.document.weeks-6 .calendar-day.count-2 .appointment-detail.place-detail{font-size:7.1pt!important}
  </style></head><body><aside class="controls"><p>Para conservar el diseño, activa <b>Gráficos de fondo</b> y desactiva <b>Encabezados y pies de página</b>.</p><button onclick="window.print()">Imprimir / Guardar PDF</button></aside><main class="document weeks-${weekCount}"><header class="header"><div><h1>Programa de predicación</h1><p>${escapeHtml(congregation)}</p></div><div class="header-meta"><strong>${escapeHtml(monthLabel(program.month))}</strong>${updated ? `<span>${escapeHtml(updated)}</span>` : ''}</div></header>${appointmentsByDate.size ? `<section class="calendar"><div class="calendar-weekdays"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div><div class="calendar-grid">${calendarMarkup}</div></section>` : '<p class="empty-message">No hay salidas para mostrar en este programa.</p>'}${meetingPlacesMarkup ? `<footer class="footer"><section class="footer-places" aria-label="Direcciones de los lugares de encuentro"><h2><span class="footer-title-pin" aria-hidden="true"></span>DIRECCIONES</h2><div class="footer-place-list" style="--place-columns:${Math.min(meetingPlaces.length, 3)}">${meetingPlacesMarkup}</div></section></footer>` : ''}</main></body></html>`;
}

export function exportOutreachPdf(data) {
  const preview = window.open('', '_blank');
  if (!preview) { window.alert('No se pudo abrir la vista previa. Permite las ventanas emergentes e inténtalo de nuevo.'); return false; }
  preview.document.open();
  preview.document.write(buildOutreachPdfDocument(data));
  preview.document.close();
  preview.requestAnimationFrame(() => fitOutreachLabels(preview.document));
  preview.focus();
  return true;
}

function fitOutreachLabels(root) {
  root.querySelectorAll('.appointment-text').forEach(label => {
    const computedSize = parseFloat(label.ownerDocument.defaultView.getComputedStyle(label).fontSize);
    if (!Number.isFinite(computedSize)) return;
    const minimumSize = Math.min(computedSize, 8.7);
    let size = computedSize;
    while (label.scrollWidth > label.clientWidth + 1 && size > minimumSize) {
      size = Math.max(minimumSize, size - 0.25);
      label.style.setProperty('font-size', `${size}px`, 'important');
    }
    if (label.scrollWidth > label.clientWidth + 1) label.style.whiteSpace = 'normal';
  });
}

const xmlEscape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

export function exportOutreachPng(data) {
  const parsed = new DOMParser().parseFromString(buildOutreachPdfDocument(data), 'text/html');
  const source = parsed.querySelector('.document');
  if (!source) { window.alert('No se encontró la hoja del calendario.'); return false; }
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  Object.assign(holder.style, {
    position: 'fixed', left: '-10000px', top: '0', width: '1200px', height: '850px',
    overflow: 'hidden', background: '#fff', pointerEvents: 'none'
  });
  const styles = [...parsed.querySelectorAll('style')].map(style => style.textContent).join('\n');
  holder.innerHTML = `<style>${styles}</style>${source.outerHTML}`;
  document.body.append(holder);

  window.setTimeout(() => {
    try {
      const sheet = holder.querySelector('.document');
      sheet.style.margin = '0';
      sheet.style.boxShadow = 'none';
      fitOutreachLabels(sheet);
      const bounds = sheet.getBoundingClientRect();
      const width = Math.ceil(bounds.width);
      const height = Math.ceil(bounds.height);
      if (!width || !height) throw new Error('La hoja del calendario no tiene dimensiones válidas.');

      const clone = sheet.cloneNode(true);
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.fontFamily = 'Arial, Helvetica, sans-serif';
      clone.style.color = '#173f59';
      const markup = new XMLSerializer().serializeToString(clone);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px"><style>${xmlEscape(`${styles}\n.document{margin:0!important;box-shadow:none!important}`)}</style>${markup}</div></foreignObject></svg>`;
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const image = new Image();
      image.onload = () => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext('2d');
        context.scale(scale, scale);
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        holder.remove();
        downloadDataUrl(dataUrl, `programa-salidas-${data.program.month}.png`);
      };
      image.onerror = () => { holder.remove(); window.alert('No se pudo generar la imagen PNG.'); };
      image.src = svgUrl;
    } catch (error) {
      holder.remove();
      window.alert(`No se pudo generar la imagen PNG: ${error.message}`);
    }
  }, 80);
  return true;
}
