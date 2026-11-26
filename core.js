/* Shared drawing helpers for every art file in art-assets (github.com/fenw1ck/art-assets).
   Load it first. It only adds window.ART_CORE and changes nothing else on the page.
   plants.js and garden.js still carry their own copies of these helpers. They will move onto this file one at a time,
   and tools/contact-sheet.py checks each move for a pixel-identical result.

   ART_CORE.hex(h) / rgb(r,g,b) / mix(a,b,t) / lighten(c,t) / darken(c,t)   colour, as "#rrggbb"
   ART_CORE.ramp(base, n, {shift, sat})   a colour ramp, dark to light, with hue shifting (shadows toward blue, highlights toward yellow)
   ART_CORE.rngLCG(seed)                  the random numbers plants.js uses (keeps every existing plant the same)
   ART_CORE.rngMulberry(seed)             the random numbers garden.js uses (keeps every existing garden the same)
   ART_CORE.noise(x,y,seed) / fbm(x,y,seed,octaves) / warp(x,y,seed,amount)   smooth noise, layered noise and domain-warped noise, 0..1
   ART_CORE.voronoi(x,y,cell,seed)        nearest and second-nearest distances and the cell id: stones, breccia, cracks (edge = d2-d1 small)
   ART_CORE.shadow(ctx,x,y,w)             the soft ground shadow every object sits on
   Factor modules (used by containers.js; plants.js will move onto them):
   ART_CORE.view(kind,s,{mirror})         perspective: 'three-quarter' (oblique, depth up and to the right) or 'front'; world x right, y up, z away; s px per unit
   ART_CORE.face(ctx,V,O,U,W,draw)        draws on one flat face of a 3-D object: draw(ctx,lu,lw) works in the face's own units (u along U, v up along W)
   ART_CORE.light(n)                      shading: how lit a surface with normal n is (0..1), key light from the upper left and in front
   ART_CORE.shade(c,n)                    the colour c on a surface facing n, hue-shifted toward blue in shadow and yellow in light
   ART_CORE.ink(c) / ART_CORE.weight(px)  line: a darker version of the local colour (never black) and a line width for an object px wide
   ART_CORE.lod(px)                       resolution: 'icon' (<=48 px), 'card' (<=200) or 'detail'
   ART_CORE.house                         the house style: accurate proportions, back-lit silhouette with a cool rim (see below) */
