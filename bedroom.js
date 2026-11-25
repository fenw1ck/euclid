/* Bedroom furniture: beds in six styles, a nightstand with drawers, nightlights, and mobiles. Needs core.js.
   Research: research/objects/furniture/ (bed, nightstand, nightlight, mobile). Sizes in metres (1 unit = about 1 m).

   BEDROOM.bed(ctx, x, y, size, type, seed, o)
     type   'canopy' | 'tree-of-life' | 'art-deco' | 'four-post' | 'bunk' | 'futon'   (BEDROOM.BEDS)
     x, y   where the bed stands: the middle of its foot (front view) or of its long side (side view), on the floor
     size   px per metre
     o      view 'front' (from the foot, headboard behind) | 'side' (head at the left; o.mirror puts it at the right)
   BEDROOM.nightstand(ctx, x, y, size, seed, o)   a bedside table with two drawers (size = px per metre); o.light: a nightlight on top
   BEDROOM.nightlight(ctx, x, y, size, kind, t)    'cylinder' | 'sphere' | 'fireflies' (a jar of them), standing on (x, y)
   BEDROOM.mobile(ctx, x, y, size, theme, seed, t) hanging from a ceiling hook at (x, y); theme 'planes' | 'woodland' | 'space'
   Light from the upper left. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('bedroom.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry}=A;
const BEDS=['canopy','tree-of-life','art-deco','four-post','bunk','futon'],LIGHTS=['cylinder','sphere','fireflies'],MOBILES=['planes','woodland','space'];
const WOOD=['#5a3820','#7a4e2a','#3e2616','#8a5e36'],QUILT=['#c9d6e8','#e8c9c9','#d6e2c4','#efe2c0','#b9c4dc','#e0cfe6'],ACC=['#7a2a2a','#2f4a6a','#3a5a3a','#6a4a7a'];
const pick=(R,a)=>a[Math.floor(R()*a.length)];
function rr(ctx,x,y,w,h,r,f){ctx.beginPath();ctx.roundRect(x,y,w,h,Math.max(0,Math.min(r,Math.abs(w)/2,Math.abs(h)/2)));ctx.fillStyle=f;ctx.fill()}
function post(ctx,x,y0,y1,w,wood,finial){const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,lighten(wood,.25));g.addColorStop(1,darken(wood,.3));ctx.fillStyle=g;ctx.fillRect(x-w/2,y1,w,y0-y1);
  ctx.fillStyle=wood;for(let k=1;k<4;k++){const yy=y1+(y0-y1)*k/4;ctx.beginPath();ctx.ellipse(x,yy,w*.75,w*.3,0,0,7);ctx.fill()}
  if(finial){ctx.fillStyle=lighten(wood,.1);ctx.beginPath();ctx.ellipse(x,y1-w*.6,w*.55,w*.8,0,0,7);ctx.fill()}}
function quilt(ctx,x,y,w,h,col,acc){const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,lighten(col,.2));g.addColorStop(1,darken(col,.12));rr(ctx,x,y,w,h,Math.min(w,h)*.12,g);
  ctx.strokeStyle=mix(col,acc,.35);ctx.lineWidth=Math.max(1,h*.04);ctx.beginPath();ctx.moveTo(x+w*.04,y+h*.25);ctx.lineTo(x+w*.96,y+h*.25);ctx.stroke()}
function pillow(ctx,x,y,w,h){const g=ctx.createRadialGradient(x+w*.35,y+h*.3,0,x+w/2,y+h/2,w*.6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#d9d4c8');rr(ctx,x,y,w,h,h*.45,g)}

/* ---- headboards (front view), drawn in metres from the floor at the head of the bed ---- */
function headboard(ctx,type,k,wood,acc,R){const W=1.0*k;
  if(type==='tree-of-life'){ /* an arched panel carved with a tree: roots, trunk, branching crown */
    ctx.fillStyle=wood;ctx.beginPath();ctx.moveTo(-W*.5,-.55*k);ctx.lineTo(-W*.5,-1.05*k);ctx.quadraticCurveTo(0,-1.55*k,W*.5,-1.05*k);ctx.lineTo(W*.5,-.55*k);ctx.closePath();ctx.fill();
    ctx.strokeStyle=lighten(wood,.35);ctx.lineWidth=Math.max(1,k*.012);const br=(x,y,a,l,d)=>{if(d<0||l<k*.02)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;ctx.lineWidth=Math.max(.8,d*k*.006);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();br(x2,y2,a-.45-R()*.15,l*.72,d-1);br(x2,y2,a+.45+R()*.15,l*.72,d-1)};
    br(0,-.62*k,-Math.PI/2,.2*k,6);for(const a of[2.4,2.8,.7,.3]){ctx.beginPath();ctx.moveTo(0,-.62*k);ctx.lineTo(Math.cos(a)*.18*k,-.62*k+Math.sin(a)*.06*k);ctx.stroke()}
    ctx.beginPath();ctx.arc(0,-1.0*k,.33*k,0,7);ctx.stroke()}
  else if(type==='art-deco'){ /* stepped edges and a sunburst fan with gold lines */
    const lac=pick(R,['#1d1d22','#efe6d2','#2b3a4a']);ctx.fillStyle=lac;ctx.beginPath();ctx.moveTo(-W*.52,-.55*k);ctx.lineTo(-W*.52,-1.0*k);ctx.lineTo(-W*.4,-1.0*k);ctx.lineTo(-W*.4,-1.12*k);ctx.lineTo(-W*.26,-1.12*k);ctx.arc(0,-1.12*k,W*.26,Math.PI,0);ctx.lineTo(W*.4,-1.12*k);ctx.lineTo(W*.4,-1.0*k);ctx.lineTo(W*.52,-1.0*k);ctx.lineTo(W*.52,-.55*k);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#d4a94a';ctx.lineWidth=Math.max(1,k*.01);for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/8;ctx.beginPath();ctx.moveTo(0,-.62*k);ctx.lineTo(Math.cos(a)*W*.36,-1.1*k+Math.sin(a)*W*.22+(-.62*k+1.1*k)*0);ctx.stroke()}
    ctx.beginPath();ctx.arc(0,-1.12*k,W*.22,Math.PI,0);ctx.stroke();ctx.strokeRect(-W*.48,-.98*k,W*.96,.4*k)}
  else{ /* panelled wooden headboard */
    rr(ctx,-W*.48,-1.12*k,W*.96,.6*k,k*.04,wood);ctx.strokeStyle=lighten(wood,.2);ctx.lineWidth=Math.max(1,k*.008);ctx.strokeRect(-W*.4,-1.04*k,W*.36,.42*k);ctx.strokeRect(W*.04,-1.04*k,W*.36,.42*k)}}

