import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outDir = 'outputs/programa_predicacion';
await fs.mkdir(outDir, { recursive: true });

const sources = [
  ['S01','0958a705-4c8a-48e9-9c68-86221d9aadd1.jpg','31 ago–6 sep','Duplicado de S02'],
  ['S02','d2d4c5c6-80da-4845-be0b-aea53082872b.jpg','31 ago–6 sep','Copia con mayor detalle en varios turnos'],
  ['S03','3587735d-d81e-41b0-9c6f-c909450e5f30.jpg','7–13 sep','En conflicto con S04 el viernes 11 sep'],
  ['S04','58ff05cb-34bc-4864-a692-96489a1c0522.jpg','7–13 sep','Copia con mayor detalle en varios turnos'],
  ['S05','5e4d9a74-d0b5-45e6-a6ca-76aa7436c5e1.jpg','14–20 sep','Copia compacta'],
  ['S06','3e7ab085-aa4c-48a9-bbd1-db673ca842fc.jpg','14–20 sep','Copia con mayor detalle en algunos horarios'],
  ['S07','33e6dbf9-1564-4441-95bf-09e5bb29e3db.jpg','21–27 sep','Copia compacta'],
  ['S08','3ed89a90-d2bd-4b33-b86d-c70c6bf9a1d5.jpg','21–27 sep','Copia con mayor detalle'],
  ['S09','c3e1460a-c00b-4674-999a-a52ca8d5114d.jpg','28–30 sep','Copia compacta'],
  ['S10','32b06710-f051-4050-a731-d234fc815c84.jpg','28–30 sep','Copia con mayor detalle'],
];

const rows = [];
const add = (bloque, fecha, dia, horario, recurso, ubicacion, nombres, fuente, estado='Consolidado', obs='') => {
  for (const nombre of nombres) rows.push([bloque, fecha, dia, horario, recurso, ubicacion, nombre, fuente, estado, obs]);
};

// Bloque 1: 31 agosto–6 septiembre
add('B1','31-ago','Lunes','Tarde','C2','Plaza Metroplex',['Diana de García','Nallely Guerrero','Bertha Alicia de Moreno'],'S02');
add('B1','01-sep','Martes','8am–11am','C1','O Primera y Concordia',['Juliana de Reyes','Aracely Nieto','Priscila de Rivera'],'S02');
add('B1','01-sep','Martes','8am–11am','C2','Plaza Metroplex',['Ruben Velazquez','Juany de Velazquez','Americo Salas Yañez'],'S02');
add('B1','02-sep','Miércoles','8am–11am','C1','O Primera y Concordia',['Claudia de Pérez','Marisela de Salas','Blanca Torres','Griselda Vazquez'],'S02');
add('B1','02-sep','Miércoles','8am–11am','C2','Plaza Metroplex',['Guillermina de Castañeda','Wendy de Hernandez','Ester de Alferez'],'S02');
add('B1','02-sep','Miércoles','8am–11am','EX1','Plaza Venecia',['Americo Salas Y.','Luis Vitela'],'S02');
add('B1','02-sep','Miércoles','Tarde','C2','Plaza Metroplex',['Bertha Alicia de Moreno','Diana de García'],'S02');
add('B1','03-sep','Jueves','8am–11am','C1','O Primera y Concordia',['Conchis de Hernández','Aracely Gámez','Priscila de Rivera','Merari Aguilar'],'S02');
add('B1','03-sep','Jueves','8am–11am','C2','Plaza Metroplex',['Tavita de Castro','Bertha Alicia de Moreno','Sarahí de Flores','Lety de Aguilar'],'S02');
add('B1','03-sep','Jueves','Tarde','C2','Plaza Metroplex',['Eliseo Guerra','Janai Mata'],'S02','Consolidado','El cuadro dice “Tarde”; no especifica 6pm/8pm');
add('B1','04-sep','Viernes','8am–11am','C1','O Primera y Concordia',['Luis Mata','Juany de Mata','Blanca Jiménez de T.'],'S02');
add('B1','04-sep','Viernes','8am–11am','C2','Plaza Metroplex',['Ester de Alferez','Guillermina de la Cruz','Graciela Hernández'],'S02','Alternativa de fuente','S01 deja este bloque vacío');
add('B1','04-sep','Viernes','Tarde','C2','Plaza Metroplex',['Eliseo Guerra','Janai Mata'],'S02','Alternativa de fuente','S01 deja este bloque vacío');
add('B1','05-sep','Sábado','8am–11am','C1','O Primera y Concordia',['Alan de la Cruz','Merari Aguilar'],'S02');
add('B1','06-sep','Domingo','8am–11am','C1','O Primera y Concordia',['Itai Ortiz','Enrique Ruan'],'S02');
add('B1','06-sep','Domingo','8am–11am','C2','Plaza Metroplex',['Graciela Hernández','Emilia de Cordoba'],'S02');

