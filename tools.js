/* Tools: the ax (and later other hand tools), drawn from research traits.
   Needs core.js. Research: research/objects/tools/ (traits vocabulary "tool" in research/traits.yaml).

   TOOLS.drawAx(ctx, tier, x, y, size, angle, opts)
     tier    0 basic (Bronze Ax) | 1 improved (Iron Ax) | 2 best (Starmetal Ax), or a tier object from TOOLS.AXES
     x, y    the knob end of the haft (where the hand grips)
     size    the haft's length on screen, in px (the head reaches about 0.18 of it past the bit side)
     angle   radians, turning the whole ax about the knob; 0 = haft straight up, bit facing right
     opts    mirror: true to face the bit left;  glint: 0..1 a flash along the cutting edge (the moment of a strike)
   TOOLS.AXES          the three tiers: {id, name, strikes, metal, wood, ...} (strikes = blows to cut a vine back)
   TOOLS.swing(u)      the swing pose for u = 0..1 (wind-up, strike, recoil): {angle, lift}, drawn with {mirror:true}; the strike lands at u = TOOLS.HIT
   TOOLS.bitPoint(tier, size, angle)   where the middle of the cutting edge is, relative to the knob (to aim a swing at a point)
   Light from the upper left, as everywhere else. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('tools.js needs core.js loaded first');
const {mix,lighten,darken,noise,lod}=A;

/* the three axes. Strikes follow the farming-game ladder (a starter tool, then fewer blows per upgrade). */
const AXES=[
  {tier:0,id:'bronze-ax',name:'Bronze Ax',strikes:10,metal:'bronze',head:'#b07a35',edge:'#f2cf8a',wood:'ash',haft:'#c9a36b',grain:'#9c7a48',head_shape:'flared',lugs:false,beard:0,wrap:null,
    desc:'A broad cast bronze head on an ash haft. Six blows for wisteria, ten for Virginia creeper, fifteen for English ivy, twenty for muscadine.'},
  {tier:1,id:'iron-ax',name:'Iron Ax',strikes:6,metal:'wrought iron',head:'#6d7177',edge:'#e8eef2',wood:'hickory',haft:'#b07c45',grain:'#7e5228',head_shape:'single-bit',lugs:true,beard:0,wrap:null,
    desc:'A broad forged iron head with a bright tempered edge, hung on hickory. Cuts vines in about six tenths the blows of the Bronze Ax.'},
  {tier:2,id:'starmetal-ax',name:'Starmetal Ax',strikes:3,metal:'starmetal',head:'#2b3754',edge:'#d8ecff',wood:'hickory',haft:'#8a5a2e',grain:'#5a3618',head_shape:'bearded',lugs:true,beard:1,wrap:'#c99a3e',
    desc:'Forged from a fallen star, like the sword. Gold-bound hickory. Cuts vines in about three tenths the blows of the Bronze Ax.'}
];

/* head outlines, in haft lengths, eye centre at (0,0), bit to +x. Each point: [x, y, corner radius].
   Drawn broad (26 Nov 2026): HEAD_X longer and HEAD_Y much taller than these outlines, so the bit reads as a wide blade. */
const HEAD_X=1.15,HEAD_Y=1.45,HAFT_W=1.25;
const HEADS={
  flared:[[-.062,-.03,.008],[.02,-.034,.03],[.115,-.058,.004],[.128,-.002,.06],[.115,.056,.004],[.02,.034,.03],[-.062,.03,.008]],
  'single-bit':[[-.07,-.036,.006],[-.03,-.042,.01],[.03,-.036,.03],[.15,-.07,.004],[.163,-.004,.08],[.15,.066,.004],[.03,.036,.03],[-.03,.042,.01],[-.07,.036,.006]],
  bearded:[[-.072,-.036,.006],[-.03,-.044,.01],[.04,-.038,.03],[.162,-.078,.004],[.178,0,.1],[.152,.118,.004],[.1,.07,.05],[.04,.04,.02],[-.03,.044,.01],[-.072,.036,.006]]
};
function roundPoly(ctx,pts,k){ /* a closed outline with rounded corners (radius per point, scaled by k) */
  const n=pts.length;ctx.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];const s=m(pts[n-1],pts[0]);ctx.moveTo(s[0]*k,s[1]*k);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],e=m(p,q);ctx.arcTo(p[0]*k,p[1]*k,e[0]*k,e[1]*k,p[2]*k)}ctx.closePath()}

