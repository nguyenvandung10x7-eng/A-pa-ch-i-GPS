export interface Point { x: number; y: number }
export interface Rect { left: number; top: number; right: number; bottom: number }
export interface WorldConfig {
  configId: string; bounds: Rect; obstacle: Rect; spawn: Point;
  footprint: { width: number; height: number }; gap: number;
  stick: Point & { dead: number; radius: number; hit: number };
  maxSpeed: number; camera: { scrollX: number; scrollY: number; zoom: number; rotation: number };
}
export const APPROVED: WorldConfig = {
  configId: 'T04-DEV-WM-CFG-P01', bounds: { left:80, top:80, right:1200, bottom:520 },
  obstacle: { left:600, top:220, right:760, bottom:380 }, spawn: {x:240,y:300},
  footprint:{width:24,height:16}, gap:2, stick:{x:160,y:632,dead:8,radius:64,hit:80},
  maxSpeed:240, camera:{scrollX:0,scrollY:0,zoom:1,rotation:0},
};
export function geometry(c: WorldConfig): {bounds:Rect; obstacle:Rect} {
  const x=c.footprint.width/2+c.gap, y=c.footprint.height/2+c.gap;
  return {bounds:{left:c.bounds.left+x,right:c.bounds.right-x,top:c.bounds.top+y,bottom:c.bounds.bottom-y},
    obstacle:{left:c.obstacle.left-x,right:c.obstacle.right+x,top:c.obstacle.top-y,bottom:c.obstacle.bottom+y}};
}
// C07 bounds the correction of computed contacts, not the walkable geometry.
export const CONTACT_TOLERANCE_WU = 1e-6;
// Keep validation strict: invalid spawn/injected positions must never be clamped.
export function legal(p:Point, g:ReturnType<typeof geometry>):boolean {
  return Number.isFinite(p.x) && Number.isFinite(p.y) && p.x>=g.bounds.left && p.x<=g.bounds.right && p.y>=g.bounds.top && p.y<=g.bounds.bottom
    && !(p.x>g.obstacle.left && p.x<g.obstacle.right && p.y>g.obstacle.top && p.y<g.obstacle.bottom);
}
export function validate(c:WorldConfig):void {
  const finite=(v:unknown):boolean=>typeof v==='number' && Number.isFinite(v);
  const rect=(v:Rect):boolean=>Boolean(v) && [v.left,v.right,v.top,v.bottom].every(finite) && v.left<v.right && v.top<v.bottom;
  if (!c || !rect(c.bounds) || !rect(c.obstacle) || !c.spawn || !c.footprint || !c.stick || !c.camera) throw Error('Missing or invalid world configuration');
  if (![c.spawn.x,c.spawn.y,c.footprint.width,c.footprint.height,c.gap,c.stick.x,c.stick.y,c.stick.dead,c.stick.radius,c.stick.hit,c.maxSpeed,...Object.values(c.camera)].every(finite)) throw Error('Non-finite world configuration');
  const s=c.stick, b=c.bounds,o=c.obstacle;
  if(c.footprint.width<=0 || c.footprint.height<=0 || c.gap<0 || c.maxSpeed<=0 || s.dead<0 || s.dead>=s.radius || s.radius>s.hit
    || s.x-s.hit<0 || s.x+s.hit>1280 || s.y-s.hit<544 || s.y+s.hit>720
    || o.left<b.left || o.right>b.right || o.top<b.top || o.bottom>b.bottom) throw Error('Invalid geometry or joystick');
  const g=geometry(c);
  if(!rect(g.bounds) || !legal(c.spawn,g)) throw Error('Spawn/footprint outside walkable geometry');
  // This fixture accepts only the owner-approved configuration; no silent fallback.
  if(JSON.stringify(c)!==JSON.stringify(APPROVED)) throw Error('Configuration differs from approved C01–C07');
}
export function fixture(fault:string):WorldConfig {
  const c=structuredClone(APPROVED);
  switch(fault) {
    case 'approved':break;
    case 'bad-spawn':c.spawn={x:680,y:300};break;
    case 'outside-spawn':c.spawn.x=0;break;
    case 'footprint-spawn':c.spawn.x=590;break;
    case 'bad-hit':c.stick.hit=4;break;
    case 'bad-gap':c.gap=-1;break;
    case 'missing-bounds':delete (c as Partial<WorldConfig>).bounds;break;
    case 'nonfinite':c.maxSpeed=NaN;break;
    case 'missing-stick-x':delete (c.stick as Partial<WorldConfig['stick']>).x;break;
    case 'bad-footprint':c.footprint.width=0;break;
    default:throw Error('Unknown DEV fixture');
  }
  return c;
}