// Bloque 2: 7–13 septiembre
add('B2','07-sep','Lunes','5pm–7pm','C1','O Primera y Concordia',['Miguel Carrillo','Ana de Carrillo'],'S04');
add('B2','07-sep','Lunes','5pm–7pm','C2','Plaza Metroplex',['Diana de García','Nallely Guerrero','Guillermina de Castañeda','Bertha Alicia de Moreno'],'S04');
add('B2','07-sep','Lunes','5pm–7pm','EX1','Plaza Venecia',['Yasmin de Vitela','Luis Vitela'],'S04');
add('B2','08-sep','Martes','8am–11am','C1','O Primera y Concordia',['Emilia de Cordoba','Aracely Gámez'],'S04');
add('B2','08-sep','Martes','8am–11am','C2','Plaza Metroplex',['Ruben Velazquez','Juany de Velazquez','Cristina de Carrizalez'],'S04');
add('B2','08-sep','Martes','8am–11am','EX1','Plaza Venecia',['Americo Salas Y.','Adriana González','Priscila de Rivera'],'S04');
add('B2','09-sep','Miércoles','8am–11am','C1','O Primera y Concordia',['Americo Salas Y.','Luis Vitela','Americo Salas C.'],'S04');
add('B2','09-sep','Miércoles','8am–11am','C2','Plaza Metroplex',['Ester de Alferez','Guillermina de Castañeda','Wendy de Hernandez','Marisela de Salas'],'S04');
add('B2','09-sep','Miércoles','8am–11am','EX1','Plaza Venecia',['Vivi de Ruan','Luisita'],'S04');
add('B2','09-sep','Miércoles','Tarde','C2','Plaza Metroplex',['Bertha Alicia de Moreno','Diana de García'],'S04');
add('B2','10-sep','Jueves','8am–11am','C1','O Primera y Concordia',['Conchis de Hernández','Aracely Gámez','Juliana de Reyes','Merari Aguilar'],'S04');
add('B2','10-sep','Jueves','8am–11am','C2','Plaza Metroplex',['Sarahí de Flores','Tavita de Castro','Bertha Alicia de Moreno','Lety de Aguilar'],'S04');
add('B2','10-sep','Jueves','6pm–8pm','C2','Plaza Metroplex',['Eliseo Guerra','Janai Mata'],'S04');
add('B2','11-sep','Viernes','8am–11am','C1','O Primera y Concordia',['Luis Mata','Juany de Mata','Ester de Alferez'],'S04');
add('B2','11-sep','Viernes','8am–11am','C2','Plaza Metroplex',['Graciera Hernandez','Wendy de Hernandez','Claudia de Pérez','Tavita de Castro'],'S04','Alternativa de fuente','S03 deja este bloque vacío; nombre “Graciera” se conserva como aparece');
add('B2','12-sep','Sábado','Tarde','C2','Plaza Metroplex',['Familia Ruan'],'S04');
add('B2','13-sep','Domingo','8am–11am','C1','O Primera y Concordia',['Graciela Hernández','Blanca Jiménez de T.'],'S04');
add('B2','13-sep','Domingo','8am–11am','C2','Plaza Metroplex',['Familia Pardo'],'S04');
add('B2','13-sep','Domingo','8am–11am','EX1','Plaza Venecia',['Svetlana González','Elizabeth Fuerte de González'],'S04');

