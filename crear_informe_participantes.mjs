import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const inputPath = 'outputs/programa_predicacion/programa_predicacion_consolidado.xlsx';
const outDir = 'outputs/informe_participantes';
await fs.mkdir(outDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const sourceWb = await SpreadsheetFile.importXlsx(input);
const sourceSheet = sourceWb.worksheets.getItem('Programa consolidado');
const raw = sourceSheet.getUsedRange().values;
const headers = raw[0];
const records = raw.slice(1).map(r => Object.fromEntries(headers.map((h,i)=>[h,r[i] ?? ''])));

const key = (v) => String(v ?? '').trim();
const counts = (arr) => { const m = new Map(); for (const x of arr) { const k=key(x); if(k) m.set(k,(m.get(k)||0)+1); } return m; };
const modes = (arr) => { const m=counts(arr); if(!m.size) return ''; const max=Math.max(...m.values()); return [...m.entries()].filter(([,n])=>n===max).map(([k])=>k).join(' / '); };
const listCounts = (arr) => [...counts(arr).entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'es')).map(([k,n])=>`${k} (${n})`).join('; ');
const uniqueSorted = arr => [...new Set(arr.map(key).filter(Boolean))];

const byParticipant = new Map();
for (const r of records) {
  const p = key(r['Participante original']);
  if (!p) continue;
  if (!byParticipant.has(p)) byParticipant.set(p, []);
  byParticipant.get(p).push(r);
}

