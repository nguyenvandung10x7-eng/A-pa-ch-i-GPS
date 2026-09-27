import type { Point, Rect } from './config';
/** Swept point against an OPEN rectangle. Tangent/corner grazing is legal. */
function entry(p:Point,d:Point,r:Rect):number|null {
  let enter=-Infinity, leave=Infinity;
  for(const [a,v,lo,hi] of [[p.x,d.x,r.left,r.right],[p.y,d.y,r.top,r.bottom]]) {
    if(v===0) {if(a<=lo || a>=hi) return null; continue;}
    const t1=(lo-a)/v,t2=(hi-a)/v;
    enter=Math.max(enter,Math.min(t1,t2));leave=Math.min(leave,Math.max(t1,t2));
  }
  if(Math.max(enter,0)>=Math.min(leave,1)) return null;
  return Math.max(0,enter);
}
export function sweep(p:Point,d:Point,b:Rect,o:Rect):{position:Point;fraction:number} {
  let fraction=1;
  if(d.x>0) fraction=Math.min(fraction,(b.right-p.x)/d.x);
  if(d.x<0) fraction=Math.min(fraction,(b.left-p.x)/d.x);
  if(d.y>0) fraction=Math.min(fraction,(b.bottom-p.y)/d.y);
  if(d.y<0) fraction=Math.min(fraction,(b.top-p.y)/d.y);
  const contact=entry(p,d,o);if(contact!==null) fraction=Math.min(fraction,contact);
  fraction=Math.max(0,fraction);
  return {position:{x:p.x+d.x*fraction,y:p.y+d.y*fraction},fraction};
}