// Bloque 3: 14–20 septiembre
add('B3','14-sep','Lunes','Tarde','C2','Plaza Metroplex',['Diana de García','Nallely Guerrero','Bertha Alicia de Moreno'],'S06');
add('B3','15-sep','Martes','8am–11am','C2','Plaza Metroplex',['Juliana de Reyes','Priscila de Rivera','Adriana González','Aracely Gámez'],'S06');
add('B3','15-sep','Martes','8am–11am','EX1','Plaza Venecia',['Ruben Velazquez','Juany de Velazquez','Americo Salas Y.'],'S06');
add('B3','16-sep','Miércoles','8am–11am','C1','O Primera y Concordia',['Vivi de Ruan','Marisela de Salas','Griselda Vazquez','Blanca Torres'],'S06');
add('B3','16-sep','Miércoles','8am–11am','C2','Plaza Metroplex',['Ester de Alferez','Guillermina de Castañeda','Wendy de Hernandez','Claudia de Pérez'],'S06');
add('B3','16-sep','Miércoles','8am–11am','EX1','Plaza Venecia',['Americo Salas Y.','Luis Vitela','Americo Salas C.'],'S06');
add('B3','16-sep','Miércoles','Tarde','C2','Plaza Metroplex',['Bertha Alicia de Moreno','Diana de García'],'S06');
add('B3','17-sep','Jueves','8am–11am','C1','O Primera y Concordia',['Conchis de Hernández','Aracely Gámez','Merari Aguilar','Priscila de Rivera'],'S06');
add('B3','17-sep','Jueves','8am–11am','C2','Plaza Metroplex',['Sarahí de Flores','Tavita de Castro','Bertha Alicia de Moreno','Lety de Aguilar'],'S06');
add('B3','17-sep','Jueves','6pm–8pm','C2','Plaza Metroplex',['Itai Ortiz','Eliseo Guerra'],'S06');
add('B3','18-sep','Viernes','8am–11am','C1','O Primera y Concordia',['Luis Mata','Juany de Mata','Octavia de Castro'],'S06');
add('B3','18-sep','Viernes','8am–11am','C2','Plaza Metroplex',['Blanca Jiménez de T.','Guillermina de la Cruz','Ester de Alferez'],'S06');
add('B3','19-sep','Sábado','8am–11am','C1','O Primera y Concordia',['Alan de la Cruz','Merari Aguilar'],'S06');
add('B3','20-sep','Domingo','8am–11am','C1','O Primera y Concordia',['Itai Ortiz','Enrique Ruan'],'S06');
add('B3','20-sep','Domingo','8am–11am','C2','Plaza Metroplex',['Graciela Hernández','Emilia de Cordoba'],'S06');
add('B3','20-sep','Domingo','8am–11am','EX1','Plaza Venecia',['Svetlana González','Elizabeth Fuerte de González'],'S06');

// Bloque 4: 21–27 septiembre
add('B4','21-sep','Lunes','Tarde','C1','O Primera y Concordia',['Miguel Carrillo','Ana de Carrillo','Yasmin Ayala','Luis Vitela'],'S08');
add('B4','21-sep','Lunes','Tarde','C2','Plaza Metroplex',['Diana de García','Nallely Guerrero','Guillermina de Castañeda','Bertha Alicia de Moreno'],'S08');
add('B4','22-sep','Martes','8am–11am','C1','O Primera y Concordia',['Emilia de Cordoba','Aracely Gámez'],'S08');
add('B4','22-sep','Martes','8am–11am','C2','Plaza Metroplex',['Ruben Velazquez','Juany de Velazquez','Cristina de Carrizalez'],'S08');
add('B4','22-sep','Martes','8am–11am','EX1','Plaza Venecia',['Adriana González','Priscila de Rivera','Americo Salas Y.'],'S08');
add('B4','23-sep','Miércoles','8am–11am','C1','O Primera y Concordia',['Americo Salas Y.','Luis Vitela','Americo Salas C.'],'S08');
add('B4','23-sep','Miércoles','8am–11am','C2','Plaza Metroplex',['Ester de Alferez','Guillermina de Castañeda','Marisela de Salas'],'S08');
add('B4','23-sep','Miércoles','8am–11am','EX1','Plaza Venecia',['Viviana de Ruan','Luisita'],'S08');
add('B4','23-sep','Miércoles','Tarde','C2','Plaza Metroplex',['Bertha Alicia de Moreno','Diana de García'],'S08');
add('B4','24-sep','Jueves','8am–11am','C1','O Primera y Concordia',['Conchis de Hernández','Tavita de Castro','Aracely Gámez','Merari Aguilar'],'S08');
add('B4','24-sep','Jueves','8am–11am','C2','Plaza Metroplex',['Juliana de Reyes','Sarahí de Flores','Bertha Alicia de Moreno','Lety de Aguilar'],'S08');
add('B4','24-sep','Jueves','6pm–8pm','C2','Plaza Metroplex',['Janai Mata','Itai Ortiz'],'S08');
add('B4','25-sep','Viernes','8am–11am','C1','O Primera y Concordia',['Luis Mata','Juany de Mata','Claudia de Pérez','Ester de Alferez'],'S08');
add('B4','25-sep','Viernes','8am–11am','C2','Plaza Metroplex',['Graciela Hernández','Guillermina de la Cruz','Tavita de Castro'],'S08');
add('B4','26-sep','Sábado','Tarde','C2','Plaza Metroplex',['Familia Ruan'],'S08');
add('B4','27-sep','Domingo','8am–11am','C2','Plaza Metroplex',['Familia Pardo','Blanca Jiménez de T.'],'S08');
add('B4','27-sep','Domingo','8am–11am','EX1','Plaza Venecia',['Svetlana González','Elizabeth Fuerte de González'],'S08');