function bed(ctx,x,y,size,type,seed,o){o=o||{};const R=rngMulberry(seed*97+11),wood=pick(R,WOOD),q=pick(R,QUILT),acc=pick(R,ACC),k=size;
  ctx.save();ctx.translate(x,y);if(o.mirror)ctx.scale(-1,1);ctx.lineJoin='round';
  const shadow=(w)=>{ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,0,w*.55,k*.08,0,0,7);ctx.fill()};
  if(o.view==='side'){const L=2.05*k;shadow(L);
    if(type==='futon'){rr(ctx,-L*.5,-.05*k,L,.05*k,1,'#cdb87a');rr(ctx,-L*.48,-.15*k,L*.96,.1*k,k*.04,'#f2efe6');quilt(ctx,-L*.25,-.2*k,L*.72,.08*k,q,acc);pillow(ctx,-L*.46,-.22*k,L*.16,.08*k);ctx.restore();return}
    const lv=type==='bunk'?[0,1.0]:[0];
    for(const l of lv){const off=-l*k;ctx.fillStyle=wood;ctx.fillRect(-L*.48,off-.38*k,L*.96,.1*k);rr(ctx,-L*.47,off-.56*k,L*.94,.2*k,k*.05,'#f4f1e8');quilt(ctx,-L*.3,off-.6*k,L*.76,.24*k,q,acc);pillow(ctx,-L*.46,off-.66*k,L*.17,.12*k)}
    const top=type==='canopy'||type==='four-post'?-2.0*k:type==='bunk'?-1.75*k:null,hb=type==='art-deco'?-1.15*k:type==='tree-of-life'?-1.3*k:-1.1*k;
    rr(ctx,-L*.52,hb,.07*k,-hb,k*.02,type==='art-deco'?'#1d1d22':wood);post(ctx,-L*.5,0,top||hb,.07*k,wood,type==='four-post');post(ctx,L*.5,0,top||-.7*k,.07*k,wood,type==='four-post');
    if(type!=='bunk'&&!top)rr(ctx,L*.46,-.72*k,.06*k,.72*k,k*.02,wood);
    if(type==='canopy'){ctx.fillStyle=wood;ctx.fillRect(-L*.52,top,L*1.04,.06*k);ctx.fillStyle=mix(q,'#ffffff',.3);ctx.beginPath();ctx.moveTo(-L*.52,top+.06*k);for(let i=0;i<=10;i++)ctx.lineTo(-L*.52+L*1.04*i/10,top+.06*k+(i%2?.14:.1)*k);ctx.lineTo(L*.52,top+.06*k);ctx.fill();
      ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(-L*.5,top);ctx.quadraticCurveTo(-L*.42,-1.0*k,-L*.5,-.3*k);ctx.lineTo(-L*.47,-.3*k);ctx.quadraticCurveTo(-L*.36,-1.0*k,-L*.35,top);ctx.fill();ctx.globalAlpha=1}
    if(type==='bunk'){ctx.fillStyle=wood;ctx.fillRect(-L*.2,-1.62*k,L*.5,.05*k);for(let i=0;i<5;i++)ctx.fillRect(L*.36,-(.2+i*.28)*k,L*.1,.04*k);ctx.fillRect(L*.35,-1.5*k,.03*k,1.5*k);ctx.fillRect(L*.45,-1.5*k,.03*k,1.5*k)}
    ctx.restore();return}
  /* front view, from the foot of the bed */
  shadow(1.1*k);
  if(type==='futon'){ /* tatami mat on the floor, a thick mattress, a folded duvet and a small pillow */
    ctx.fillStyle='#cdb87a';ctx.beginPath();ctx.moveTo(-.62*k,0);ctx.lineTo(.62*k,0);ctx.lineTo(.5*k,-.28*k);ctx.lineTo(-.5*k,-.28*k);ctx.closePath();ctx.fill();ctx.strokeStyle='#3a5a3a';ctx.lineWidth=Math.max(1,k*.02);ctx.stroke();
    ctx.fillStyle='#f2efe6';ctx.beginPath();ctx.moveTo(-.48*k,-.02*k);ctx.lineTo(.48*k,-.02*k);ctx.lineTo(.4*k,-.24*k);ctx.lineTo(-.4*k,-.24*k);ctx.closePath();ctx.fill();ctx.fillStyle=darken('#f2efe6',.12);ctx.fillRect(-.48*k,-.06*k,.96*k,.06*k);
    quilt(ctx,-.42*k,-.16*k,.84*k,.1*k,q,acc);pillow(ctx,-.14*k,-.27*k,.28*k,.07*k);ctx.restore();return}
  const tall=type==='canopy'||type==='four-post',topY=type==='bunk'?-1.75*k:-2.0*k;
  /* back posts and headboard */
  if(tall||type==='bunk')for(const s of[-1,1])post(ctx,s*.46*k,-.55*k,topY,.06*k,wood,type==='four-post');
  if(type==='bunk'){ /* two beds stacked, a ladder at the front right */
    for(const l of[1.0,0]){const off=-l*k;rr(ctx,-.5*k,off-.45*k,1.0*k,.12*k,k*.02,wood);quilt(ctx,-.47*k,off-.6*k,.94*k,.17*k,q,acc);pillow(ctx,-.2*k,off-.68*k,.4*k,.09*k);rr(ctx,-.5*k,off-.55*k,1.0*k,.09*k,k*.02,darken(wood,.1))}
    ctx.fillStyle=wood;ctx.fillRect(-.5*k,-1.78*k,1.0*k,.06*k);for(const s of[-1,1])post(ctx,s*.5*k,0,topY,.07*k,wood,false);
    for(let i=0;i<5;i++)ctx.fillRect(.18*k,-(.22+i*.28)*k,.26*k,.035*k);ctx.fillRect(.16*k,-1.5*k,.035*k,1.5*k);ctx.fillRect(.42*k,-1.5*k,.035*k,1.5*k);ctx.restore();return}
  headboard(ctx,type,k,wood,acc,R);
  /* mattress top, pillows, quilt hanging over the foot */
  ctx.fillStyle='#f4f1e8';ctx.beginPath();ctx.moveTo(-.5*k,-.48*k);ctx.lineTo(.5*k,-.48*k);ctx.lineTo(.45*k,-.66*k);ctx.lineTo(-.45*k,-.66*k);ctx.closePath();ctx.fill();
  for(const s of[-1,1])pillow(ctx,s*.22*k-.17*k,-.72*k,.34*k,.11*k);
  ctx.fillStyle=q;ctx.beginPath();ctx.moveTo(-.51*k,-.47*k);ctx.lineTo(.51*k,-.47*k);ctx.lineTo(.46*k,-.6*k);ctx.lineTo(-.46*k,-.6*k);ctx.closePath();ctx.fill();
  quilt(ctx,-.52*k,-.48*k,1.04*k,.3*k,q,acc);
  /* the footboard and front posts */
  rr(ctx,-.5*k,-.32*k,1.0*k,.28*k,k*.02,type==='art-deco'?'#1d1d22':wood);if(type==='art-deco'){ctx.strokeStyle='#d4a94a';ctx.lineWidth=Math.max(1,k*.01);ctx.strokeRect(-.45*k,-.28*k,.9*k,.2*k)}
  for(const s of[-1,1])post(ctx,s*.5*k,0,tall?topY:-.42*k,.07*k,wood,type==='four-post');
  if(type==='canopy'){ctx.fillStyle=wood;ctx.fillRect(-.53*k,topY,1.06*k,.06*k);const fab=mix(q,'#ffffff',.3);ctx.fillStyle=fab;ctx.beginPath();ctx.moveTo(-.53*k,topY+.06*k);for(let i=0;i<=8;i++)ctx.lineTo(-.53*k+1.06*k*i/8,topY+(i%2?.2:.14)*k);ctx.lineTo(.53*k,topY+.06*k);ctx.fill();
    ctx.globalAlpha=.6;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*.53*k,topY+.1*k);ctx.quadraticCurveTo(s*.38*k,-1.1*k,s*.5*k,-.2*k);ctx.lineTo(s*.56*k,-.2*k);ctx.quadraticCurveTo(s*.56*k,-1.1*k,s*.56*k,topY+.1*k);ctx.fill()}ctx.globalAlpha=1}
  ctx.restore()}

