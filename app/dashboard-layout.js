export const DASHBOARD_BLOCKS=['metrics','programs','agenda','attention','config','changes'];
export const DEFAULT_DASHBOARD_LAYOUT={version:2,blocks:[
  {id:'metrics',x:0,y:0,w:2},
  {id:'programs',x:2,y:0,w:2},
  {id:'agenda',x:0,y:6,w:2},
  {id:'attention',x:2,y:17,w:2},
  {id:'changes',x:2,y:28,w:2},
  {id:'config',x:0,y:28,w:2}
]};

export function normalizeDashboardLayout(value){
  const source=Array.isArray(value?.blocks)?value.blocks:[];
  const legacy=value?.version===1;
  const valid=value?.version===2||legacy;
  const seen=new Set();
  const blocks=[];
  for(const item of valid?source:[]){
    if(!item||!DASHBOARD_BLOCKS.includes(item.id)||seen.has(item.id))continue;
    seen.add(item.id);
    const fallback=DEFAULT_DASHBOARD_LAYOUT.blocks.find(block=>block.id===item.id);
    if(legacy){
      const w=item.span===3?4:2;
      const x=w===4||item.id==='agenda'?0:2;
      blocks.push({id:item.id,x,y:blocks.length*8,w});
    }else{
      const w=item.w===4?4:2;
      const x=w===4?0:item.x===2?2:0;
      const y=Number.isInteger(item.y)&&item.y>=0&&item.y<10000?item.y:fallback.y;
      blocks.push({id:item.id,x,y,w});
    }
  }
  for(const item of DEFAULT_DASHBOARD_LAYOUT.blocks)if(!seen.has(item.id))blocks.push({...item});
  return {version:2,blocks};
}