// Bloque 5: 28–30 septiembre
add('B5','28-sep','Lunes','Tarde','C2','Plaza Metroplex',['Diana de García','Nallely Guerrero','Guillermina de Castañeda','Bertha Alicia de Moreno'],'S10');
add('B5','29-sep','Martes','8am–11am','C1','O Primera y Concordia',['Emilia de Cordoba','Viviana de Ruan','Luisita','Aracely Gámez'],'S10');
add('B5','29-sep','Martes','8am–11am','C2','Plaza Metroplex',['Ruben Velazquez','Juany de Velazquez','Cristina de Carrizalez'],'S10');
add('B5','29-sep','Martes','8am–11am','EX1','Plaza Venecia',['Adriana González','Priscila de Rivera','Americo Salas Y.'],'S10');
add('B5','30-sep','Miércoles','8am–11am','C1','O Primera y Concordia',['Americo Salas Y.','Luis Vitela'],'S10');
add('B5','30-sep','Miércoles','8am–11am','C2','Plaza Metroplex',['Ester de Alferez','Guillermina de Castañeda','Wendy de Hernandez','Marisela de Salas'],'S10');
add('B5','30-sep','Miércoles','Tarde','C2','Plaza Metroplex',['Bertha Alicia de Moreno','Diana de García'],'S10');

const conflicts = [
  ['C01','04-sep','Viernes','8am–11am','C2','S01 vs S02','S01: celda vacía','S02: Ester de Alferez; Guillermina de la Cruz; Graciela Hernández','No se determina la versión vigente'],
  ['C02','04-sep','Viernes','Tarde','C2','S01 vs S02','S01: celda vacía','S02: Eliseo Guerra; Janai Mata','No se determina la versión vigente'],
  ['C03','11-sep','Viernes','8am–11am','C2','S03 vs S04','S03: celda vacía','S04: Graciera Hernandez; Wendy de Hernandez; Claudia de Pérez; Tavita de Castro','No se determina la versión vigente; conservar “Graciera” como texto original'],
  ['C04','03-sep','Jueves','Tarde','C2','S01 vs S02','S01: Tarde sin horas exactas','S02: Eliseo Guerra; Janai Mata','El horario exacto podría ser 6pm–8pm por analogía, pero no se infiere'],
  ['C05','varias','—','—','—','Nombres abreviados','Americo Salas Y.; Americo Salas Yañez; Vivi; Viviana; Luisita; Luis','Se mantienen sin fusionar automáticamente','Requieren validación humana'],
];

const people = new Map();
for (const r of rows) {
  const name = r[6];
  if (!people.has(name)) people.set(name, {name, type: name.startsWith('Familia ') ? 'Grupo/familia' : 'Persona o forma individual', notes: ''});
}
people.set('Americo Salas Yañez', {name:'Americo Salas Yañez', type:'Persona / variante no resuelta', notes:'No fusionar automáticamente con Americo Salas Y.'});
people.set('Americo Salas Y.', {name:'Americo Salas Y.', type:'Persona / inicial', notes:'No fusionar automáticamente con Americo Salas Yañez.'});
people.set('Americo Salas C.', {name:'Americo Salas C.', type:'Persona / inicial', notes:'Mantener separado de Americo Salas Y.'});
people.set('Vivi de Ruan', {name:'Vivi de Ruan', type:'Alias o forma abreviada', notes:'Relacionado visualmente con Viviana de Ruan, pero no confirmado.'});
people.set('Viviana de Ruan', {name:'Viviana de Ruan', type:'Persona / variante no resuelta', notes:'Mantener separada de Vivi de Ruan.'});
people.set('Luisita', {name:'Luisita', type:'Alias o forma abreviada', notes:'No fusionar automáticamente con Luis Vitela.'});