function nightlight(ctx,x,y,s,kind,t){t=t||0;ctx.save();ctx.translate(x,y);const glow=(cx,cy,r,a,c)=>{const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill()};
  if(kind==='sphere'){glow(0,-.09*s,.5*s,.5,'255,210,140');ctx.fillStyle='#7a5a3a';ctx.fillRect(-.05*s,-.02*s,.1*s,.02*s);const g=ctx.createRadialGradient(-.02*s,-.11*s,0,0,-.09*s,.07*s);g.addColorStop(0,'#fffbe8');g.addColorStop(1,'#f2c87a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-.09*s,.07*s,0,7);ctx.fill()}
  else if(kind==='fireflies'){ /* a glass jar with a lid, fireflies blinking inside */
    ctx.fillStyle='rgba(190,220,230,.28)';ctx.beginPath();ctx.roundRect(-.06*s,-.2*s,.12*s,.2*s,.02*s);ctx.fill();ctx.strokeStyle='rgba(230,245,250,.7)';ctx.lineWidth=Math.max(1,s*.006);ctx.stroke();
    ctx.fillStyle='#8a7a5a';ctx.fillRect(-.055*s,-.225*s,.11*s,.03*s);
    for(let i=0;i<6;i++){const a=Math.sin(t*2.3+i*1.7),on=Math.max(0,Math.sin(t*1.7+i*2.1)),px=Math.sin(t*.7+i*2)*.04*s,py=-.1*s+Math.cos(t*.9+i)*.07*s;if(on>.2){glow(px,py,.05*s*on,.8*on,'230,255,120');ctx.fillStyle=`rgba(250,255,190,${on})`;ctx.beginPath();ctx.arc(px,py,Math.max(.8,.006*s),0,7);ctx.fill()}}}
  else{glow(0,-.1*s,.45*s,.45,'255,220,160');ctx.fillStyle='#6a5a4a';ctx.fillRect(-.05*s,-.02*s,.1*s,.02*s);const g=ctx.createLinearGradient(-.04*s,0,.04*s,0);g.addColorStop(0,'#fff6dc');g.addColorStop(1,'#f0c886');ctx.fillStyle=g;ctx.fillRect(-.04*s,-.18*s,.08*s,.16*s);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-.03*s,-.17*s,.015*s,.14*s)}
  ctx.restore()}

function nightstand(ctx,x,y,s,seed,o){o=o||{};const R=rngMulberry(seed*61+2),wood=pick(R,WOOD),w=.48*s,h=.58*s;ctx.save();ctx.translate(x,y);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,0,w*.6,s*.05,0,0,7);ctx.fill();
  ctx.fillStyle=darken(wood,.2);for(const lx of[-.45,.37])ctx.fillRect(lx*w,-.1*s,w*.08,.1*s);
  rr(ctx,-w/2,-h,w,h-.08*s,s*.01,wood);ctx.fillStyle=lighten(wood,.18);ctx.fillRect(-w*.54,-h-.03*s,w*1.08,.035*s);
  for(let i=0;i<2;i++){const y0=-h+.06*s+i*.21*s;rr(ctx,-w*.42,y0,w*.84,.17*s,s*.01,lighten(wood,.06));ctx.strokeStyle=darken(wood,.35);ctx.lineWidth=Math.max(1,s*.005);ctx.strokeRect(-w*.42,y0,w*.84,.17*s);
    ctx.fillStyle='#c9a24a';ctx.beginPath();ctx.arc(0,y0+.085*s,Math.max(1,.012*s),0,7);ctx.fill()}
  ctx.restore();if(o.light)nightlight(ctx,x-w*.15,y-h-.03*s,s,o.light,o.t)}

