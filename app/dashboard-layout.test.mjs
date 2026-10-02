import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_DASHBOARD_LAYOUT,normalizeDashboardLayout} from './dashboard-layout.js';

test('normalizes missing, duplicate, unknown and invalid layout entries',()=>{
  const layout=normalizeDashboardLayout({version:2,blocks:[
    {id:'agenda',x:2,y:6,w:2},{id:'agenda',x:0,y:0,w:4},{id:'unknown',x:0,y:0,w:2},{id:'metrics',x:2,y:-3,w:7}
  ]});
  assert.equal(layout.blocks.length,DEFAULT_DASHBOARD_LAYOUT.blocks.length);
  assert.deepEqual(layout.blocks[0],{id:'agenda',x:2,y:6,w:2});
  assert.deepEqual(layout.blocks[1],{id:'metrics',x:2,y:0,w:2});
  assert.deepEqual(normalizeDashboardLayout({version:3,blocks:[]}),DEFAULT_DASHBOARD_LAYOUT);
});

test('migrates previous three-column preferences without losing block order',()=>{
  const old={version:1,blocks:[{id:'metrics',span:3},{id:'agenda',span:1},{id:'programs',span:1},{id:'config',span:1}]};
  const migrated=normalizeDashboardLayout(old);
  assert.deepEqual(migrated.blocks.slice(0,4).map(item=>[item.id,item.w,item.x]),[
    ['metrics',4,0],['agenda',2,0],['programs',2,2],['config',2,2]
  ]);
});

test('keeps all widgets within four columns',()=>{
  const layout=normalizeDashboardLayout({version:2,blocks:[{id:'agenda',x:99,y:5,w:4},{id:'config',x:2,y:3,w:2}]});
  assert.deepEqual(layout.blocks.slice(0,2).map(item=>[item.x,item.w]),[[0,4],[2,2]]);
});

test('default places summary and agenda left, programs and changes right',()=>{
  const blocks=normalizeDashboardLayout(null).blocks;
  assert.deepEqual(blocks.map(({id,x,w})=>[id,x,w]),[
    ['metrics',0,2],['programs',2,2],['agenda',0,2],
    ['attention',2,2],['changes',2,2],['config',0,2]
  ]);
});