(function(){
"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hex(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function rgb(r,g,b){return'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const A=hex(a),B=hex(b);return rgb(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
const lighten=(c,t)=>mix(c,'#ffffff',t),darken=(c,t)=>mix(c,'#000000',t);

/* HSL, for hue shifting */
function toHsl(c){let[r,g,b]=hex(c).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function fromHsl(h,s,l){h=((h%360)+360)%360;const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return rgb(f(0)*255,f(8)*255,f(4)*255)}
/* a ramp of n colours, dark to light, around base (the middle swatch). Hue turns toward blue (240°) in the
   shadows and toward yellow (60°) in the highlights, by up to `shift` degrees at the ends (default 20, a natural look);
   shadows gain a little saturation, highlights lose some. */
function ramp(base,n,o){n=n||5;o=o||{};const shift=o.shift==null?20:o.shift,sat=o.sat==null?.12:o.sat,[h,s,l]=toHsl(base),out=[];
  const toward=(from,to,deg)=>{let d=((to-from+540)%360)-180;return from+Math.sign(d)*Math.min(Math.abs(d),deg)};
  for(let i=0;i<n;i++){const t=n===1?0:i/(n-1)*2-1; /* -1 darkest .. +1 lightest */
    const hh=t<0?toward(h,240,shift*-t):toward(h,60,shift*t),ll=t<0?l*(1+.75*t):l+(1-l)*.75*t,ss=clamp(s*(1-sat*t),0,1);
    out.push(fromHsl(hh,ss,clamp(ll,0,1)))}
  return out}

/* random numbers: the two generators already in use, kept exactly */
function rngLCG(seed){let s=(seed*9301+49297)%233280||1;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function rngMulberry(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* noise: hashed value noise with a smooth curve, layered (fBm) and warped (Quilez) */
function hash(x,y,seed){let h=(Math.imul(x|0,0x27d4eb2d)^Math.imul(y|0,0x165667b1)^Math.imul((seed|0)+0x9e3779b9,0x85ebca6b))|0;h=Math.imul(h^h>>>15,0x2c1b3c6d);h=Math.imul(h^h>>>12,0x297a2d39);h^=h>>>15;return(h>>>0)/4294967296}
const fade=t=>t*t*t*(t*(t*6-15)+10);
function noise(x,y,seed){const xi=Math.floor(x),yi=Math.floor(y),u=fade(x-xi),v=fade(y-yi),s=seed||0;
  const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,seed,oct){oct=oct||5;let sum=0,amp=.5,f=1,norm=0;for(let i=0;i<oct;i++){sum+=amp*noise(x*f,y*f,(seed||0)+i*101);norm+=amp;amp*=.5;f*=2.02}return sum/norm}
function warp(x,y,seed,amount){amount=amount==null?4:amount;const s=seed||0,qx=fbm(x,y,s),qy=fbm(x+5.2,y+1.3,s);return fbm(x+amount*qx,y+amount*qy,s+17)}

/* Voronoi (Worley): one point per cell of size `cell`, jittered within the middle 75% so no cell is a sliver */
function voronoi(x,y,cell,seed){const s=seed||0,gx=Math.floor(x/cell),gy=Math.floor(y/cell);let d1=1e9,d2=1e9,id=0,px=0,py=0;
  for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const cx=gx+i,cy=gy+j,ox=(cx+.125+.75*hash(cx,cy,s))*cell,oy=(cy+.125+.75*hash(cx,cy,s+1))*cell,d=Math.hypot(x-ox,y-oy);
    if(d<d1){d2=d1;d1=d;id=hash(cx,cy,s+2);px=ox;py=oy}else if(d<d2)d2=d}
  return{d1,d2,edge:d2-d1,id,px,py}}

/* the soft ground shadow (the same as plants.js) */
function shadow(ctx,x,y,w){ctx.save();const g=ctx.createRadialGradient(x,y,0,x,y,w*.55);g.addColorStop(0,"rgba(30,20,8,.32)");g.addColorStop(1,"rgba(30,20,8,0)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,w*.55,Math.max(2,w*.12),0,0,Math.PI*2);ctx.fill();ctx.restore()}

/* perspective */
function view(kind,s,o){o=o||{};const a=(o.angle==null?32:o.angle)*Math.PI/180,k=o.depth==null?.5:o.depth,m=o.mirror?-1:1;
  if(kind==='front')return{kind,s,mirror:!!o.mirror,p:(x,y,z)=>[x*s,-y*s]};
  return{kind:'three-quarter',s,mirror:!!o.mirror,p:(x,y,z)=>[(x+m*z*k*Math.cos(a))*s,(-y-z*k*Math.sin(a))*s]}}
function face(ctx,V,O,U,W,draw){const len=v=>Math.hypot(v[0],v[1],v[2])||1e-9,lu=len(U),lw=len(W),p0=V.p(...O),pu=V.p(O[0]+U[0],O[1]+U[1],O[2]+U[2]),pw=V.p(O[0]+W[0],O[1]+W[1],O[2]+W[2]);
  ctx.save();ctx.transform((pu[0]-p0[0])/lu,(pu[1]-p0[1])/lu,(pw[0]-p0[0])/lw,(pw[1]-p0[1])/lw,p0[0],p0[1]);draw(ctx,lu,lw);ctx.restore()}
/* shading: key light from the upper left and in front of the object, plus soft ambient */
const KEY=(()=>{const v=[-.45,.78,-.43],l=Math.hypot(...v);return v.map(c=>c/l)})();
function light(n){const l=Math.hypot(...n)||1;return .38+.62*Math.max(0,(n[0]*KEY[0]+n[1]*KEY[1]+n[2]*KEY[2])/l)}
function shade(c,n,o){const t=typeof n==='number'?n:light(n),r=ramp(c,9,o);return r[clamp(Math.round(4+(t-.62)*8),0,8)]}
/* line */
const ink=(c,t)=>{const[h,s,l]=toHsl(c);return fromHsl(h,Math.min(1,s*1.1),l*(t==null?.42:t))};
const weight=px=>Math.max(.5,px*.0055);
/* resolution */
const lod=px=>px<=48?'icon':px<=200?'card':'detail';

/* ---- the house style (research/rendering/house-style.md; decided 25 Nov 2026 for every project's new art) ----
   Accurate, anatomical proportions; lit like a back-lit silhouette: the subject is one dark shape against a pale moon,
   only its outer edge catches a cool rim of light, hair and feathers break that edge, faint inner contours keep the
   parts readable, and the eyes glow.
   ART_CORE.house.paint(ctx, W, H, parts, o)   parts: [{pts (px), role, far, center}] in draw order (back to front)
       o.s        px per unit (for stroke lengths); o.bones: [[a,b]] faint struts (wing fingers); o.eyes: [{x,y,r,col}]
       o.dim      0..1 less rim (wounded, dead); o.body the silhouette colour; o.rim the rim colour
   ART_CORE.house.moon(ctx, W, H, x, y, r)    the pale back-light: a moon glow through mist (backgrounds, cards)
   Roles that grow hair at the edge: fur, mane (long, outward from parts[i].center), hair; feather (short tips). */
const house=(()=>{const mkc=(W,H)=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
 const path=(g,P)=>{g.beginPath();const n=P.length;for(let i=0;i<=n;i++){const a=P[i%n],b=P[(i+1)%n],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];i?g.quadraticCurveTo(a[0],a[1],m[0],m[1]):g.moveTo(m[0],m[1])}g.closePath()};
 function paint(ctx,W,H,parts,o){o=o||{};const s=o.s||100,body=o.body||'#070c0f',rimC=o.rim||'#d6f2ff',dim=o.dim||0,u=mkc(W,H),g=u.getContext('2d');let seed=o.seed||9;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  g.fillStyle=body;parts.forEach(p=>{path(g,p.pts);g.fill()});
  g.strokeStyle=body;g.lineCap='round';
  if(s>30)parts.forEach(p=>{const hair=p.role==='fur'||p.role==='mane'||p.role==='hair',fea=p.role==='feather';if(!hair&&!fea)return;const P=p.pts,n=P.length,c=p.center;
   for(let k=0;k<n*(p.role==='mane'?14:fea?3:4);k++){const i=Math.floor(R()*n),a=P[i],b=P[(i+1)%n],t=R(),x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;let nx,ny;if(c){nx=x-c[0];ny=y-c[1]}else{nx=b[1]-a[1];ny=-(b[0]-a[0])}const l=Math.hypot(nx,ny)||1,L=s*(p.role==='mane'?.02+R()*.045:fea?.012+R()*.01:.006+R()*.012);
    g.lineWidth=p.role==='mane'?Math.max(.8,s*.004)*(1+R()):fea?Math.max(1,s*.006):Math.max(.6,s*.002);g.beginPath();g.moveTo(x-nx/l*L*.3,y-ny/l*L*.3);g.quadraticCurveTo(x+nx/l*L*.5+(R()-.5)*L*.4,y+ny/l*L*.5,x+nx/l*L+(R()-.5)*L*.5,y+ny/l*L+(R()-.3)*L*.4);g.stroke()}});
  g.save();g.globalCompositeOperation='source-atop';parts.forEach(p=>{if(p.far||p.torso)return;g.strokeStyle='rgba(90,130,150,.22)';g.lineWidth=Math.max(.6,s*.0012);g.save();g.translate(Math.max(.5,s*.001),-Math.max(.5,s*.001));path(g,p.pts);g.stroke();g.restore()});
  (o.bones||[]).forEach(Q=>{g.strokeStyle='rgba(110,150,170,.25)';g.lineWidth=Math.max(.7,s*.0016);g.beginPath();g.moveTo(...Q[0]);g.lineTo(...Q[1]);g.stroke()});
  const lg=g.createLinearGradient(0,0,W*.3,H);lg.addColorStop(0,'rgba(60,90,105,.25)');lg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);g.restore();
  ctx.drawImage(u,0,0);
  const rim=(d,blur,col,a)=>{const r=mkc(W,H),q=r.getContext('2d');q.drawImage(u,0,0);q.globalCompositeOperation='destination-out';q.drawImage(u,-d,d*.7);q.globalCompositeOperation='source-in';q.fillStyle=col;q.fillRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(1-dim*.6);if(blur)ctx.filter=`blur(${blur}px)`;ctx.drawImage(r,0,0);ctx.restore()};
  rim(Math.max(1,s*.005),0,rimC,.95);rim(Math.max(1.5,s*.012),Math.max(.8,s*.006),'#9fd8f0',.45);
  (o.eyes||[]).forEach(e=>{const gr=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r);gr.addColorStop(0,e.core||'rgba(255,236,150,1)');gr.addColorStop(.25,e.col||'rgba(255,180,60,.85)');gr.addColorStop(1,'rgba(255,170,60,0)');ctx.fillStyle=gr;ctx.fillRect(e.x-e.r,e.y-e.r,2*e.r,2*e.r)})}
 function moon(ctx,W,H,x,y,r){const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0e1c28');bg.addColorStop(.6,'#56808f');bg.addColorStop(1,'#18242a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const m=ctx.createRadialGradient(x,y,0,x,y,r);m.addColorStop(0,'rgba(232,248,255,.95)');m.addColorStop(.18,'rgba(196,230,244,.6)');m.addColorStop(1,'rgba(196,230,244,0)');ctx.fillStyle=m;ctx.fillRect(0,0,W,H)}
 return{paint,moon}})();

window.ART_CORE={house,view,face,light,shade,ink,weight,lod,hex,rgb,mix,lighten,darken,toHsl,fromHsl,ramp,rngLCG,rngMulberry,noise,fbm,warp,voronoi,shadow,clamp};
})();