/* ---- mobiles: a crossbar turning slowly, figures on threads, each turning on its own ---- */
function figure(ctx,theme,i,s,R){const c=(a)=>a[i%a.length];
  if(theme==='planes'){const kind=c(['cub','biplane','floats','cessna']),body=kind==='cub'?'#f2c230':kind==='biplane'?'#c8362f':kind==='floats'?'#3d6fb0':'#f2f2f2';
    ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,s*.5,s*.12,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(-s*.45,0);ctx.lineTo(-s*.6,-s*.22);ctx.lineTo(-s*.4,-s*.05);ctx.fill(); /* fuselage, tail */
    ctx.fillStyle=darken(body,.15);ctx.fillRect(-s*.15,-s*.2,s*.36,s*.07);if(kind==='biplane')ctx.fillRect(-s*.15,s*.1,s*.36,s*.07); /* wings (high wing; a second for the biplane) */
    if(kind==='cessna'){ctx.fillStyle='#2f5aa0';ctx.fillRect(-s*.45,-s*.02,s*.85,s*.04)}
    ctx.fillStyle='#333';ctx.fillRect(s*.48,-s*.16,s*.03,s*.32); /* propeller */
    if(kind==='floats'){ctx.fillStyle='#ddd';ctx.beginPath();ctx.ellipse(0,s*.28,s*.38,s*.05,0,0,7);ctx.fill();ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-s*.1,s*.1);ctx.lineTo(-s*.1,s*.24);ctx.moveTo(s*.15,s*.1);ctx.lineTo(s*.15,s*.24);ctx.stroke()}
    else{ctx.fillStyle='#222';ctx.beginPath();ctx.arc(s*.1,s*.2,s*.05,0,7);ctx.fill()}}
  else if(theme==='woodland'){const kind=c(['fox','rabbit','hedgehog','owl']);
    if(kind==='fox'){ctx.fillStyle='#d9682a';ctx.beginPath();ctx.moveTo(-s*.3,-s*.25);ctx.lineTo(-s*.15,-s*.05);ctx.lineTo(s*.15,-s*.05);ctx.lineTo(s*.3,-s*.25);ctx.lineTo(s*.25,s*.1);ctx.lineTo(0,s*.32);ctx.lineTo(-s*.25,s*.1);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-s*.2,s*.08);ctx.lineTo(0,s*.32);ctx.lineTo(s*.2,s*.08);ctx.lineTo(0,s*.18);ctx.fill()}
    else if(kind==='rabbit'){ctx.fillStyle='#a49a90';ctx.beginPath();ctx.ellipse(0,s*.1,s*.22,s*.2,0,0,7);ctx.fill();for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(sd*s*.08,-s*.22,s*.06,s*.2,sd*.15,0,7);ctx.fill()}ctx.fillStyle='#e8b8c0';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(sd*s*.08,-s*.22,s*.03,s*.14,sd*.15,0,7);ctx.fill()}}
    else if(kind==='hedgehog'){ctx.fillStyle='#6a4a2a';ctx.beginPath();for(let k=0;k<=12;k++){const a=Math.PI+k*Math.PI/12,r=k%2?s*.3:s*.38;ctx.lineTo(Math.cos(a)*r,s*.1+Math.sin(a)*r)}ctx.fill();ctx.fillStyle='#d8b88c';ctx.beginPath();ctx.ellipse(s*.28,s*.08,s*.12,s*.08,0,0,7);ctx.fill()}
    else{ctx.fillStyle='#8a6a4a';ctx.beginPath();ctx.ellipse(0,s*.05,s*.22,s*.3,0,0,7);ctx.fill();ctx.fillStyle='#f2e6c8';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*s*.09,-s*.08,s*.08,0,7);ctx.fill()}ctx.fillStyle='#222';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*s*.09,-s*.08,s*.035,0,7);ctx.fill()}ctx.fillStyle='#e0a030';ctx.beginPath();ctx.moveTo(-s*.03,0);ctx.lineTo(s*.03,0);ctx.lineTo(0,s*.06);ctx.fill()}
    ctx.fillStyle='#222';if(kind!=='owl'){ctx.beginPath();ctx.arc(kind==='hedgehog'?s*.33:s*.07,kind==='hedgehog'?s*.05:s*.05,s*.025,0,7);ctx.fill()}}
  else{const kind=c(['star','ringed','moon','planet']);
    if(kind==='star'){ctx.fillStyle='#f2d04a';ctx.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?s*.13:s*.32;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.fill()}
    else if(kind==='moon'){ctx.fillStyle='#efe6c0';ctx.beginPath();ctx.arc(0,0,s*.28,0,7);ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(s*.12,-s*.06,s*.24,0,7);ctx.fill();ctx.globalCompositeOperation='source-over'}
    else{const col=kind==='ringed'?'#d9a86a':pick(R,['#5a8ad0','#c9584a','#7ab07a']),g=ctx.createRadialGradient(-s*.08,-s*.08,0,0,0,s*.25);g.addColorStop(0,lighten(col,.35));g.addColorStop(1,darken(col,.25));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,s*.22,0,7);ctx.fill();
      if(kind==='ringed'){ctx.strokeStyle='#f2dca0';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.ellipse(0,0,s*.4,s*.09,-.3,0,7);ctx.stroke()}}}}