const wb = Workbook.create();
const summary = wb.worksheets.add('Resumen');
const prog = wb.worksheets.add('Programa consolidado');
const src = wb.worksheets.add('Fuentes');
const conf = wb.worksheets.add('Conflictos');
const ppl = wb.worksheets.add('Participantes');
const navy = '#1F3A5F', amber = '#F5B700', pale = '#FFF7DF', gray = '#F3F4F6', red = '#FCE4D6';
const font = { name: 'Arial', size: 10, color: '#222222' };

summary.showGridLines = false;
summary.getRange('A1:F1').merge();
summary.getRange('A1').values = [['Programa de predicación pública con carritos y exhibidores']];
summary.getRange('A1:F1').format = { font: { name:'Arial', size:16, bold:true, color:navy }, horizontalAlignment:'left', verticalAlignment:'center' };
summary.getRange('A2:F2').merge();
summary.getRange('A2').values = [['Consolidación de 10 imágenes; se conservan fuentes, variantes y conflictos. El año no aparece en los documentos.']];
summary.getRange('A2:F2').format = { font:{name:'Arial', size:10, italic:true, color:'#555555'}, wrapText:true };
summary.getRange('A4:B9').values = [
  ['Indicador','Valor'],['Imágenes revisadas',10],['Bloques consolidados',5],['Asignaciones individuales registradas',rows.length],['Fuentes con diferencias explícitas',3],['Recursos operativos',3]
];
summary.getRange('A4:B4').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'}};
summary.getRange('A5:B9').format = {borders:{preset:'inside',style:'thin',color:'#D9D9D9'}};
summary.getRange('D4:F9').values = [
  ['Estructura','Uso','Nota'],['Programa consolidado','Operación diaria','Una fila por participante y turno'],['Fuentes','Trazabilidad','Archivo y bloque de origen'],['Conflictos','Revisión','Diferencias entre copias'],['Participantes','Catálogo','No fusiona variantes dudosas'],['Estado','Provisional','Requiere validación de conflictos']
];
summary.getRange('D4:F4').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'}};
summary.getRange('D5:F9').format = {borders:{preset:'inside',style:'thin',color:'#D9D9D9'},wrapText:true};
summary.getRange('A11:F11').merge(); summary.getRange('A11').values = [['Criterios de consolidación']]; summary.getRange('A11:F11').format = {fill:amber,font:{name:'Arial',size:11,bold:true,color:'#222222'}};
summary.getRange('A12:F16').values = [
  ['1.','Se conserva el texto original de nombres y horarios cuando existe duda.','','','',''],
  ['2.','Las celdas vacías de una copia no se interpretan como ausencia definitiva si otra copia contiene nombres.','','','',''],
  ['3.','“Tarde” se conserva como horario impreciso; no se convierte automáticamente en 6pm–8pm.','','','',''],
  ['4.','Familia Ruan y Familia Pardo se registran como grupos.','','','',''],
  ['5.','La vista consolidada usa la copia con mayor detalle, pero los conflictos quedan documentados.','','','','']
];
summary.getRange('A12:F16').format = {wrapText:true,font:font};

