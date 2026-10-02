import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {test} from 'node:test';

const appUrl=new URL('./',import.meta.url);

test('dashboard editor assets are publishable without node_modules',async()=>{
  const html=await readFile(new URL('index.html',appUrl),'utf8');
  for(const asset of ['vendor/gridstack/gridstack-all.js','vendor/gridstack/gridstack.min.css']){
    assert.ok(html.includes(`"${asset}"`),`${asset} must be referenced by index.html`);
    assert.ok((await stat(new URL(asset,appUrl))).size>0,`${asset} must exist`);
  }
  assert.ok(!html.includes('node_modules/gridstack/'));
});