function mobile(ctx,x,y,size,theme,seed,t){t=t||0;const R=rngMulberry(seed*41+7),s=size,spin=Math.cos(t*.35+seed),drop=.25*s;ctx.save();ctx.translate(x,y);
  ctx.strokeStyle='rgba(230,225,210,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,drop);ctx.stroke();
  const bar=.32*s*spin;ctx.strokeStyle='#8a6a40';ctx.lineWidth=Math.max(1,s*.012);ctx.beginPath();ctx.moveTo(-bar,drop);ctx.lineTo(bar,drop);ctx.stroke();
  const ends=[[-bar,.2],[bar,.28],[-bar*.35,.38],[bar*.4,.16]];
  ends.forEach(([ex,len],i)=>{const yy=drop+len*s;ctx.strokeStyle='rgba(230,225,210,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex,drop);ctx.lineTo(ex,yy-.06*s);ctx.stroke();
    ctx.save();ctx.translate(ex,yy);ctx.scale(Math.max(.2,Math.abs(Math.cos(t*.6+i*1.3)))*(Math.cos(t*.6+i*1.3)<0?-1:1),1);figure(ctx,theme,i,.16*s,R);ctx.restore()});
  ctx.restore()}

window.BEDROOM={bed,nightstand,nightlight,mobile,BEDS,LIGHTS,MOBILES};
})();
