import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
createServer(async (req,res)=>{try{const path=normalize(join(root,req.url==='/'?'index.html':req.url));if(!path.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(5173,()=>console.log('MVP disponible en http://localhost:5173'));
