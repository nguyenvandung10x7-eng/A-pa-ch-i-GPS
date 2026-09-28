import { CONTACT_TOLERANCE_WU, type Point, type Rect } from './config';
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
/** Recover the exact plane at a computed segment contact. This is not a
 * per-frame position rounding or an expanded collider: the crossing parameter
 * must equal the selected fraction to floating-point precision, and the
 * coordinate correction must also satisfy C07. Both axes keep ONE fraction.
 * Include entry/exit planes so exact endpoint and corner grazing are stable. */
function contactCoordinate(a:number,v:number,t:number,planes:number[]):number {
  const value=a+v*t;
  if(v===0)return value;
  for(const plane of planes) {
    const crossing=(plane-a)/v;
    const roundoff=8*Number.EPSILON*Math.max(1,Math.abs(t),Math.abs(crossing));
    if(Number.isFinite(crossing) && Math.abs(crossing-t)<=roundoff && Math.abs(value-plane)<=CONTACT_TOLERANCE_WU)return plane;
  }
  return value;
}
export function sweep(p:Point,d:Point,b:Rect,o:Rect):{position:Point;fraction:number} {
  let fraction=1;
  if(d.x>0) fraction=Math.min(fraction,(b.right-p.x)/d.x);
  if(d.x<0) fraction=Math.min(fraction,(b.left-p.x)/d.x);
  if(d.y>0) fraction=Math.min(fraction,(b.bottom-p.y)/d.y);
  if(d.y<0) fraction=Math.min(fraction,(b.top-p.y)/d.y);
  const contact=entry(p,d,o);if(contact!==null) fraction=Math.min(fraction,contact);
  fraction=Math.max(0,fraction);
  return {position:{x:contactCoordinate(p.x,d.x,fraction,[b.left,b.right,o.left,o.right]),y:contactCoordinate(p.y,d.y,fraction,[b.top,b.bottom,o.top,o.bottom])},fraction};
}