/* the haft: a slight S along its belly, a swell knob at the bottom, a flared shoulder under the head. t=0 knob, t=1 top. */
function haftAt(t){const x=.014*Math.sin(t*Math.PI*1.7+.3)-.006,y=-t;
  const w=t<.05?.026+.012*Math.sin(t/.05*Math.PI*.9):t<.2?.021:t<.78?.021+.003*Math.sin((t-.2)/.58*Math.PI):t<.88?.023+.008*(t-.78)/.1:.031-.004*(t-.88)/.12;
  return[x,y,w*HAFT_W]}

function drawAx(ctx,tier,x,y,size,angle,o){o=o||{};const T=typeof tier==='object'?tier:AXES[Math.max(0,Math.min(2,tier|0))],L=size,detail=lod(size*.45),R=(s=>()=>{s=(s*16807)%2147483647;return s/2147483647})(T.tier*97+13);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle||0);if(o.mirror)ctx.scale(-1,1);ctx.lineJoin='round';ctx.lineCap='round';
  /* ---- haft ---- */
  const N=40,left=[],right=[];for(let i=0;i<=N;i++){const t=i/N,[hx,hy,hw]=haftAt(t);left.push([(hx-hw)*L,hy*L]);right.push([(hx+hw)*L,hy*L])}
  const top=haftAt(1);
  ctx.beginPath();left.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));for(let i=N;i>=0;i--)ctx.lineTo(right[i][0],right[i][1]);ctx.closePath();
  const g=ctx.createLinearGradient(-.03*L,0,.03*L,0);g.addColorStop(0,lighten(T.haft,.28));g.addColorStop(.45,T.haft);g.addColorStop(1,darken(T.haft,.32));ctx.fillStyle=g;ctx.fill();
  if(detail!=='icon'){ /* straight grain along the haft (in-line grain, as a good haft should have) */
    ctx.save();ctx.clip();ctx.strokeStyle=T.grain;ctx.globalAlpha=.45;ctx.lineWidth=Math.max(.6,L*.0035);
    for(let k=0;k<5;k++){const off=-.018+k*.009+(R()-.5)*.004;ctx.beginPath();for(let i=0;i<=N;i++){const t=i/N,[hx,hy]=haftAt(t);const xx=(hx+off+.003*Math.sin(t*9+k))*L;i?ctx.lineTo(xx,hy*L):ctx.moveTo(xx,hy*L)}ctx.stroke()}
    /* a few darker streaks: hickory heartwood */
    if(T.wood==='hickory'){ctx.globalAlpha=.25;ctx.lineWidth=L*.008;ctx.beginPath();for(let i=0;i<=N;i++){const t=i/N,[hx,hy]=haftAt(t);const xx=(hx+.006*Math.sin(t*5))*L;i?ctx.lineTo(xx,hy*L):ctx.moveTo(xx,hy*L)}ctx.stroke()}
    ctx.restore()}
  ctx.strokeStyle=darken(T.haft,.5);ctx.lineWidth=Math.max(.8,L*.004);ctx.beginPath();left.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));for(let i=N;i>=0;i--)ctx.lineTo(right[i][0],right[i][1]);ctx.closePath();ctx.stroke();
  /* grip wrap (best ax): gold-wire rings over leather */
  if(T.wrap){const a=.06,b=.24;ctx.fillStyle='#4a2c1a';ctx.beginPath();for(let i=0;i<=10;i++){const t=a+(b-a)*i/10,[hx,hy,hw]=haftAt(t);i?ctx.lineTo((hx-hw*1.08)*L,hy*L):ctx.moveTo((hx-hw*1.08)*L,hy*L)}for(let i=10;i>=0;i--){const t=a+(b-a)*i/10,[hx,hy,hw]=haftAt(t);ctx.lineTo((hx+hw*1.08)*L,hy*L)}ctx.closePath();ctx.fill();
    for(let k=0;k<=(detail==='icon'?2:7);k++){const t=a+(b-a)*k/(detail==='icon'?2:7),[hx,hy,hw]=haftAt(t);ctx.strokeStyle=T.wrap;ctx.lineWidth=Math.max(1,L*.007);ctx.beginPath();ctx.moveTo((hx-hw*1.1)*L,hy*L+L*.004);ctx.lineTo((hx+hw*1.1)*L,hy*L-L*.004);ctx.stroke()}}
  /* ---- head ---- */
  const ex=top[0]*L,ey=-.93*L;ctx.save();ctx.translate(ex,ey);ctx.scale(HEAD_X,HEAD_Y);
  const pts=HEADS[T.head_shape];roundPoly(ctx,pts,L);
  const mg=ctx.createLinearGradient(0,-.08*L,0,.12*L);mg.addColorStop(0,lighten(T.head,.38));mg.addColorStop(.35,T.head);mg.addColorStop(1,darken(T.head,.45));ctx.fillStyle=mg;ctx.fill();
  ctx.save();ctx.clip();
  /* the cheek's shallow hollow catches a soft highlight; the poll side is in shade */
  const cg=ctx.createRadialGradient(.03*L,-.012*L,0,.03*L,-.012*L,.07*L);cg.addColorStop(0,'rgba(255,255,255,.22)');cg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=cg;ctx.fillRect(-.1*L,-.1*L,.3*L,.25*L);
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-.09*L,-.1*L,.045*L,.25*L);
  /* bevel: a lighter, ground band along the cutting edge, and the bright edge itself */
  const ex0=T.head_shape==='flared'?.1:T.head_shape==='bearded'?.145:.135;
  const bg=ctx.createLinearGradient(ex0*L,0,(ex0+.05)*L,0);bg.addColorStop(0,'rgba(255,255,255,0)');bg.addColorStop(.25,lighten(T.head,.5));bg.addColorStop(1,T.edge);ctx.fillStyle=bg;ctx.fillRect(ex0*L,-.12*L,.08*L,.26*L);
  if(T.tier===1&&detail!=='icon'){ /* temper line: where the hardened edge meets the softer body */
    ctx.strokeStyle='rgba(40,46,54,.35)';ctx.lineWidth=Math.max(.6,L*.003);ctx.beginPath();for(let i=0;i<=12;i++){const v=-.07+.14*i/12;ctx.lineTo((ex0-.006+.004*Math.sin(i*1.7))*L,v*L)}ctx.stroke()}
  if(T.metal==='bronze'&&detail!=='icon'){ /* verdigris in the hollows and casting pits */
    for(let i=0;i<14;i++){const px=(-.05+R()*.15)*L,py=(-.03+R()*.06)*L;ctx.fillStyle=`rgba(90,160,140,${.18+R()*.25})`;ctx.beginPath();ctx.arc(px,py,L*(.002+R()*.005),0,7);ctx.fill()}}
  if(T.metal==='starmetal'){ /* star speckle in the dark metal */
    for(let i=0;i<(detail==='icon'?6:26);i++){const px=(-.06+R()*.2)*L,py=(-.06+R()*.16)*L,r=L*(.0015+R()*.003);ctx.fillStyle=`rgba(220,235,255,${.4+R()*.6})`;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill()}
    /* a gold inlay line along the cheek */
    ctx.strokeStyle='#d9ac4a';ctx.lineWidth=Math.max(.8,L*.004);ctx.beginPath();ctx.moveTo(-.04*L,-.022*L);ctx.quadraticCurveTo(.06*L,-.03*L,.12*L,-.05*L);ctx.stroke()}
  ctx.restore();
  /* outline (a darker version of the metal, never black) */
  roundPoly(ctx,pts,L);ctx.strokeStyle=darken(T.head,.55);ctx.lineWidth=Math.max(.8,L*.005);ctx.stroke();
  /* cutting edge: a thin bright line, flashing on a strike */
  {const ed=T.head_shape==='flared'?[[.115,-.056],[.128,0],[.115,.054]]:T.head_shape==='bearded'?[[.16,-.074],[.178,0],[.15,.114]]:[[.15,-.066],[.163,0],[.15,.062]];
    ctx.strokeStyle=T.edge;ctx.lineWidth=Math.max(.8,L*.004);ctx.beginPath();ctx.moveTo(ed[0][0]*L,ed[0][1]*L);ctx.quadraticCurveTo(ed[1][0]*L*1.03,ed[1][1]*L,ed[2][0]*L,ed[2][1]*L);ctx.stroke();
    if(o.glint){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,250,225,${o.glint})`;ctx.lineWidth=L*.012;ctx.stroke();ctx.restore()}}
  /* lugs above and below the eye (forged heads) */
  if(T.lugs){ctx.fillStyle=darken(T.head,.1);for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(-.012*L,s*.042*L,.02*L,.008*L,0,0,7);ctx.fill();ctx.strokeStyle=darken(T.head,.55);ctx.lineWidth=Math.max(.6,L*.003);ctx.stroke()}}
  /* the haft's end through the top of the eye, with the wedge kerf */
  ctx.fillStyle=lighten(T.haft,.15);ctx.fillRect(-.02*L,-.046*L,.04*L,.007*L);if(detail!=='icon'){ctx.strokeStyle=darken(T.haft,.5);ctx.lineWidth=Math.max(.6,L*.003);ctx.beginPath();ctx.moveTo(-.016*L,-.044*L);ctx.lineTo(.016*L,-.044*L);ctx.stroke()}
  /* maker's mark on the cheek: a triangle in a circle (the Signet Ring's seal) */
  if(detail==='detail'){ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=L*.0025;ctx.beginPath();ctx.arc(.0*L,.008*L,.011*L,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-.0*L);ctx.lineTo(.009*L,.014*L);ctx.lineTo(-.009*L,.014*L);ctx.closePath();ctx.stroke()}
  ctx.restore();ctx.restore()}

/* the swing, seen from the side: the ax is drawn mirrored (bit to the left), raised back behind the hands, then brought
   down hard so the bit bites into whatever lies to the left of the hands, and bounces off.
   swing(u).angle is the angle to pass to drawAx with {mirror:true}; bitPoint gives where the bit is for a given angle. */
const HIT=.55,STRIKE=-1.2;
function swing(u){u=Math.max(0,Math.min(1,u));let a;
  if(u<.3){const k=u/.3;a=-.25+.85*(1-(1-k)*(1-k))}                     /* wind-up: lift back over the shoulder */
  else if(u<HIT){const k=(u-.3)/(HIT-.3);a=.6+(STRIKE-.6)*k*k*k}          /* strike: accelerating down */
  else{const k=(u-HIT)/(1-HIT);a=STRIKE+.32*Math.sin(k*Math.PI)*(1-k*.5)+.12*k} /* bounce off, settle */
  return{angle:a,lift:u<HIT?0:Math.sin((u-HIT)/(1-HIT)*Math.PI)*.04}}
/* the middle of the cutting edge, relative to the knob, for an ax `size` px long at `angle` (mirrored, as in the swing) */
function bitPoint(tier,size,angle,mirror){const T=AXES[Math.max(0,Math.min(2,tier|0))],ex=T.head_shape==='flared'?.125:T.head_shape==='bearded'?.17:.16,top=haftAt(1);
  let x=(top[0]+ex*HEAD_X)*size,y=-.93*size;if(mirror!==false)x=-x;const c=Math.cos(angle),s=Math.sin(angle);return[x*c-y*s,x*s+y*c]}

window.TOOLS={AXES,drawAx,swing,bitPoint,HIT,STRIKE};
})();