prog.showGridLines = false;
prog.getRange('A1:J1').values = [['Bloque','Fecha','Día','Horario original','Recurso','Ubicación','Participante original','Fuente principal','Estado','Observaciones']];
prog.getRange(`A1:J${rows.length+1}`).format.font = font;
prog.getRange('A1:J1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center'};
prog.getRange(`A2:J${rows.length+1}`).values = rows;
prog.getRange(`A2:J${rows.length+1}`).format = {borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'},verticalAlignment:'center'};
prog.getRange(`I2:I${rows.length+1}`).conditionalFormats.add('containsText',{text:'Alternativa',format:{fill:red,font:{color:'#9C0006',bold:true}}});
prog.getRange('A1:J1').format.rowHeight = 32;
prog.freezePanes.freezeRows(1);
prog.tables.add(`A1:J${rows.length+1}`,true,'ProgramaTable');

src.showGridLines = false;
src.getRange('A1:D1').values = [['Fuente ID','Archivo','Periodo','Observación']];
src.getRange(`A2:D${sources.length+1}`).values = sources;
src.getRange('A1:D1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'}};
src.getRange(`A1:D${sources.length+1}`).format.font = font;
src.getRange(`A1:D${sources.length+1}`).format.wrapText = true;
src.freezePanes.freezeRows(1); src.tables.add(`A1:D${sources.length+1}`,true,'FuentesTable');

conf.showGridLines = false;
conf.getRange('A1:I1').values = [['ID','Fecha','Día','Horario','Recurso','Comparación','Fuente A','Fuente B','Tratamiento']];
conf.getRange(`A2:I${conflicts.length+1}`).values = conflicts;
conf.getRange('A1:I1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true};
conf.getRange(`A1:I${conflicts.length+1}`).format.font = font;
conf.getRange(`A2:I${conflicts.length+1}`).format = {fill:pale,wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'}};
conf.freezePanes.freezeRows(1); conf.tables.add(`A1:I${conflicts.length+1}`,true,'ConflictosTable');

ppl.showGridLines = false;
ppl.getRange('A1:C1').values = [['Participante / grupo tal como aparece','Tipo','Nota de normalización']];
ppl.getRange(`A2:C${people.size+1}`).values = Array.from(people.values()).map(x=>[x.name,x.type,x.notes]);
ppl.getRange('A1:C1').format = {fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true};
ppl.getRange(`A1:C${people.size+1}`).format.font = font;
ppl.getRange(`A2:C${people.size+1}`).format = {wrapText:true,borders:{preset:'insideHorizontal',style:'thin',color:'#E5E7EB'}};
ppl.freezePanes.freezeRows(1); ppl.tables.add(`A1:C${people.size+1}`,true,'ParticipantesTable');

for (const sh of [summary, prog, src, conf, ppl]) {
  const used = sh.getUsedRange();
  used.format.font = font;
  used.format.verticalAlignment = 'center';
  used.format.autofitColumns();
}
summary.getRange('A1:F16').format.columnWidth = 22;
summary.getRange('A1:F16').format.wrapText = true;
prog.getRange('A:A').format.columnWidth = 9;
prog.getRange('B:B').format.columnWidth = 11;
prog.getRange('C:C').format.columnWidth = 12;
prog.getRange('D:D').format.columnWidth = 15;
prog.getRange('E:E').format.columnWidth = 10;
prog.getRange('F:F').format.columnWidth = 22;
prog.getRange('G:G').format.columnWidth = 29;
prog.getRange('H:H').format.columnWidth = 10;
prog.getRange('I:I').format.columnWidth = 18;
prog.getRange('J:J').format.columnWidth = 42;
src.getRange('A:A').format.columnWidth = 10; src.getRange('B:B').format.columnWidth = 50; src.getRange('C:C').format.columnWidth = 18; src.getRange('D:D').format.columnWidth = 45;
conf.getRange('A:A').format.columnWidth = 8; conf.getRange('B:E').format.columnWidth = 14; conf.getRange('F:F').format.columnWidth = 18; conf.getRange('G:H').format.columnWidth = 42; conf.getRange('I:I').format.columnWidth = 42;
ppl.getRange('A:A').format.columnWidth = 32; ppl.getRange('B:B').format.columnWidth = 25; ppl.getRange('C:C').format.columnWidth = 55;

for (const sheetName of ['Resumen','Programa consolidado','Fuentes','Conflictos','Participantes']) {
  const preview = await wb.render({sheetName,autoCrop:'all',scale:1,format:'png'});
  await fs.writeFile(`${outDir}/${sheetName.replaceAll(' ','_').toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()));
}
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(`${outDir}/programa_predicacion_consolidado.xlsx`);

const inspect = await wb.inspect({kind:'table',sheetId:'Programa consolidado',range:'A1:J12',include:'values',tableMaxRows:12,tableMaxCols:10,maxChars:5000});
console.log(inspect.ndjson);
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'formula error scan'});
console.log(errors.ndjson);