const summaryRows = [];
const detailRows = [];
for (const [p, rs] of [...byParticipant.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es'))) {
  const exact = rs.filter(r => /\d/.test(key(r['Horario original']))).map(r=>key(r['Horario original']));
  const imprecise = rs.filter(r => !/\d/.test(key(r['Horario original']))).map(r=>key(r['Horario original']));
  const notes = [];
  if (imprecise.length) notes.push(`Conserva etiqueta no exacta: ${uniqueSorted(imprecise).join(', ')}`);
  if (p.startsWith('Familia ')) notes.push('Grupo/familia; confirmar quiénes asistirán.');
  if (['Americo Salas Y.','Americo Salas Yañez','Vivi de Ruan','Viviana de Ruan','Luisita'].includes(p)) notes.push('Mantener como entidad independiente hasta confirmar identidad.');
  summaryRows.push([
    p,
    rs.length,
    modes(rs.map(r=>r['Horario original'])),
    listCounts(rs.map(r=>r['Horario original'])),
    listCounts(exact),
    listCounts(imprecise),
    modes(rs.map(r=>r['Día'])),
    listCounts(rs.map(r=>r['Día'])),
    listCounts(rs.map(r=>r['Recurso'])),
    listCounts(rs.map(r=>r['Ubicación'])),
    notes.join(' '),
  ]);
  for (const r of rs) detailRows.push([
    p, r['Fecha'], r['Día'], r['Horario original'], r['Recurso'], r['Ubicación'], r['Estado'], r['Fuente principal'], r['Observaciones']
  ]);
}

const wb = Workbook.create();
const summary = wb.worksheets.add('Resumen participantes');
const detail = wb.worksheets.add('Detalle de asignaciones');
const guide = wb.worksheets.add('Guía para confirmar');
const method = wb.worksheets.add('Metodología');
const navy = '#1F3A5F', amber = '#F5B700', pale = '#FFF7DF', gray = '#F3F4F6';
const font = { name:'Arial', size:10, color:'#222222' };

summary.showGridLines = false;
summary.getRange('A1:K1').merge();
summary.getRange('A1').values = [['Informe de horarios habituales por participante']];
summary.getRange('A1:K1').format = {font:{name:'Arial',size:16,bold:true,color:navy},verticalAlignment:'center'};
summary.getRange('A2:K2').merge();
summary.getRange('A2').values = [['Basado en el programa consolidado de 10 imágenes. El informe describe asignaciones observadas, no disponibilidad confirmada.']];
summary.getRange('A2:K2').format = {font:{name:'Arial',size:10,italic:true,color:'#555555'},wrapText:true};
const sumHeaders = ['Participante o grupo','Asignaciones observadas','Turno más frecuente','Distribución de turnos','Horarios exactos observados','Etiquetas no exactas','Día más frecuente','Distribución por día','Recursos','Ubicaciones','Notas'];
summary.getRange(`A4:K${summaryRows.length+4}`).values = [sumHeaders, ...summaryRows];
summary.getRange('A4:K4').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center'};
summary.getRange(`A5:K${summaryRows.length+4}`).format = {font,wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'},verticalAlignment:'center'};
summary.getRange('A4:K4').format.rowHeight = 38;
summary.freezePanes.freezeRows(4);
summary.tables.add(`A4:K${summaryRows.length+4}`,true,'ParticipantSummaryTable');

detail.showGridLines = false;
const detailHeaders = ['Participante o grupo','Fecha','Día','Horario original','Recurso','Ubicación','Estado','Fuente','Observaciones'];
detail.getRange(`A1:I${detailRows.length+1}`).values = [detailHeaders, ...detailRows];
detail.getRange('A1:I1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true};
detail.getRange(`A2:I${detailRows.length+1}`).format = {font,wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'}};
detail.getRange(`G2:G${detailRows.length+1}`).conditionalFormats.add('containsText',{text:'Alternativa',format:{fill:'#FCE4D6',font:{color:'#9C0006',bold:true}}});
detail.freezePanes.freezeRows(1);
detail.tables.add(`A1:I${detailRows.length+1}`,true,'ParticipantDetailTable');

const guideRows = summaryRows.map(r=>[
  r[0], r[2], r[4] || 'No hay horario exacto observado', r[5] || 'Ninguna', '¿Puedes mantener disponibilidad en estos horarios?', '¿Hay otros horarios en los que también puedes participar?', '¿Hay fechas o turnos que debamos evitar?'
]);
guide.showGridLines = false;
const guideHeaders = ['Participante o grupo','Turno habitual observado','Horarios exactos observados','Etiquetas no exactas','Pregunta de confirmación principal','Pregunta adicional','Notas de disponibilidad'];
guide.getRange(`A1:G${guideRows.length+1}`).values = [guideHeaders, ...guideRows];
guide.getRange('A1:G1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true};
guide.getRange(`A2:G${guideRows.length+1}`).format = {font,wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'}};
guide.getRange('A1:G1').format.rowHeight = 42;
guide.freezePanes.freezeRows(1);
guide.tables.add(`A1:G${guideRows.length+1}`,true,'AvailabilityGuideTable');

method.showGridLines = false;
method.getRange('A1:D1').merge(); method.getRange('A1').values = [['Cómo interpretar este informe']]; method.getRange('A1:D1').format = {fill:amber,font:{name:'Arial',size:12,bold:true,color:'#222222'}};
method.getRange('A3:B9').values = [
  ['Elemento','Criterio'],
  ['Fuente','Programa consolidado derivado de las imágenes proporcionadas.'],
  ['Horario exacto','Solo se considera exacto cuando el texto contiene horas, por ejemplo 8am–11am o 6pm–8pm.'],
  ['Etiqueta no exacta','“Tarde” se conserva como aparece; no se supone una hora concreta.'],
  ['Usual','Se calcula por frecuencia de aparición en las asignaciones observadas.'],
  ['Disponibilidad','No se deduce del historial. Debe confirmarse directamente con cada participante.'],
  ['Variantes','Nombres abreviados o parecidos se mantienen separados hasta validación humana.'],
];
method.getRange('A3:B3').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'}};
method.getRange('A4:B9').format = {font,wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'}};
method.getRange('A11:D11').merge(); method.getRange('A11').values = [['Uso sugerido']]; method.getRange('A11:D11').format = {fill:amber,font:{name:'Arial',size:12,bold:true,color:'#222222'}};
method.getRange('A12:D15').values = [
  ['1.','Contacta a cada persona con la hoja “Guía para confirmar”.','',''],
  ['2.','Pregunta primero por los horarios exactos observados.','',''],
  ['3.','Pregunta después por excepciones, cambios o nuevos horarios disponibles.','',''],
  ['4.','Registra la disponibilidad confirmada en la futura aplicación, no reemplaces el historial observado.','',''],
];
method.getRange('A12:D15').format = {font,wrapText:true};

for (const sh of [summary,detail,guide,method]) {
  sh.getUsedRange().format.font = font;
  sh.getUsedRange().format.verticalAlignment = 'center';
  sh.getUsedRange().format.autofitColumns();
}
summary.getRange('A:A').format.columnWidth = 28; summary.getRange('B:B').format.columnWidth = 15; summary.getRange('C:C').format.columnWidth = 20; summary.getRange('D:F').format.columnWidth = 30; summary.getRange('G:G').format.columnWidth = 18; summary.getRange('H:J').format.columnWidth = 28; summary.getRange('K:K').format.columnWidth = 45;
detail.getRange('A:A').format.columnWidth = 28; detail.getRange('B:D').format.columnWidth = 15; detail.getRange('E:F').format.columnWidth = 24; detail.getRange('G:H').format.columnWidth = 14; detail.getRange('I:I').format.columnWidth = 45;
guide.getRange('A:A').format.columnWidth = 28; guide.getRange('B:D').format.columnWidth = 28; guide.getRange('E:G').format.columnWidth = 42;
method.getRange('A:A').format.columnWidth = 22; method.getRange('B:D').format.columnWidth = 55;

for (const sheetName of ['Resumen participantes','Detalle de asignaciones','Guía para confirmar','Metodología']) {
  const preview = await wb.render({sheetName,autoCrop:'all',scale:1,format:'png'});
  await fs.writeFile(`${outDir}/${sheetName.replaceAll(' ','_').toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(`${outDir}/informe_horarios_participantes.xlsx`);
const check = await wb.inspect({kind:'table',sheetId:'Resumen participantes',range:'A1:K10',include:'values',tableMaxRows:10,tableMaxCols:11,maxChars:6000});
console.log(check.ndjson);
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan'});
console.log(errors.ndjson);
