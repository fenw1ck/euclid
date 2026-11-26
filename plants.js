/* Plant symbols, shared by the Planting Guide (github.com/fenw1ck/Planting-Guide) and the Euclid game (github.com/fenw1ck/euclid).
   The same file lives in both repositories: change it in one, copy it to the other.
   Leaves, fruit and pots are reworked here to look more lifelike: shading, glints and veins.
   window.PLANTS.list  the plants (the Planting Guide's 50, and a cherry tomato) (name, silhouette, colours, mature size)
   window.PLANTS.draw(ctx,plant,x,y,w,h,stage,seed)   draws one plant standing on (x,y), with a shadow
   window.PLANTS.drawRaw(...)                         the same, with no shadow (the Planting Guide's own drawPlant)
   stage: seedling, young, mature (default), past, dormant, dead */
(function(){
"use strict";
function hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const A=hexToRgb(a),B=hexToRgb(b);return rgbToHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function darken(a,t){return mix(a,'#000000',t)}
function lighten(a,t){return mix(a,'#ffffff',t)}
function rng(seed){let s=(seed*9301+49297)%233280||1;return()=>{s=(s*9301+49297)%233280;return s/233280}}

/* a rounded mass: lit from the upper left, shaded underneath */
function ell(ctx,x,y,rx,ry,rot,fill,stroke){rx=Math.max(.5,rx);ry=Math.max(.5,ry);ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);
if(fill){if(typeof fill==='string'&&fill[0]==='#'&&Math.max(rx,ry)>2.5){const r=Math.max(rx,ry),g=ctx.createRadialGradient(x-rx*.35,y-ry*.4,r*.05,x,y,r*1.05);g.addColorStop(0,lighten(fill,.26));g.addColorStop(.55,fill);g.addColorStop(1,darken(fill,.28));ctx.fillStyle=g}else ctx.fillStyle=fill;ctx.fill();if(typeof fill==='string'&&fill[0]==='#'&&Math.min(rx,ry)>9&&greenish(fill))dapple(ctx,x,y,rx,ry,rot,fill)}
if(stroke){ctx.save();ctx.globalAlpha*=.55;ctx.strokeStyle=stroke;ctx.lineWidth=.7;ctx.stroke();ctx.restore()}}
/* a trunk that tapers upward and flares at the ground, with bark shading and a few furrows */
function trunk(ctx,x,y,tw,th){const fill=typeof ctx.fillStyle==='string'&&ctx.fillStyle[0]==='#'?ctx.fillStyle:'#6b4a2a';ctx.save();ctx.beginPath();ctx.moveTo(x-tw*.85,y);ctx.quadraticCurveTo(x-tw*.45,y-th*.15,x-tw*.38,y-th);ctx.lineTo(x+tw*.38,y-th);ctx.quadraticCurveTo(x+tw*.45,y-th*.15,x+tw*.85,y);ctx.closePath();
const g=ctx.createLinearGradient(x-tw*.6,0,x+tw*.6,0);g.addColorStop(0,lighten(fill,.18));g.addColorStop(.45,fill);g.addColorStop(1,darken(fill,.4));ctx.fillStyle=g;ctx.fill();ctx.clip();ctx.strokeStyle=darken(fill,.35);ctx.lineWidth=Math.max(.4,tw*.06);ctx.globalAlpha=.55;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(x+k*tw*.22,y);ctx.bezierCurveTo(x+k*tw*.3+tw*.05,y-th*.35,x+k*tw*.15-tw*.05,y-th*.65,x+k*tw*.18,y-th);ctx.stroke()}ctx.restore()}
/* a big mass of foliage is not a smooth balloon: dapple it with small leaves, lit on the upper left */
function dapple(ctx,x,y,rx,ry,rot,fill){const n=Math.min(40,Math.round(rx*ry/18));let s=(Math.round(x*7+y*13)%9973)+1;const r=()=>{s=(s*9301+49297)%233280;return s/233280};ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);ctx.clip();
for(let i=0;i<n;i++){const a=r()*Math.PI*2,d=Math.sqrt(r()),px=x+Math.cos(a)*rx*d,py=y+Math.sin(a)*ry*d,lit=(x-px)/rx+(y-py)/ry,sz=Math.max(1.2,Math.min(rx,ry)*(.14+r()*.1));ctx.beginPath();ctx.ellipse(px,py,sz,sz*.6,r()*3,0,Math.PI*2);ctx.fillStyle=lit>0?lighten(fill,.12+r()*.12):darken(fill,.1+r()*.14);ctx.globalAlpha=.55;ctx.fill()}ctx.restore()}
const greenish=c=>{const[r,g,b]=hexToRgb(c);return g>r*1.05&&g>b*1.05};
/* fruit and berries: a rounded mass with a glint */
function berry(ctx,x,y,rx,ry,rot,fill,stroke){ell(ctx,x,y,rx,ry,rot,fill,stroke);if(rx>1.4){ctx.beginPath();ctx.ellipse(x-rx*.35,y-ry*.38,rx*.3,ry*.2,-.6,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fill()}}
/* a leaf from (x,y) pointing at angle ang (0 = up): pointed tip, light and shaded halves, a midrib and side veins */
function leaf(ctx,x,y,len,wid,ang,color){if(typeof color!=='string'||color[0]!=='#'){ell(ctx,x+Math.sin(ang)*len/2,y-Math.cos(ang)*len/2,wid/2,len/2,ang,color,null);return}
const w=wid/2,L=len;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-w*1.3,-L*.22,-w*.95,-L*.74,0,-L);ctx.bezierCurveTo(w*.95,-L*.74,w*1.3,-L*.22,0,0);
const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,lighten(color,.2));g.addColorStop(.48,color);g.addColorStop(.52,darken(color,.08));g.addColorStop(1,darken(color,.26));ctx.fillStyle=g;ctx.fill();
ctx.save();ctx.globalAlpha*=.6;ctx.lineWidth=.6;ctx.strokeStyle=darken(color,.4);ctx.stroke();ctx.restore();
if(L>6){ctx.globalAlpha*=.75;ctx.beginPath();ctx.moveTo(0,-L*.03);ctx.quadraticCurveTo(w*.1,-L*.5,0,-L*.9);ctx.strokeStyle=lighten(color,.32);ctx.lineWidth=Math.max(.45,w*.12);ctx.stroke();
if(L>16){ctx.lineWidth=Math.max(.35,w*.05);ctx.beginPath();for(let k=1;k<4;k++){const yy=-L*(.18+.19*k),sp=w*(.75-k*.12);ctx.moveTo(0,yy);ctx.quadraticCurveTo(-sp*.5,yy-L*.03,-sp,yy-L*.09);ctx.moveTo(0,yy);ctx.quadraticCurveTo(sp*.5,yy-L*.03,sp,yy-L*.09)}ctx.stroke()}}ctx.restore()}
function line(ctx,x1,y1,x2,y2,color,w){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=w||1;ctx.lineCap='round';ctx.stroke()}
function curve(ctx,x1,y1,cx,cy,x2,y2,color,w){ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);ctx.strokeStyle=color;ctx.lineWidth=w||1;ctx.lineCap='round';ctx.stroke()}
/* a terracotta pot, rounded by its shading, with a rim */
function pot(ctx,x,y,w){const h=w*.55;ctx.beginPath();ctx.moveTo(x-w/2,y-h);ctx.lineTo(x+w/2,y-h);ctx.lineTo(x+w*.38,y);ctx.lineTo(x-w*.38,y);ctx.closePath();const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#94492a');g.addColorStop(.32,'#d4804c');g.addColorStop(.55,'#c0693c');g.addColorStop(1,'#83401f');ctx.fillStyle=g;ctx.fill();
const r=ctx.createLinearGradient(0,y-h-w*.1,0,y-h+w*.02);r.addColorStop(0,'#d88a58');r.addColorStop(1,'#93492a');ctx.fillStyle=r;ctx.fillRect(x-w/2-1,y-h-w*.1,w+2,w*.12);ctx.fillStyle='rgba(40,20,5,.3)';ctx.fillRect(x-w/2+1,y-h+w*.02,w-2,Math.max(1,w*.04));return h+w*.1}
function drawPlant(ctx,p,x,y,w,h,stage,seed){
  const R=rng(seed||7); ctx.save();
  let fol=p.foliage_color, acc=p.accent_color;
  const showAcc = stage==='mature'||stage==='past';
  if(stage==='past'){fol=mix(fol,'#8a6a2a',.55);acc=acc?mix(acc,'#5a3a1a',.6):null}
  if(stage==='dead'){fol='#6a5a3a';acc=null}
  w=Math.max(w,3);h=Math.max(h,3);
  const isHouse=p.silhouette.startsWith('house_')||p.silhouette==='potted_tree';
  if(isHouse){const ph=pot(ctx,x,y,Math.max(8,Math.min(w*.7,h*.6)));y-=ph*.95;h=Math.max(3,h-ph)}
  if(stage==='seedling'){
    const s=Math.max(4,Math.min(w,h));
    if(['grass_spike','tall_stalk'].includes(p.silhouette)){curve(ctx,x,y,x-1,y-s*.6,x-s*.15,y-s,fol,1.6);curve(ctx,x,y,x+1,y-s*.5,x+s*.2,y-s*.8,fol,1.6)}
    else{line(ctx,x,y,x,y-s*.6,darken(fol,.2),1.3);leaf(ctx,x,y-s*.55,s*.45,s*.25,-1.1,lighten(fol,.15));leaf(ctx,x,y-s*.55,s*.45,s*.25,1.1,lighten(fol,.15))}
    ctx.restore();return;
  }
  if(stage==='dormant'){
    if(p.silhouette==='tree'){ctx.fillStyle='#6b4a2a';trunk(ctx,x,y,w*.1,h*.45);for(let i=0;i<6;i++){const a=-1+i*.4;line(ctx,x,y-h*.4,x+Math.sin(a)*w*.45,y-h*.4-Math.cos(a)*h*.5,'#6b4a2a',1.5)}}
    else{for(let i=0;i<5;i++)line(ctx,x,y,x+(i-2)*w*.1,y-h*.3,'#8a6a3a',1.2)}
    ctx.restore();return;
  }
  const droop=stage==='past'||stage==='dead'?.8:1; h*=droop;
  const fruit=(n,cx,cy,rx,ry,r)=>{if(!showAcc||!acc)return;for(let i=0;i<n;i++)berry(ctx,cx+(R()-.5)*rx*2,cy+(R()-.5)*ry*2,r,r,0,acc,darken(acc,.3))};
  switch(p.silhouette){
    case 'vine_staked':{line(ctx,x+w*.08,y,x+w*.08,y-h*1.05,'#9a7a4a',Math.max(1,w*.05));
      const n=Math.max(3,Math.min(9,Math.round(h/10)));for(let i=0;i<n;i++){const t=i/n;ell(ctx,x+(i%2?-1:1)*w*.18+(R()-.5)*w*.1,y-h*(.12+t*.85),w*.32,Math.max(2,Math.min(w*.35,h/n*.9)),0,i%2?fol:lighten(fol,.1),darken(fol,.25))}
      fruit(Math.max(2,Math.round(n*.7)),x,y-h*.45,w*.25,h*.3,Math.max(1.5,w*.09));break}
    case 'bush':{const n=5;for(let i=0;i<n;i++)ell(ctx,x+(i-2)*w*.17,y-h*(.35+(i%2)*.2)-(i===2?h*.15:0),w*.3,h*.38,0,i%2?lighten(fol,.08):fol,darken(fol,.25));
      fruit(4,x,y-h*.4,w*.3,h*.2,Math.max(1.5,w*.08));break}
    case 'mound_sprawl':{for(let i=0;i<7;i++)ell(ctx,x+(R()-.5)*w*.8,y-h*(.25+R()*.4),w*.2,h*.35,0,i%2?fol:lighten(fol,.1),darken(fol,.25));
      if(showAcc&&acc){if(p.id.startsWith('squash')){ell(ctx,x-w*.15,y-h*.12,w*.12,h*.16,.4,acc,darken(acc,.3))}else fruit(4,x,y-h*.35,w*.35,h*.15,Math.max(1.5,w*.05))}break}
    case 'rosette':{for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;ell(ctx,x+Math.cos(a)*w*.28,y-h*.35+Math.sin(a)*h*.15,w*.24,h*.3,a,fol,darken(fol,.25))}
      ell(ctx,x,y-h*.5,w*.25,h*.35,0,lighten(fol,.25),darken(fol,.2));break}
    case 'upright_leafy':{const n=6;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.35;if(acc&&p.id!=='broccoli')line(ctx,x,y,x+Math.sin(a)*h*.4,y-Math.cos(a)*h*.4,acc,1.4);leaf(ctx,x+Math.sin(a)*h*.25,y-Math.cos(a)*h*.25,h*.75,Math.max(3,w*.28),a,i%2?fol:lighten(fol,.08))}
      if(p.id==='broccoli'&&showAcc)ell(ctx,x,y-h*.55,w*.2,h*.12,0,acc,darken(acc,.3));if(p.id==='beet'&&showAcc)ell(ctx,x,y-1,w*.15,h*.08,0,acc);break}
    case 'feathery':{const n=9;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.2;const ex=x+Math.sin(a)*h,ey=y-Math.cos(a)*h;line(ctx,x,y,ex,ey,darken(fol,.1),1);for(let j=1;j<5;j++){const t=j/5;ell(ctx,x+(ex-x)*t,y+(ey-y)*t,Math.max(1,w*.06),Math.max(1,h*.04),a,fol)}}
      if(p.id==='carrot'&&showAcc)ell(ctx,x,y-1,w*.12,h*.06,0,acc);if((p.id==='dill'||p.id==='cilantro')&&showAcc)for(let i=0;i<3;i++)ell(ctx,x+(i-1)*w*.25,y-h*1.02,w*.12,h*.05,0,acc,darken(acc,.2));break}
    case 'root_top':{if(showAcc)ell(ctx,x,y-h*.08,w*.25,h*.18,0,acc,darken(acc,.3));for(let i=0;i<4;i++)leaf(ctx,x,y-h*.15,h*.8,Math.max(2,w*.25),(i-1.5)*.45,fol);break}
    case 'grass_spike':{const n=7;if(showAcc&&acc&&p.id!=='chives')ell(ctx,x,y-h*.06,w*.22,h*.1,0,acc,darken(acc,.2));for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.12;curve(ctx,x,y,x+Math.sin(a)*h*.5,y-h*.6,x+Math.sin(a)*h*1.1,y-h*(.85+R()*.15),i%2?fol:lighten(fol,.1),Math.max(1.2,w*.07))}
      if(p.id==='chives'&&showAcc)for(let i=0;i<3;i++)ell(ctx,x+(i-1)*w*.2,y-h*1.02,w*.08,w*.08,0,acc);break}
    case 'tall_stalk':{line(ctx,x,y,x,y-h,darken(fol,.15),Math.max(1.5,w*.08));const n=Math.max(3,Math.min(6,Math.round(h/12)));for(let i=0;i<n;i++){const yy=y-h*(.15+i*.7/n),s=i%2?1:-1;curve(ctx,x,yy,x+s*w*.4,yy-h*.05,x+s*w*.55,yy+h*.06,fol,Math.max(1.5,w*.1))}
      if(showAcc&&acc){if(p.id==='sunflower'){ell(ctx,x,y-h,w*.4,w*.4,0,acc,darken(acc,.3));ell(ctx,x,y-h,w*.2,w*.2,0,'#5a3a1a')}else{line(ctx,x,y-h,x,y-h*1.12,'#d8c070',2);ell(ctx,x+w*.1,y-h*.5,w*.08,h*.1,.3,'#9ac060');ell(ctx,x+w*.12,y-h*.53,w*.05,h*.06,.3,acc)}}break}
    case 'cane':{for(let i=0;i<5;i++){const s=(i-2)*.3;const ex=x+Math.sin(s)*w*.6,ey=y-h*(.7+R()*.3);curve(ctx,x,y,x+Math.sin(s)*w*.2,y-h*1.05,ex,ey,'#7a5a3a',1.4);for(let j=1;j<4;j++){const t=j/4;ell(ctx,x+(ex-x)*t+Math.sin(s)*w*.08,y-(y-ey)*t-h*.15*Math.sin(t*3),w*.1,h*.08,0,fol,darken(fol,.25))}}
      fruit(5,x,y-h*.6,w*.4,h*.2,Math.max(1.3,w*.04));break}
    case 'shrub':{ctx.fillStyle='#6b4a2a';trunk(ctx,x,y,w*.08,h*.25);for(let i=0;i<6;i++)ell(ctx,x+(R()-.5)*w*.6,y-h*(.45+R()*.3),w*.28,h*.3,0,i%2?fol:lighten(fol,.08),darken(fol,.25));fruit(7,x,y-h*.55,w*.35,h*.2,Math.max(1.3,w*.035));break}
    case 'spike_flower':{for(let i=0;i<6;i++)ell(ctx,x+(R()-.5)*w*.6,y-h*.25,w*.25,h*.2,0,fol,darken(fol,.2));if(showAcc&&acc)for(let i=0;i<9;i++){const a=(i-4)*.13;const ex=x+Math.sin(a)*h,ey=y-h;line(ctx,x+Math.sin(a)*h*.3,y-h*.35,ex,ey,darken(fol,.1),1);ell(ctx,ex,ey+h*.06,Math.max(1,w*.03),h*.1,a,acc)}break}
    case 'tree':{ctx.fillStyle='#6b4a2a';trunk(ctx,x,y,w*.1,h*.42);for(let i=0;i<7;i++)ell(ctx,x+(R()-.5)*w*.55,y-h*(.55+R()*.25),w*.3,h*.25,0,i%2?fol:lighten(fol,.08),darken(fol,.25));fruit(8,x,y-h*.62,w*.35,h*.15,Math.max(1.5,w*.035));break}
    case 'potted_tree':{ctx.fillStyle='#6b4a2a';trunk(ctx,x,y,w*.08,h*.35);for(let i=0;i<5;i++)ell(ctx,x+(R()-.5)*w*.45,y-h*(.55+R()*.25),w*.28,h*.22,0,i%2?fol:lighten(fol,.08),darken(fol,.25));fruit(5,x,y-h*.62,w*.3,h*.15,Math.max(1.5,w*.05));break}
    case 'flower_stem':{for(let i=0;i<5;i++)ell(ctx,x+(i-2)*w*.17,y-h*.25,w*.2,h*.25,0,fol,darken(fol,.25));if(showAcc&&acc)for(let i=0;i<4;i++){const fx=x+(i-1.5)*w*.22,fy=y-h*(.75+R()*.2);line(ctx,fx,y-h*.4,fx,fy,darken(fol,.1),1);ell(ctx,fx,fy,w*.13,w*.11,0,acc,darken(acc,.3));ell(ctx,fx,fy,w*.04,w*.04,0,'#e8c040')}break}
    case 'house_trailing':{for(let i=0;i<10;i++){const s=i%2?1:-1;const t=R();ell(ctx,x+s*w*(.2+t*.3),y-h*.3+t*h*.9,w*.12,h*.1,s*.5,i%3?fol:mix(fol,acc||fol,.4),darken(fol,.25))}for(let i=0;i<5;i++)ell(ctx,x+(i-2)*w*.12,y-h*.45,w*.15,h*.15,0,fol,darken(fol,.25));break}
    case 'house_sword':{const n=6;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.1;leaf(ctx,x+(i-(n-1)/2)*w*.08,y,h,Math.max(3,w*.2),a,i%2?fol:lighten(fol,.1))}if(acc){ctx.strokeStyle=acc;ctx.lineWidth=1;for(let i=0;i<n;i++){const xx=x+(i-(n-1)/2)*w*.08;ctx.beginPath();ctx.moveTo(xx-w*.08,y-h*.1);ctx.lineTo(xx-w*.08,y-h*.85);ctx.stroke()}}break}
    case 'house_bigleaf':{for(let i=0;i<5;i++){const a=(i-2)*.5;const lx=x+Math.sin(a)*h*.45,ly=y-h*.25-Math.cos(a)*h*.45;line(ctx,x,y,lx,ly,darken(fol,.1),1.2);ell(ctx,lx,ly,w*.22,h*.2,a,fol,darken(fol,.3));line(ctx,lx-w*.15,ly,lx-w*.05,ly,'#f6f3ea',1)}break}
    case 'house_clump':{const thin=p.id==='spider_plant';const n=thin?12:7;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*(thin?.22:.25);const ex=x+Math.sin(a)*h*(thin?1.1:.7),ey=y-Math.cos(a)*h*(thin?.6:1);
        if(thin){curve(ctx,x,y,x+Math.sin(a)*h*.5,y-h*.9,ex,ey,fol,2);curve(ctx,x,y,x+Math.sin(a)*h*.5,y-h*.9,ex,ey,acc,.6)}else leaf(ctx,x,y,h*.95,Math.max(3,w*.22),a,i%2?fol:lighten(fol,.1))}
      if(!thin&&showAcc&&acc)for(let i=0;i<2;i++)ell(ctx,x+(i-.5)*w*.3,y-h*1.02,w*.08,h*.14,(i-.5)*.4,acc,'#d8d8c8');break}
    default:ell(ctx,x,y-h/2,w/2,h/2,0,fol);
  }
  if(stage==='past'){ // rot symbol: brown blob with stink lines and flies
    const s=Math.max(6,Math.min(14,w*.35));const bx=x+w*.35,by=y-h-s*.3;
    ell(ctx,bx,by,s*.5,s*.4,0,'#6b4a1e','#3a2a10');
    for(let i=-1;i<=1;i++)curve(ctx,bx+i*s*.3,by-s*.45,bx+i*s*.3+s*.2,by-s*.75,bx+i*s*.3,by-s*1.05,'#6b4a1e',1);
    ell(ctx,bx-s*.8,by-s*.9,1.2,1.2,0,'#222');ell(ctx,bx+s*.9,by-s*.6,1.2,1.2,0,'#222');
  }
  if(stage==='dead'){line(ctx,x-w*.3,y-h*.9,x+w*.3,y-h*.3,'#3a2a1a',1.5);line(ctx,x+w*.3,y-h*.9,x-w*.3,y-h*.3,'#3a2a1a',1.5)}
  ctx.restore();
}
// Icon at fixed box size for a stage
/* ---------- tomatoes, drawn the way they grow ----------
   A green main stem. Compound leaves come off it at alternating nodes: a stalk (rachis) with pairs of
   serrated, puckered leaflets, small leaflets between them, and one at the tip. Trusses grow between the
   nodes, alternating sides: 3–7 fruit (cherry tomatoes 7–16), or white flowers with yellow centres
   earlier in the season. In the angle between each leaf and the stem a sucker grows: the same plant,
   smaller (the pattern repeats like a fractal), with its own leaves and trusses. */
const isTomato=p=>!!p&&typeof p.id==='string'&&p.id.startsWith('tomato');
const dirv=a=>[Math.sin(a),-Math.cos(a)];
function tomLeaflet(ctx,x,y,a,len,wid,col,R,big){
  /* ovate, widest a third of the way up, tapering to a point, with fine soft teeth and a few shallow lobes */
  const N=big?34:14,L=[],Rt=[],lob=R()*6;
  for(let i=0;i<=N;i++){const t=i/N;let hw=wid/2*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.04)),.62)*(1-.42*t);
    if(big)hw*=1+.07*Math.sin(t*Math.PI*4+lob);const tooth=i%2&&i<N?(big?.93:.9):1;
    L.push([-hw*tooth,-len*t]);Rt.push([hw*tooth*(.95+R()*.06),-len*t])}
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);L.forEach(q=>ctx.lineTo(q[0],q[1]));for(let i=Rt.length-1;i>=0;i--)ctx.lineTo(Rt[i][0],Rt[i][1]);ctx.closePath();
  const g=ctx.createLinearGradient(-wid/2,0,wid/2,0);g.addColorStop(0,lighten(col,.2));g.addColorStop(.48,col);g.addColorStop(1,darken(col,.2));ctx.fillStyle=g;ctx.fill();
  ctx.lineJoin='round';ctx.lineWidth=.5;ctx.strokeStyle=darken(col,.3);ctx.stroke();
  if(len>9){ctx.save();ctx.clip();ctx.strokeStyle=lighten(col,.14);ctx.lineWidth=Math.max(.5,wid*.045);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len*.95);ctx.stroke();
    ctx.lineWidth=Math.max(.35,wid*.022);ctx.beginPath();for(let k=1;k<7;k++){const yy=-len*(.06+.12*k),sp=wid*.5;ctx.moveTo(0,yy);ctx.quadraticCurveTo(-sp*.4,yy-len*.05,-sp,yy-len*.16);ctx.moveTo(0,yy);ctx.quadraticCurveTo(sp*.4,yy-len*.05,sp,yy-len*.16)}ctx.stroke();
    /* the puckered, quilted surface between the veins */
    if(len>18){const n=Math.round(len*wid/40);for(let k=0;k<n;k++){const t=.08+R()*.82,sx=(R()-.5)*wid*.8,r=wid*(.05+R()*.05);ctx.beginPath();ctx.ellipse(sx,-len*t,r,r*.75,R()*3,0,7);ctx.fillStyle=R()<.5?'rgba(255,255,255,.05)':'rgba(0,30,0,.08)';ctx.fill()}}ctx.restore()}
  ctx.restore()}
function tomLeaf(ctx,x,y,a,L,side,col,R){
  const droop=side*.5,P2=[x+dirv(a+droop)[0]*L,y+dirv(a+droop)[1]*L],C=[x+dirv(a)[0]*L*.55,y+dirv(a)[1]*L*.55];
  const at=t=>[(1-t)*(1-t)*x+2*(1-t)*t*C[0]+t*t*P2[0],(1-t)*(1-t)*y+2*(1-t)*t*C[1]+t*t*P2[1]],tan=t=>{const d=[2*(1-t)*(C[0]-x)+2*t*(P2[0]-C[0]),2*(1-t)*(C[1]-y)+2*t*(P2[1]-C[1])];return Math.atan2(d[0],-d[1])};
  const stalk=darken(mix(col,'#8fc46a',.35),.05);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(C[0],C[1],P2[0],P2[1]);ctx.strokeStyle=stalk;ctx.lineWidth=Math.max(.8,L*.025);ctx.lineCap='round';ctx.stroke();
  if(L<12){for(const t of[.45,.75])for(const s of[-1,1])ell(ctx,...at(t),L*.09,L*.16,tan(t)+s*.9,col,null);ell(ctx,...at(1),L*.1,L*.18,tan(1),col,null);return}
  const big=L>55;
  for(const t of[.16,.42,.68])if(L>30)for(const s of[-1,1])tomLeaflet(ctx,...at(t),tan(t)+s*1.25,L*.08,L*.055,col,R,false);
  [[.28,.36],[.55,.44],[.8,.38]].forEach(([t,k],i)=>{for(const s of[-1,1])tomLeaflet(ctx,...at(t),tan(t)+s*(1-i*.14),L*k*(.92+R()*.12),L*k*.68,col,R,big)});
  tomLeaflet(ctx,...at(1),tan(1),L*.44,L*.3,col,R,big)}
function tomFlower(ctx,x,y,r,R){ctx.save();ctx.translate(x,y);ctx.rotate((R()-.5)*1.2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ell(ctx,Math.sin(a)*r*.6,-Math.cos(a)*r*.6,r*.32,r*.62,a,'#fbfbf4',null)}ell(ctx,0,0,r*.36,r*.36,0,'#f2c21c',null);ctx.restore()}
function tomFruit(ctx,x,y,r,col,R){berry(ctx,x,y,r,r*.92,0,col,darken(col,.3));
  ctx.save();ctx.translate(x,y-r*.85);ctx.fillStyle='#3e7a2e';ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5+R()*.3,b=a+Math.PI/5;ctx.lineTo(Math.sin(a)*r*.55,-Math.cos(a)*r*.25+r*.15);ctx.lineTo(Math.sin(b)*r*.12,-Math.cos(b)*r*.06+r*.12)}ctx.closePath();ctx.fill();ctx.restore()}
function tomTruss(ctx,x,y,side,size,stage,cherry,acc,R,age){age=age==null?1:age;
  const n=cherry?7+Math.floor(R()*10):3+Math.floor(R()*5),r=size*(cherry?.055:.1),stem='#5c9a40';
  /* the stalk leaves the stem, arches out and down, and the fruit hang from it, alternating sides */
  const a0=side*1.25,P1=[x+dirv(a0)[0]*size*.28,y+dirv(a0)[1]*size*.28];ctx.strokeStyle=stem;ctx.lineWidth=Math.max(.7,size*.018);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+side*size*.12,y-size*.08,P1[0],P1[1]);
  const pts=[];let q=P1;for(let i=0;i<n;i++){const t=i/(Math.max(1,n-1)),nq=[q[0]+side*size*(cherry?.05:.07),q[1]+size*(cherry?.045:.06)];ctx.lineTo(nq[0],nq[1]);const alt=i%2?1:-1;pts.push([nq[0]+alt*r*.9,nq[1]+r*1.2,t]);q=nq}ctx.stroke();
  for(const[px,py,t]of pts){ctx.beginPath();ctx.moveTo(px-(px-q[0])*.01,py-r*1.1);ctx.lineTo(px,py-r*.6);ctx.stroke()}
  for(const[px,py,t]of pts){if(stage==='young')tomFlower(ctx,px,py-r*.2,r*.9,R);
    else{const m=Math.max(0,Math.min(1,age*1.3-t*.5)),ripe=stage==='past'?darken(mix(acc,'#7a2a10',.35),.1):m>.7?acc:m>.4?mix(acc,'#f0a030',.5):mix('#8dbb4a',acc,m*.4);tomFruit(ctx,px,py,r*(1-t*.25),ripe,R)}}}
function tomShoot(ctx,x,y,a,len,w,depth,o,R){
  const nodes=depth?Math.max(3,Math.round(o.nodes*.55)):o.nodes,step=len/(nodes+.4),P=[[x,y]];let ang=a;
  for(let k=1;k<=nodes;k++){ang=a+(k%2?1:-1)*.05+(R()-.5)*.04;const d=dirv(ang),q=P[k-1];P.push([q[0]+d[0]*step,q[1]+d[1]*step])}
  const tip=P[nodes],td=dirv(a);P.push([tip[0]+td[0]*step*.4,tip[1]+td[1]*step*.4]);
  const leafMax=Math.min(w*.55,len*.55),first=o.side0*(depth?-1:1);
  /* suckers first, tucked behind, in the angle between each leaf and the stem */
  if(depth<o.depth)for(let k=1;k<nodes-1;k++){const side=(k%2?1:-1)*first,q=P[k];tomShoot(ctx,q[0],q[1],a+side*.42,len*.34*(1-k/nodes*.45),w*.55,depth+1,o,R)}
  /* the stem, thick at the base and thin at the tip, with fine hairs */
  const sc=o.stem;for(let k=1;k<P.length;k++){const t=k/P.length;ctx.strokeStyle=sc;ctx.lineCap='round';ctx.lineWidth=Math.max(.8,len*(depth?.012:.016)*(1-t*.55));ctx.beginPath();ctx.moveTo(...P[k-1]);ctx.lineTo(...P[k]);ctx.stroke()}
  if(len>120){ctx.strokeStyle=lighten(sc,.35);ctx.lineWidth=.4;ctx.beginPath();for(let k=0;k<len/6;k++){const t=R(),i=Math.min(P.length-2,Math.floor(t*(P.length-1))),q=[P[i][0]+(P[i+1][0]-P[i][0])*R(),P[i][1]+(P[i+1][1]-P[i][1])*R()],s=R()<.5?-1:1;ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+s*2,q[1]-1.5)}ctx.stroke()}
  for(let k=1;k<=nodes;k++){const side=(k%2?1:-1)*first,q=P[k],t=k/nodes,L=leafMax*(1-.45*t)*(k===nodes?.55:1)*(.9+R()*.15);tomLeaf(ctx,q[0],q[1],a+side*(1.05-.2*t),L,side,o.fol,R)}
  /* new leaves curled at the growing tip */
  const T=P[P.length-1];for(const s of[-1,1])ell(ctx,T[0]+s*step*.08,T[1]-step*.05,step*.07,step*.16,s*.5,lighten(o.fol,.15),null);
  /* trusses between the nodes, every third node, alternating sides */
  if(o.stage!=='seedling')for(let k=depth?1:2;k<nodes;k+=3){const side=-((k%2?1:-1)*first),q=[(P[k][0]+P[k+1][0])/2,(P[k][1]+P[k+1][1])/2];tomTruss(ctx,q[0],q[1],side,leafMax*(depth?.75:1),o.stage,o.cherry,o.acc,R,1-k/nodes)}
  if(o.det&&!depth){tomTruss(ctx,T[0],T[1],first,leafMax*.8,o.stage,o.cherry,o.acc,R,.2)}}
function drawTomato(ctx,p,x,y,w,h,stage,seed){const R=rng(seed||7);ctx.save();
  const det=/determinate/.test(p.id)&&!/indeterminate/.test(p.id),cherry=/cherry/.test(p.id)||/cherry/i.test(p.common_name||'');
  let fol=p.foliage_color||'#3f7f3a',acc=p.accent_color||'#e0483b';if(stage==='past')fol=mix(fol,'#b8a040',.35);
  const o={nodes:det?5:8,depth:h>60?2:1,stem:mix(fol,'#8fc46a',.4),fol,acc,stage,cherry,det,side0:R()<.5?-1:1};
  /* an indeterminate vine climbs a stake */
  if(!det&&h>30){const sx=x+w*.06;ctx.fillStyle='#b99a5a';ctx.fillRect(sx-Math.max(1,w*.012),y-h,Math.max(2,w*.024),h);ctx.strokeStyle='#e8e0c8';ctx.lineWidth=1;for(let k=1;k<5;k++){const yy=y-h*k/5;ctx.beginPath();ctx.moveTo(sx-3,yy);ctx.lineTo(sx+3,yy+2);ctx.stroke()}}
  tomShoot(ctx,x,y,0,h*.96,w,0,o,R);ctx.restore()}

/* ---------- simple leaves, for the plants that have them ----------
   shape: "ovate" (widest near the base), "lance" (long and narrow), "round"; margin: "entire", "serrate", "wavy" */
function sLeaf(ctx,x,y,a,len,wid,col,o,R){o=o||{};const N=len>14?26:12,L=[],Rt=[],sh=o.shape||'ovate';
  for(let i=0;i<=N;i++){const t=i/N;let hw=wid/2*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.03)),sh==='lance'?.9:sh==='round'?.45:.6)*(sh==='round'?1-.15*t:1-.4*t);
    if(o.margin==='serrate'&&i%2&&i<N)hw*=.86;if(o.margin==='wavy')hw*=1+.06*Math.sin(t*Math.PI*5);
    L.push([-hw,-len*t]);Rt.push([hw*(o.cup?.8:1),-len*t])}
  ctx.save();ctx.translate(x,y);ctx.rotate(a);if(o.fore)ctx.scale(1,o.fore);ctx.beginPath();ctx.moveTo(0,0);L.forEach(q=>ctx.lineTo(...q));for(let i=Rt.length-1;i>=0;i--)ctx.lineTo(...Rt[i]);ctx.closePath();
  const g=ctx.createLinearGradient(-wid/2,0,wid/2,0);g.addColorStop(0,lighten(col,.18));g.addColorStop(.5,col);g.addColorStop(1,darken(col,.24));ctx.fillStyle=g;ctx.fill();ctx.lineJoin='round';ctx.lineWidth=.5;ctx.strokeStyle=darken(col,.32);ctx.stroke();
  if(len>8){ctx.save();ctx.clip();ctx.strokeStyle=lighten(col,.2);ctx.lineWidth=Math.max(.4,wid*.05);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len*.92);ctx.stroke();
    if(len>16){ctx.lineWidth=Math.max(.3,wid*.022);ctx.beginPath();for(let k=1;k<6;k++){const yy=-len*(.08+.15*k);ctx.moveTo(0,yy);ctx.quadraticCurveTo(-wid*.2,yy-len*.05,-wid*.45,yy-len*.14);ctx.moveTo(0,yy);ctx.quadraticCurveTo(wid*.2,yy-len*.05,wid*.45,yy-len*.14)}ctx.stroke()}
    if(o.gloss){const gg=ctx.createLinearGradient(-wid/2,-len*.2,wid*.2,-len*.6);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.22)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillRect(-wid,-len,wid*2,len)}
    if(o.wrinkle&&len>14){ctx.strokeStyle=darken(col,.2);ctx.globalAlpha*=.4;ctx.lineWidth=.5;ctx.beginPath();for(let k=0;k<len/3;k++){const t=.1+R()*.8,s=(R()-.5)*wid*.7;ctx.moveTo(s,-len*t);ctx.lineTo(s+wid*.08,-len*t-len*.02)}ctx.stroke()}ctx.restore()}
  ctx.restore()}
function starFlower(ctx,x,y,r,petal,centre,n,R){ctx.save();ctx.translate(x,y);ctx.rotate((R?R():.5)*1.2);for(let i=0;i<(n||5);i++){const a=i*Math.PI*2/(n||5);ell(ctx,Math.sin(a)*r*.55,-Math.cos(a)*r*.55,r*.3,r*.6,a,petal,null)}ell(ctx,0,0,r*.32,r*.32,0,centre,null);ctx.restore()}
const stemC=f=>mix(f,'#8fc46a',.35);
/* ---------- peppers (and eggplant): the same family as tomatoes, built differently ----------
   The main stem grows a few leaves, then forks. One flower (later one fruit) hangs at each fork, and two
   (sometimes three) branches go on and fork again. Leaves are simple, alternate, ovate with a pointed tip,
   smooth-edged and glossy. A bell pepper hangs down, blocky, with three or four lobes. */
function pepperFruit(ctx,x,y,s,col,egg,R){ctx.save();const tilt=(R()-.5)*.3;ctx.translate(x,y);ctx.rotate(tilt);
  ctx.strokeStyle='#4f8a36';ctx.lineWidth=Math.max(1,s*.07);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(s*.12,s*.12,0,s*.25);ctx.stroke();ctx.translate(0,s*.25);
  ctx.beginPath();if(egg){ctx.moveTo(0,0);ctx.bezierCurveTo(s*.32,s*.05,s*.5,s*.9,0,s*1.35);ctx.bezierCurveTo(-s*.5,s*.9,-s*.32,s*.05,0,0)}
  else{const w=s*.5,h=s*.95;ctx.moveTo(-w*.55,s*.04);ctx.bezierCurveTo(-w*1.05,0,-w*1.05,h*.6,-w*.75,h*.92);ctx.quadraticCurveTo(-w*.55,h*1.06,-w*.3,h*.95);ctx.quadraticCurveTo(0,h*1.08,w*.3,h*.95);ctx.quadraticCurveTo(w*.55,h*1.06,w*.75,h*.92);ctx.bezierCurveTo(w*1.05,h*.6,w*1.05,0,w*.55,s*.04);ctx.quadraticCurveTo(0,-s*.06,-w*.55,s*.04)}
  const g=ctx.createLinearGradient(-s*.5,0,s*.5,0);g.addColorStop(0,lighten(col,.2));g.addColorStop(.45,col);g.addColorStop(1,darken(col,.35));ctx.fillStyle=g;ctx.fill();ctx.lineWidth=.6;ctx.strokeStyle=darken(col,.4);ctx.stroke();
  ctx.save();ctx.clip();if(!egg){ctx.strokeStyle=darken(col,.28);ctx.lineWidth=Math.max(.6,s*.03);for(const k of[-.18,.18]){ctx.beginPath();ctx.moveTo(k*s,s*.08);ctx.quadraticCurveTo(k*s*1.3,s*.5,k*s*.9,s*.98);ctx.stroke()}}
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-s*.2,s*(egg?.45:.35),s*.06,s*.22,.1,0,7);ctx.fill();ctx.restore();
  ctx.fillStyle='#3e7a2e';ctx.beginPath();ctx.ellipse(0,s*.03,s*(egg?.22:.3),s*.08,0,0,7);ctx.fill();if(egg){for(const k of[-1,0,1]){ctx.beginPath();ctx.moveTo(k*s*.18,0);ctx.lineTo(k*s*.26,s*.22);ctx.lineTo(k*s*.06,s*.05);ctx.fill()}}ctx.restore()}
function drawPepper(ctx,p,x,y,w,h,stage,seed){const R=rng(seed||7),egg=/eggplant/.test(p.id);let fol=p.foliage_color||'#3c7a35';if(stage==='past')fol=mix(fol,'#b8a040',.3);ctx.save();
  const acc=p.accent_color||'#3f9a2f',sc=stemC(fol),items=[];
  const branch=(bx,by,a,len,depth)=>{const n=depth?2:4,step=len/n;let q=[bx,by];const pts=[q];for(let k=1;k<=n;k++){const d=dirv(a+(k%2?.06:-.06));q=[q[0]+d[0]*step,q[1]+d[1]*step];pts.push(q)}
    ctx.strokeStyle=sc;ctx.lineCap='round';ctx.lineWidth=Math.max(.8,h*(.022-depth*.004));ctx.beginPath();ctx.moveTo(...pts[0]);pts.slice(1).forEach(v=>ctx.lineTo(...v));ctx.stroke();
    const L=Math.min(w*.32,h*.24)*(1-depth*.13);for(let k=1;k<=n;k++){const side=(k+depth)%2?1:-1;items.push(['leaf',pts[k][0],pts[k][1],a+side*(1-.1*k)+(R()-.5)*.2,L*(.8+R()*.3)])}
    const end=pts[n];if(depth<3){items.push(['fruit',end[0],end[1],depth]);const kids=R()<.25?3:2;for(let i=0;i<kids;i++){const da=(i-(kids-1)/2)*.75;branch(end[0],end[1],a+da+(R()-.5)*.15,len*.78,depth+1)}}
    else items.push(['leaf',end[0],end[1],a,L*.7])};
  branch(x,y,0,h*.34,0);
  for(const it of items)if(it[0]==='leaf')sLeaf(ctx,it[1],it[2],it[3],it[4],it[4]*(egg?.75:.5),fol,{shape:'ovate',margin:egg?'wavy':'entire',gloss:!egg,cup:true},R);
  const s=Math.min(w,h)*(egg?.24:.24);for(const it of items)if(it[0]==='fruit'){const[_, fx,fy,d]=it;
    if(stage==='young'){starFlower(ctx,fx,fy+s*.25,s*.32,egg?'#b48ad8':'#fbfbf4',egg?'#f2c21c':'#e8e4a0',egg?5:6,R)}
    else{const ripe=egg?acc:(d===0&&R()<.7?'#c8281e':d===1&&R()<.35?'#e86a1e':acc);pepperFruit(ctx,fx,fy,s*(1-d*.15),stage==='past'?darken(mix(ripe,'#6a3a10',.3),.1):ripe,egg,R)}}
  ctx.restore()}
/* ---------- the mint family (basil, mint, thyme): square stems, leaves in opposite pairs, each pair
   turned a quarter turn from the last, side shoots from the leaf angles, and flowers in whorls up a spike ---------- */
function drawMintFamily(ctx,p,x,y,w,h,stage,seed){const R=rng(seed||7),kind=/basil/.test(p.id)?'basil':/thyme/.test(p.id)?'thyme':'mint';let fol=p.foliage_color;if(stage==='past')fol=mix(fol,'#b8a040',.25);ctx.save();
  const sc=kind==='thyme'?'#7a6048':stemC(fol),flowerC=kind==='basil'?'#f6f3ec':p.accent_color||'#d7c2e6',flowering=stage==='past'||(stage==='mature'&&kind!=='basil')||(stage==='mature'&&R()<.5);
  const leafL=kind==='basil'?Math.min(w*.28,h*.2):kind==='mint'?Math.min(w*.2,h*.16):Math.min(w*.06,h*.05);
  const shoot=(bx,by,a,len,depth)=>{const n=kind==='thyme'?7:depth?3:5,step=len/n;const P=[[bx,by]];for(let k=1;k<=n;k++){const d=dirv(a+(R()-.5)*.08*(kind==='mint'?3:1)),q=P[k-1];P.push([q[0]+d[0]*step,q[1]+d[1]*step])}
    ctx.strokeStyle=sc;ctx.lineCap='round';ctx.lineWidth=Math.max(.7,(kind==='thyme'?h*.008:h*.018)*(1-depth*.3));ctx.beginPath();ctx.moveTo(...P[0]);P.slice(1).forEach(v=>ctx.lineTo(...v));ctx.stroke();
    for(let k=1;k<=n;k++){const q=P[k],t=k/n,L=leafL*(kind==='basil'?1-.45*t:1-.3*t)*(depth?.8:1);
      if(depth<(kind==='thyme'?1:2)&&k<n-1&&k%2&&kind!=='thyme')for(const s of[-1,1])if(R()<.6)shoot(q[0],q[1],a+s*.5,len*.45,depth+1);
      if(kind==='thyme'&&depth<1&&k%2)shoot(q[0],q[1],a+(k%4===1?.5:-.5),len*.5,depth+1);
      if(k%2){for(const s of[-1,1])sLeaf(ctx,q[0],q[1],a+s*1.05,L,L*(kind==='basil'?.62:kind==='mint'?.55:.45),fol,{shape:kind==='thyme'?'lance':'ovate',margin:kind==='mint'?'serrate':'entire',gloss:kind==='basil',wrinkle:kind==='mint',cup:kind==='basil'},R)}
      else{/* this pair faces us: one leaf seen almost head-on, the other behind the stem */sLeaf(ctx,q[0],q[1],a+(R()-.5)*.4,L*.85,L*(kind==='basil'?.7:.6),lighten(fol,.06),{shape:'ovate',margin:kind==='mint'?'serrate':'entire',gloss:kind==='basil',fore:.55},R)}}
    const T=P[n];if(flowering&&(kind!=='mint'||depth===0)){const sp=kind==='thyme'?step*.8:step*1.6,dv=dirv(a);for(let i=0;i<(kind==='thyme'?2:5);i++){const xx=T[0]+dv[0]*sp*i/4,yy=T[1]+dv[1]*sp*i/4,r=kind==='thyme'?Math.max(1,leafL*.28):Math.max(1.2,leafL*.09);for(const s of[-1,1])ell(ctx,xx+s*r*1.2,yy,r,r*.8,0,flowerC,darken(flowerC,.2));ell(ctx,xx,yy-r*.3,r*.9,r*.7,0,kind==='basil'?'#a7c48a':darken(flowerC,.15),null)}}
    else for(const s of[-1,1])sLeaf(ctx,T[0],T[1],a+s*.35,leafL*.4,leafL*.3,lighten(fol,.12),{shape:'ovate'},R)};
  const stems=kind==='basil'?1:kind==='mint'?5:11;for(let i=0;i<stems;i++){const a=stems===1?0:(i/(stems-1)-.5)*(kind==='mint'?1.4:2),len=h*(stems===1?.95:.75+R()*.25)*(1-Math.abs(a)*(kind==='thyme'?.35:.25));shoot(x+(i-(stems-1)/2)*w*.02,y,a,len,0)}
  ctx.restore()}
/* ---------- mint (Mentha spicata; research/subjects/plants/lamiaceae.md, 25 Nov 2026): its own drawing ----------
   Square stems (a lit edge), often purple-tinged; sessile ovate-lanceolate leaves in opposite pairs that turn a quarter
   turn each node; sharp forward-pointing teeth; veins sunk into the blade so the leaf looks quilted (rugose); creeping
   stolons along the ground that root and send up shoots; slender terminal spikes of whorled lilac flowers
   (verticillasters) with gaps between the whorls. Stages: seedling (two round seed leaves, the first toothed pair),
   young / immature (a few upright stems, one runner), mature (a spreading colony in flower), past / declining (leggy,
   lower leaves yellowing and dropped, mint rust spots, spikes gone brown), dead (dry stems, a few curled brown leaves). */
function mintLeaf(ctx,x,y,a,len,wid,col,o,R){o=o||{};const N=Math.max(10,Math.round(len/1.6)),teeth=Math.max(4,Math.min(9,Math.round(len/4))),L=[],Rt=[];
  for(let i=0;i<=N;i++){const t=i/N;let hw=wid/2*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.02)),.55)*(1-.45*t)*(t<.12?.75+2*t:1);
    const tooth=t>.12&&t<.95?Math.max(0,Math.sin(t*teeth*Math.PI*2))*.14:0;hw*=1+tooth;if(o.curl)hw*=1-o.curl*.5*Math.sin(t*Math.PI);L.push([-hw,-len*t]);Rt.push([hw,-len*t])}
  ctx.save();ctx.translate(x,y);ctx.rotate(a);if(o.fore)ctx.scale(1,o.fore);if(o.curl)ctx.transform(1,0,o.curl*.25,1,0,0);
  ctx.beginPath();ctx.moveTo(0,0);L.forEach(q=>ctx.lineTo(...q));for(let i=Rt.length-1;i>=0;i--)ctx.lineTo(...Rt[i]);ctx.closePath();
  const g=ctx.createLinearGradient(-wid/2,0,wid/2,-len*.3);g.addColorStop(0,lighten(col,.2));g.addColorStop(.55,col);g.addColorStop(1,darken(col,.25));ctx.fillStyle=g;ctx.fill();ctx.lineJoin='round';ctx.lineWidth=Math.max(.4,wid*.02);ctx.strokeStyle=darken(col,.35);ctx.stroke();
  if(len>7){ctx.save();ctx.clip();
    if(o.yellow){const y0=-len*(1-o.yellow);const gy=ctx.createLinearGradient(0,-len,0,0);gy.addColorStop(0,'rgba(214,196,80,0)');gy.addColorStop(Math.max(0,1-o.yellow),'rgba(214,196,80,0)');gy.addColorStop(1,'rgba(214,190,70,.75)');ctx.fillStyle=gy;ctx.fillRect(-wid,-len,wid*2,len)}
    /* the sunken veins: a dark groove with a lit ridge beside it, so the blade reads as quilted */
    const vein=(w,c,off)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(off,0);ctx.lineTo(off,-len*.93);for(let k=1;k<6;k++){const yy=-len*(.06+.15*k),r=1-.12*k;ctx.moveTo(off,yy);ctx.quadraticCurveTo(-wid*.18+off,yy-len*.06,-wid*.4*r+off,yy-len*.17);ctx.moveTo(off,yy);ctx.quadraticCurveTo(wid*.18+off,yy-len*.06,wid*.4*r+off,yy-len*.17)}ctx.stroke()};
    vein(Math.max(.5,wid*.05),darken(col,.3),wid*.015);vein(Math.max(.3,wid*.025),lighten(col,.3),-wid*.02);
    if(len>18){ctx.strokeStyle=darken(col,.18);ctx.lineWidth=Math.max(.25,wid*.012);ctx.beginPath();for(let k=0;k<14;k++){const xx=(R()-.5)*wid*.7,yy=-len*(.15+R()*.7);ctx.moveTo(xx,yy);ctx.lineTo(xx+(R()-.5)*wid*.15,yy-len*.05)}ctx.stroke()} /* the fine net between */
    if(o.rust){ctx.fillStyle='rgba(196,110,30,.85)';for(let k=0;k<o.rust;k++){const xx=(R()-.5)*wid*.6,yy=-len*(.15+R()*.7),r=Math.max(.6,wid*.035*(.6+R()));ctx.beginPath();ctx.arc(xx,yy,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=k%3?'rgba(196,110,30,.85)':'rgba(60,35,20,.8)'}} /* mint rust: orange pustules, a few dark */
    if(o.gloss!==false){const gg=ctx.createLinearGradient(-wid/2,-len*.2,wid*.1,-len*.6);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.14)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillRect(-wid,-len,wid*2,len)}
    ctx.restore()}
  ctx.restore()}
function drawMint(ctx,p,x,y,w,h,stage,seed){stage={immature:'young',declining:'past'}[stage]||stage;const R=rng(seed||7),dead=stage==='dead',past=stage==='past',fol0=p.foliage_color||'#4f9a4a';
  const fol=dead?'#8a6a42':past?mix(fol0,'#9aa040',.3):fol0,stemCol=dead?'#6e5236':mix(stemC(fol0),'#7a4a6a',past?.45:.3),flowerC=p.accent_color||'#c8a8dc';ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const leafL=Math.min(w*.23,h*.17);
  /* SEEDLING: two round seed leaves on a short stem, the first pair of toothed true leaves opening above them */
  if(stage==='seedling'){const s=Math.min(w,h),top=[x,y-s*.42];ctx.strokeStyle=stemC(fol0);ctx.lineWidth=Math.max(.8,s*.025);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+s*.02,y-s*.2,top[0],top[1]);ctx.stroke();
    for(const sd of[-1,1])ell(ctx,x+sd*s*.13,y-s*.26,s*.12,s*.08,sd*.25,lighten(fol0,.12),darken(fol0,.25));
    for(const sd of[-1,1])mintLeaf(ctx,top[0],top[1],sd*.55,s*.34,s*.22,fol0,{},R);mintLeaf(ctx,top[0],top[1]-s*.02,0,s*.12,s*.08,lighten(fol0,.1),{},R);ctx.restore();return}
  /* a stem: square (a lit edge down one side), leaf pairs alternating side-on and facing, side shoots from the leaf angles */
  const shoot=(bx,by,a,len,depth,o)=>{o=o||{};const n=depth?3:Math.max(4,Math.round(len/(leafL*.78))),step=len/n,P=[[bx,by]];
    for(let k=1;k<=n;k++){const lean=(o.leggy?.06:.1)*(R()-.5)+(dead?(k/n)*.12*(o.side||1):0),d=dirv(a+lean*k*.4),q=P[k-1];P.push([q[0]+d[0]*step,q[1]+d[1]*step])}
    const sw=Math.max(.8,h*.02*(1-depth*.3));ctx.strokeStyle=stemCol;ctx.lineWidth=sw;ctx.beginPath();ctx.moveTo(...P[0]);P.slice(1).forEach(v=>ctx.lineTo(...v));ctx.stroke();
    ctx.strokeStyle=lighten(stemCol,.35);ctx.lineWidth=Math.max(.3,sw*.3);ctx.beginPath();ctx.moveTo(P[0][0]-sw*.25,P[0][1]);P.slice(1).forEach(v=>ctx.lineTo(v[0]-sw*.25,v[1]));ctx.stroke(); /* the lit corner of the square stem */
    for(let k=1;k<=n;k++){const q=P[k],t=k/n,L=leafL*(1-.35*t)*(depth?.78:1),low=t<.45;
      if(o.leggy&&low&&R()<.75){ctx.fillStyle=stemCol;ell(ctx,q[0],q[1],sw*.7,sw*.5,0,darken(stemCol,.1),null);continue} /* declining: lower leaves dropped, a node scar left */
      if(dead){if(R()<.55)mintLeaf(ctx,q[0],q[1],a+(k%2?1:-1)*(1.6+R()*.5),L*.7,L*.32,mix('#8a6a42','#5a4028',R()),{curl:.7+R()*.3,gloss:false},R);continue}
      const lc=mix(fol,'#e0c860',o.leggy&&t<.65?.25+.3*(1-t):0),opt={rust:past&&R()<.4?3+Math.floor(R()*5):0,yellow:o.leggy&&t<.6?.5*(1-t):0};
      if(depth<2&&k<n-1&&k%2&&!o.leggy&&R()<(depth?.4:.8))for(const s of[-1,1])if(R()<.6)shoot(q[0],q[1],a+s*.6,len*.4,depth+1,o);
      if(k%2)for(const s of[-1,1])mintLeaf(ctx,q[0],q[1],a+s*(1.0+R()*.15),L,L*.6,lc,opt,R);
      else{mintLeaf(ctx,q[0],q[1],a+(R()-.5)*.35,L*.82,L*.6,lighten(lc,.07),Object.assign({fore:.5},opt),R)}}
    /* the tip: a slender spike of whorled flowers, gaps between whorls, smallest at the top; or a tight bud of young leaves */
    const T=P[n],dv=dirv(a);if(o.flower&&!depth){const whorls=5,gap=Math.min(step*.38,leafL*.32);for(let i=0;i<whorls;i++){const wx=T[0]+dv[0]*gap*i,wy=T[1]+dv[1]*gap*i,r=Math.max(1,leafL*.16*(1-.45*i/whorls)),c=o.seedy?mix('#8a6a4a','#6a5040',R()):flowerC;
        ctx.strokeStyle=darken(stemCol,.05);ctx.lineWidth=Math.max(.5,sw*.6);if(i){ctx.beginPath();ctx.moveTo(wx-dv[0]*gap,wy-dv[1]*gap);ctx.lineTo(wx,wy);ctx.stroke()}
        for(let f=0;f<5;f++){const fa=(f/4-.5)*2.4,fx=wx+Math.sin(fa)*r*1.6,fy=wy-Math.abs(Math.cos(fa))*r*.6;ell(ctx,fx,fy,r*.55,r*.85,fa,c,darken(c,.25))}ell(ctx,wx,wy,r*.9,r*.5,0,darken(o.seedy?'#6a5040':'#7a6a9a',.1),null)}}
    else if(!dead)for(const s of[-1,1])mintLeaf(ctx,T[0],T[1],a+s*.3,leafL*.42,leafL*.26,lighten(fol,.12),{},R);
    return P};
  /* a stolon: a runner creeping over the ground, rooting at its nodes, a small pair of leaves and a new shoot at some */
  const stolon=(sx,dir,len)=>{const n=5,P=[[sx,y]];for(let k=1;k<=n;k++)P.push([sx+dir*len*k/n,y-Math.sin(k/n*Math.PI)*h*.015+(R()-.5)*h*.005]);ctx.strokeStyle=dead?'#6e5236':mix(stemCol,'#e8d8c8',.25);ctx.lineWidth=Math.max(.7,h*.013);ctx.beginPath();ctx.moveTo(...P[0]);P.slice(1).forEach(v=>ctx.lineTo(...v));ctx.stroke();
    for(let k=1;k<=n;k++){const q=P[k];ctx.strokeStyle='rgba(150,120,90,.7)';ctx.lineWidth=.6;for(let r=0;r<3;r++){ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+(R()-.5)*h*.03,q[1]+h*.02);ctx.stroke()}
      if(!dead&&k%2)for(const s of[-1,1])mintLeaf(ctx,q[0],q[1],s*1.2,leafL*.5,leafL*.3,lighten(fol,.05),{},R);if(!dead&&k===n-1&&stage==='mature')shoot(q[0],q[1],dir*.15,h*.22,1,{})}};
  const n=stage==='young'?4:dead?6:past?7:9,spread=stage==='young'?.7:1.25;
  if(stage!=='young'||R()<.9)stolon(x-w*.05,-1,w*(stage==='young'?.25:.42));if(stage!=='young')stolon(x+w*.05,1,w*.4);
  const order=[...Array(n).keys()].sort(()=>R()-.5);
  for(const i of order){const a=(i/(n-1)-.5)*spread+(dead?(i<n/2?-.25:.25):0),tall=past?1.12:dead?.85:1,len=h*tall*(stage==='young'?.62+R()*.2:.68+R()*.3)*(1-Math.abs(a)*.25);
    shoot(x+(i-(n-1)/2)*w*.025,y,a,len,0,{flower:stage==='mature'||past||dead,seedy:past||dead,leggy:past,side:a<0?-1:1})}
  ctx.restore()}
/* ---------- the carrot family (parsley, cilantro, dill): long leaf stalks from a crown at the ground,
   leaves cut into leaflets (parsley, cilantro) or into threads (dill), and flowers in umbrellas (umbels) ---------- */
function frond(ctx,x,y,a,len,col,kind,R,lvl){const tip=[x+dirv(a)[0]*len,y+dirv(a)[1]*len],c=[x+dirv(a-(a>0?-.25:.25))[0]*len*.6,y+dirv(a-(a>0?-.25:.25))[1]*len*.6];
  ctx.strokeStyle=stemC(col);ctx.lineWidth=Math.max(.5,len*(lvl?.012:.022));ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(c[0],c[1],tip[0],tip[1]);ctx.stroke();
  const at=t=>[(1-t)*(1-t)*x+2*(1-t)*t*c[0]+t*t*tip[0],(1-t)*(1-t)*y+2*(1-t)*t*c[1]+t*t*tip[1]],ta=t=>{const d=[2*(1-t)*(c[0]-x)+2*t*(tip[0]-c[0]),2*(1-t)*(c[1]-y)+2*t*(tip[1]-c[1])];return Math.atan2(d[0],-d[1])};
  if(kind==='dill'){for(let t=.12;t<=1;t+=.05)for(const s of[-1,1]){const q=at(t),aa=ta(t)+s*.7,L=len*.3*(1.1-t);ctx.strokeStyle=col;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...q);ctx.lineTo(q[0]+dirv(aa)[0]*L,q[1]+dirv(aa)[1]*L);ctx.stroke()}return}
  const segs=lvl?[.45,.8]:[.35,.65];for(const t of segs)for(const s of[-1,1]){const q=at(t);if(!lvl&&len>40)frond(ctx,q[0],q[1],ta(t)+s*.9,len*.38,col,kind,R,1);else leaflet3(ctx,q[0],q[1],ta(t)+s*.9,len*(lvl?.22:.16),col,kind,R)}
  leaflet3(ctx,...at(1),ta(1),len*(lvl?.26:.2),col,kind,R)}
/* a leaflet cut into three toothed lobes: parsley's is sharp, cilantro's rounded */
function leaflet3(ctx,x,y,a,L,col,kind,R){for(const s of[-1,0,1])sLeaf(ctx,x,y,a+s*.55,L*(s?.75:1),L*(kind==='cilantro'?.75:.55),s?darken(col,.04):col,{shape:kind==='cilantro'?'round':'ovate',margin:'serrate'},R)}
function umbel(ctx,x,y,r,col,R){ctx.strokeStyle='#7fae5a';ctx.lineWidth=.6;for(let i=0;i<9;i++){const a=-1.1+i*2.2/8,e=[x+Math.sin(a)*r,y-Math.cos(a)*r*.6-r*.2];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...e);ctx.stroke();for(let j=0;j<5;j++)ell(ctx,e[0]+(R()-.5)*r*.25,e[1]-R()*r*.15,Math.max(.8,r*.07),Math.max(.8,r*.07),0,col,null)}}
function drawCarrotFamily(ctx,p,x,y,w,h,stage,seed){const R=rng(seed||7),kind=/dill/.test(p.id)?'dill':/cilantro/.test(p.id)?'cilantro':'parsley';let fol=p.foliage_color;if(stage==='past')fol=mix(fol,'#b8a040',.3);ctx.save();
  const n=kind==='dill'?6:8;for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*1.6+(R()-.5)*.15,len=Math.min(h*(kind==='dill'?.55:.6),w*.62)*(1-Math.abs(a)*.25)*(.85+R()*.25);frond(ctx,x,y,a,len,fol,kind,R,0)}
  const bolt=kind!=='parsley'&&(stage==='mature'||stage==='past');if(bolt){const n2=kind==='dill'?2:3;for(let i=0;i<n2;i++){const a=(i-(n2-1)/2)*.25,top=[x+dirv(a)[0]*h*.95,y+dirv(a)[1]*h*.95];ctx.strokeStyle=stemC(fol);ctx.lineWidth=Math.max(.8,h*.012);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...top);ctx.stroke();
    if(kind==='cilantro')for(let k=1;k<4;k++){const q=[x+(top[0]-x)*k/4,y+(top[1]-y)*k/4];frond(ctx,q[0],q[1],a+(k%2?.9:-.9),h*.12,fol,'dill',R,1)}umbel(ctx,top[0],top[1],h*(kind==='dill'?.14:.08),p.accent_color||'#fff',R)}}
  ctx.restore()}
/* ---------- chives: a clump of hollow tubes, rounded at the tips, and round purple flower heads on stalks ---------- */
function drawChives(ctx,p,x,y,w,h,stage,seed){const R=rng(seed||7);let fol=p.foliage_color;if(stage==='past')fol=mix(fol,'#b8a040',.35);ctx.save();
  const n=18;for(let i=0;i<n;i++){const a=(R()-.5)*.9,len=h*(.6+R()*.35),bend=(R()-.5)*.3,e=[x+dirv(a+bend)[0]*len,y+dirv(a+bend)[1]*len],c=[x+dirv(a)[0]*len*.55,y+dirv(a)[1]*len*.55],tw=Math.max(1,w*.022);
    ctx.lineCap='round';ctx.strokeStyle=darken(fol,.15);ctx.lineWidth=tw;ctx.beginPath();ctx.moveTo(x+(i-n/2)*w*.006,y);ctx.quadraticCurveTo(...c,...e);ctx.stroke();ctx.strokeStyle=lighten(fol,.15);ctx.lineWidth=tw*.35;ctx.stroke()}
  if(stage==='mature'||stage==='past')for(let i=0;i<4;i++){const a=(i-1.5)*.22,len=h*(.85+R()*.15),e=[x+dirv(a)[0]*len,y+dirv(a)[1]*len];ctx.strokeStyle=fol;ctx.lineWidth=Math.max(.8,w*.02);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...e);ctx.stroke();
    const r=Math.max(2,w*.09),c=p.accent_color||'#b07ac8';for(let k=0;k<26;k++){const t=R()*Math.PI*2,d=Math.sqrt(R())*r;ell(ctx,e[0]+Math.cos(t)*d,e[1]-r*.6+Math.sin(t)*d*.9,Math.max(.8,r*.22),Math.max(.6,r*.14),t,k%3?c:lighten(c,.25),null)}}
  ctx.restore()}
/* ---------- potato (research/subjects/plants/potato.md) ----------
   A clump of erect, branching stems from the seed piece; each stem forks (the repeated fork) and ends in a cyme of
   five-lobed star flowers with a yellow cone of anthers. Leaves are odd-pinnate like a tomato's, but the leaflets are
   smooth-edged: 3-4 opposite pairs, a larger terminal leaflet, and tiny leaflets between the pairs. Tubers form on
   stolons under the soil; when the plant is ready to harvest (mature) each tuber shows a third of itself above the
   soil. o.hill (0-3): soil mounded up around the stems ("hilling"), drawn as a taller mound; more hill, more tubers.
   o.skin: 'red', 'purple' or 'brown' (default: seeded, so each plant differs and stays the same). */
const SKINS={red:'#b5413a',purple:'#5e3466',brown:'#a77b4f'},SKINLIST=['red','purple','brown'];
const potatoSkin=(seed,o)=>(o&&o.skin)||SKINLIST[Math.floor(rng((seed||7)*31+5)()*3)];
/* one tuber: a lumpy oval with eyes (a bud in a little crescent "brow"), lenticels, light from the upper left. Works at any scale. */
function tuber(ctx,x,y,rx,ry,rot,skin,seed,o){o=o||{};const R=rng((seed||7)*17+3),col=SKINS[skin]||skin||SKINS.brown,N=14,pts=[];
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2,k=1+(R()-.5)*.16;pts.push([Math.cos(a)*rx*k,Math.sin(a)*ry*k])}
  ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);ctx.beginPath();for(let i=0;i<N;i++){const a=pts[i],b=pts[(i+1)%N],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];i?ctx.quadraticCurveTo(a[0],a[1],m[0],m[1]):ctx.moveTo(m[0],m[1])}
  {const a=pts[0],b=pts[1];ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}ctx.closePath();
  const g=ctx.createRadialGradient(-rx*.35,-ry*.4,0,0,0,Math.max(rx,ry)*1.1);g.addColorStop(0,lighten(col,.28));g.addColorStop(.6,col);g.addColorStop(1,darken(col,.3));ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=Math.max(rx,ry)*.04;ctx.strokeStyle=darken(col,.45);ctx.stroke();
  if(o.dirt){ctx.save();ctx.clip();ctx.fillStyle='rgba(90,64,40,.35)';for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse((R()-.5)*rx*1.6,ry*(.2+R()*.7),rx*(.1+R()*.15),ry*(.06+R()*.08),R()*3,0,7);ctx.fill()}ctx.restore()}
  if(rx>3||o.unit){ctx.fillStyle=lighten(col,.35);ctx.globalAlpha=.5;for(let i=0;i<10;i++){ctx.beginPath();ctx.arc((R()-.5)*rx*1.5,(R()-.5)*ry*1.4,Math.max(rx,ry)*.018,0,7);ctx.fill()}ctx.globalAlpha=1; /* lenticels */
    const ne=3+Math.floor(R()*3);for(let i=0;i<ne;i++){const ex=(R()-.5)*rx*1.3,ey=(R()-.5)*ry*1.1,er=Math.max(rx,ry)*(.06+R()*.03);
      ctx.strokeStyle=darken(col,.5);ctx.lineWidth=er*.35;ctx.beginPath();ctx.arc(ex,ey+er*.3,er,Math.PI*1.15,Math.PI*1.85);ctx.stroke(); /* the brow */
      ctx.fillStyle=darken(col,.55);ctx.beginPath();ctx.ellipse(ex,ey+er*.45,er*.35,er*.22,0,0,7);ctx.fill()}} /* the eye */
  ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.ellipse(-rx*.38,-ry*.42,rx*.22,ry*.12,-.4,0,7);ctx.fill();ctx.restore()}
function potLeaflet(ctx,x,y,a,len,wid,col){sLeaf(ctx,x,y,a,len,wid,col,{shape:'ovate',margin:'entire'},rng(7))}
function potLeaf(ctx,x,y,a,L,side,col,R){const droop=side*.45,P2=[x+dirv(a+droop)[0]*L,y+dirv(a+droop)[1]*L],C=[x+dirv(a)[0]*L*.55,y+dirv(a)[1]*L*.55];
  const at=t=>[(1-t)*(1-t)*x+2*(1-t)*t*C[0]+t*t*P2[0],(1-t)*(1-t)*y+2*(1-t)*t*C[1]+t*t*P2[1]],tan=t=>{const d=[2*(1-t)*(C[0]-x)+2*t*(P2[0]-C[0]),2*(1-t)*(C[1]-y)+2*t*(P2[1]-C[1])];return Math.atan2(d[0],-d[1])};
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(C[0],C[1],P2[0],P2[1]);ctx.strokeStyle=stemC(col);ctx.lineWidth=Math.max(.7,L*.022);ctx.lineCap='round';ctx.stroke();
  if(L<10){for(const t of[.5,.8])for(const s of[-1,1])ell(ctx,...at(t),L*.1,L*.17,tan(t)+s*1,col,null);ell(ctx,...at(1),L*.12,L*.2,tan(1),col,null);return}
  const pairs=L>40?4:3;for(let i=0;i<pairs;i++){const t=.22+i*(.66/pairs),k=.3+.06*i;
    if(L>26&&i>0)for(const s of[-1,1])potLeaflet(ctx,...at(t-.09),tan(t-.09)+s*1.3,L*.07,L*.05,col); /* the tiny leaflets between the pairs */
    for(const s of[-1,1])potLeaflet(ctx,...at(t),tan(t)+s*(1.15-i*.1),L*k*(.92+R()*.12),L*k*.62,col)}
  potLeaflet(ctx,...at(1),tan(1),L*.42,L*.3,col)} /* the terminal leaflet, largest */
function potFlowers(ctx,x,y,r,petal,R){ctx.strokeStyle='#6f9a4a';ctx.lineWidth=Math.max(.5,r*.08);for(let i=0;i<3+Math.floor(R()*3);i++){const a=-1+R()*2,q=[x+Math.sin(a)*r*1.6,y-Math.cos(a)*r*1.4];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...q);ctx.stroke();
  if(R()<.25){ell(ctx,q[0],q[1],r*.35,r*.45,0,'#7ea24a',null);continue} /* a bud */
  ctx.save();ctx.translate(...q);ctx.rotate(R()*1.2);ctx.beginPath();for(let k=0;k<10;k++){const ang=k*Math.PI/5,rr=k%2?r*.55:r;ctx.lineTo(Math.sin(ang)*rr,-Math.cos(ang)*rr)}ctx.closePath();ctx.fillStyle=petal;ctx.fill();ctx.lineWidth=Math.max(.3,r*.05);ctx.strokeStyle=darken(petal,.25);ctx.stroke();
  ctx.fillStyle='#f0c020';ctx.beginPath();ctx.moveTo(-r*.22,0);ctx.lineTo(0,-r*.5);ctx.lineTo(r*.22,0);ctx.closePath();ctx.fill();ell(ctx,0,0,r*.2,r*.2,0,'#e0a818',null);ctx.restore()}} /* star with a yellow cone of anthers */
function drawPotato(ctx,p,x,y,w,h,stage,seed,o){o=o||{};const R=rng(seed||7),hill=Math.max(0,Math.min(3,o.hill||0)),dead=stage==='dead',past=stage==='past'||dead,young=stage==='young'||stage==='seedling',sprout=stage==='seedling',skin=potatoSkin(seed,o);
  let fol=p.foliage_color||'#4f8a40';if(past)fol=mix(fol,dead?'#6a5432':'#b8a040',dead?.8:.5);const petal=['#f4f1f6','#cdb6e6','#9a6bc4','#f2c6d6'][Math.floor(R()*4)],sc=stemC(fol);
  const mh=h*(.06+.035*hill),mw=w*(.5+.08*hill),base=y-mh*.55;ctx.save();
  /* the tubers, behind the mound's front: a third of each shows above the soil when the plant is ready */
  const nt=young?0:3+hill,tubs=[];for(let i=0;i<nt;i++){const t=nt>1?i/(nt-1):.5,tx=x+(t-.5)*mw*1.5+(R()-.5)*w*.04,rx=w*(.1+R()*.03),ry=rx*(.7+R()*.12);tubs.push([tx,rx,ry,(R()-.5)*.6,i])}
  /* the mound of soil (taller with hilling) */
  ctx.beginPath();ctx.moveTo(x-mw,y);ctx.quadraticCurveTo(x-mw*.55,y-mh*1.05,x,y-mh);ctx.quadraticCurveTo(x+mw*.55,y-mh*1.05,x+mw,y);ctx.closePath();
  const sg=ctx.createLinearGradient(0,y-mh,0,y);sg.addColorStop(0,'#7a5a3a');sg.addColorStop(1,'#4e3824');ctx.fillStyle=sg;ctx.fill();
  ctx.fillStyle='rgba(30,18,8,.35)';for(let i=0;i<Math.min(60,w*.6);i++){const px=x+(R()-.5)*mw*1.7,py=y-R()*mh*.9;if(Math.abs(px-x)<mw*(1-(y-py)/mh*.6))ctx.fillRect(px,py,Math.max(1,w*.006),Math.max(1,w*.006))}
  /* the stems: a clump from the seed piece, each forking (the repeated fork) */
  const leaves=[],tips=[],n=sprout?2:young?3:4+Math.floor(R()*2),H=h*(sprout?.3:young?.6:1)-mh;
  const stem=(sx,sy,a,len,d)=>{const k=d?2:3,step=len/k,P=[[sx,sy]];let q=[sx,sy];for(let i=1;i<=k;i++){const dv=dirv(a+(i%2?.07:-.07)+(past?(dead?.3:.12)*Math.sign(a||1)*i:0));q=[q[0]+dv[0]*step,q[1]+dv[1]*step];P.push(q)}
    ctx.strokeStyle=sc;ctx.lineCap='round';ctx.lineWidth=Math.max(.8,w*(.022-d*.006));ctx.beginPath();ctx.moveTo(...P[0]);P.slice(1).forEach(v=>ctx.lineTo(...v));ctx.stroke();
    const L=Math.min(w*.26,h*.26)*(1-d*.15)*(sprout?.7:1);for(let i=1;i<=k;i++){const s=(i+d)%2?1:-1;leaves.push([...P[i],a+s*(1.05-.12*i)+(R()-.5)*.2,L*(.85+R()*.25),s])}
    const e=P[k];if(d<1&&!young){for(const da of[-.38,.38])stem(e[0],e[1],a+da+(R()-.5)*.1,len*.62,d+1)}else tips.push(e)};
  for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.32+(R()-.5)*.1;stem(x+(i-(n-1)/2)*w*.04,base,a,H*(.55+R()*.12)*(young?1:.62),0)}
  leaves.forEach(([lx,ly,a,L,s])=>potLeaf(ctx,lx,ly,a,L,s,R()<.25&&past?mix(fol,'#8a6a2a',.4):fol,R));
  if(stage==='mature')tips.forEach(([tx,ty])=>potFlowers(ctx,tx,ty,Math.max(1.5,w*.035),petal,R));
  else if(past)tips.forEach(([tx,ty])=>{if(R()<.4)ell(ctx,tx,ty-w*.03,w*.025,w*.025,0,'#9db85a','#5a7a32')}); /* a few green berries */
  /* the tubers in front, the soil line cutting each at two thirds */
  for(const[tx,rx,ry,rot,i]of tubs){const sy=y-mh*(1-Math.pow(Math.abs(tx-x)/mw,2))*.95;if(sy>y-1)continue;ctx.save();ctx.beginPath();ctx.rect(tx-rx*2,sy-ry*2,rx*4,ry*2);ctx.clip();
    tuber(ctx,tx,sy+ry*(2/3)*2-ry,rx,ry,rot,skin,(seed||7)+i,{dirt:true});ctx.restore();ctx.strokeStyle='#4e3824';ctx.lineWidth=Math.max(.6,w*.006);ctx.beginPath();ctx.moveTo(tx-rx*1.05,sy);ctx.lineTo(tx+rx*1.05,sy);ctx.stroke()}
  ctx.restore()}
/* ---------- harvest: what each plant gives when its mature plant is pulled (fruit, root, flower or leaf) ----------
   item: the produce id ("produce-<plant id>", or "potato"); cook: must be cooked before it can be eaten. A potato
   gives 3 tubers, plus 2 for each time it was hilled (up to 3 times): 3, 5, 7, 9. */
const PART={fruit:/^(tomato|pepper|eggplant|corn|bean|pea|squash|cucumber|strawberry|raspberry|blueberry|apple|pear|peach|fig|lemon)/,root:/^(potato|carrot|beet|radish|onion|garlic)/,flower:/^(broccoli|marigold|nasturtium|sunflower|zinnia|lavender)/};
/* ingredient: must be cooked before it can be eaten (raw potato, eggplant, dry beans, winter squash, rhubarb, asparagus,
   lavender and sunflower seeds are cooked or baked); every other food plant gives food that can be eaten as it is.
   Not food: ornamental flowers (zinnia, French marigold) give a flower to keep or sell. */
const COOK=/^(potato|eggplant|bean|squash_winter|rhubarb|asparagus|lavender|sunflower)/,NOTFOOD=/^(zinnia|marigold)/;
function harvest(p,o){o=o||{};if(!p)return null;const id=p.id,part=PART.fruit.test(id)?'fruit':PART.root.test(id)?'root':PART.flower.test(id)?'flower':'leaf';
  if(/^(pothos|snake_plant|monstera|peace_lily|spider_plant)/.test(id))return null; /* houseplants: nothing to eat */
  const potato=id==='potato',hill=Math.max(0,Math.min(3,o.hill||0));const food=!NOTFOOD.test(id),ing=food&&COOK.test(id);return{part,item:potato?'potato':'produce-'+id,name:p.common_name,food,ingredient:ing,cook:ing,count:potato?3+2*hill:1+(o.seed||0)%3,tuber:potato}}
const ART=[[p=>p.id==='mint',drawMint],[isTomato,(...a)=>drawTomato(...a)],[p=>/^pepper|^eggplant/.test(p.id),drawPepper],[p=>/^(basil|mint|thyme)/.test(p.id),drawMintFamily],[p=>/^(parsley|cilantro|dill)/.test(p.id),drawCarrotFamily],[p=>/^chives/.test(p.id),drawChives],[p=>p.id==='potato',drawPotato]];

/* plants with their own drawing go there; the rest, and seedlings, dormant and dead plants, use the Planting Guide's drawing */
const drawAny=(ctx,p,x,y,w,h,stage,seed,o)=>{const f=(!['seedling','dormant','dead','planned','gone'].includes(stage)||((p.id==='potato'||p.id==='mint')&&(stage==='seedling'||stage==='dead')))&&ART.find(([t])=>t(p));return f?f[1](ctx,p,x,y,w,h,stage,seed,o):drawPlant(ctx,p,x,y,w,h,stage,seed)};
function shadow(ctx,x,y,w){ctx.save();const g=ctx.createRadialGradient(x,y,0,x,y,w*.55);g.addColorStop(0,"rgba(30,20,8,.32)");g.addColorStop(1,"rgba(30,20,8,0)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,w*.55,Math.max(2,w*.12),0,0,Math.PI*2);ctx.fill();ctx.restore()}
const LIST=[{"id":"tomato_cherry","common_name":"Tomato (cherry)","silhouette":"vine_staked","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":72,"mature_spread_in":30},{"id":"tomato_indeterminate","common_name":"Tomato (indeterminate)","silhouette":"vine_staked","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":72,"mature_spread_in":24},{"id":"tomato_determinate","common_name":"Tomato (determinate)","silhouette":"bush","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":48,"mature_spread_in":24},{"id":"pepper_bell","common_name":"Pepper (bell)","silhouette":"bush","foliage_color":"#3c7a35","accent_color":"#3f9a2f","mature_height_in":30,"mature_spread_in":18},{"id":"eggplant","common_name":"Eggplant","silhouette":"bush","foliage_color":"#4d6e46","accent_color":"#5b2a6e","mature_height_in":36,"mature_spread_in":24},{"id":"corn_sweet","common_name":"Sweet corn","silhouette":"tall_stalk","foliage_color":"#5f9a3a","accent_color":"#e8cf5a","mature_height_in":84,"mature_spread_in":18},{"id":"bean_bush","common_name":"Bean (bush)","silhouette":"bush","foliage_color":"#5a9a3f","accent_color":"#7fbf4d","mature_height_in":20,"mature_spread_in":12},{"id":"bean_pole","common_name":"Bean (pole)","silhouette":"vine_staked","foliage_color":"#5a9a3f","accent_color":"#7fbf4d","mature_height_in":96,"mature_spread_in":12},{"id":"pea","common_name":"Pea","silhouette":"vine_staked","foliage_color":"#78b057","accent_color":"#b8dc8a","mature_height_in":48,"mature_spread_in":6},{"id":"potato","common_name":"Potato","silhouette":"bush","foliage_color":"#4f8a40","accent_color":"#efe9f4","mature_height_in":24,"mature_spread_in":18},{"id":"squash_summer","common_name":"Summer squash / zucchini","silhouette":"mound_sprawl","foliage_color":"#4b8a3c","accent_color":"#f2c230","mature_height_in":30,"mature_spread_in":48},{"id":"squash_winter","common_name":"Winter squash","silhouette":"mound_sprawl","foliage_color":"#4b8a3c","accent_color":"#e08a2c","mature_height_in":24,"mature_spread_in":96},{"id":"cucumber","common_name":"Cucumber","silhouette":"vine_staked","foliage_color":"#4b8a3c","accent_color":"#3d7a2e","mature_height_in":72,"mature_spread_in":24},{"id":"lettuce","common_name":"Lettuce (leaf)","silhouette":"rosette","foliage_color":"#9ccc5a","accent_color":null,"mature_height_in":10,"mature_spread_in":10},{"id":"spinach","common_name":"Spinach","silhouette":"rosette","foliage_color":"#3f7f3a","accent_color":null,"mature_height_in":8,"mature_spread_in":8},{"id":"kale","common_name":"Kale","silhouette":"upright_leafy","foliage_color":"#3c6e5a","accent_color":null,"mature_height_in":24,"mature_spread_in":18},{"id":"cabbage","common_name":"Cabbage","silhouette":"rosette","foliage_color":"#8fb88a","accent_color":null,"mature_height_in":18,"mature_spread_in":24},{"id":"broccoli","common_name":"Broccoli","silhouette":"upright_leafy","foliage_color":"#4f7f62","accent_color":"#3f6b3a","mature_height_in":30,"mature_spread_in":18},{"id":"chard","common_name":"Swiss chard","silhouette":"upright_leafy","foliage_color":"#3f7f3a","accent_color":"#d2384a","mature_height_in":18,"mature_spread_in":12},{"id":"carrot","common_name":"Carrot","silhouette":"feathery","foliage_color":"#5f9f3a","accent_color":"#f08a24","mature_height_in":12,"mature_spread_in":4},{"id":"beet","common_name":"Beet","silhouette":"upright_leafy","foliage_color":"#4a7a3a","accent_color":"#8a1e3f","mature_height_in":12,"mature_spread_in":6},{"id":"radish","common_name":"Radish","silhouette":"root_top","foliage_color":"#6aa84a","accent_color":"#d8364b","mature_height_in":6,"mature_spread_in":3},{"id":"onion","common_name":"Onion (bulb)","silhouette":"grass_spike","foliage_color":"#6aa58a","accent_color":"#efe3b0","mature_height_in":18,"mature_spread_in":4},{"id":"garlic","common_name":"Garlic","silhouette":"grass_spike","foliage_color":"#6f9f6a","accent_color":"#f2efe6","mature_height_in":24,"mature_spread_in":6},{"id":"asparagus","common_name":"Asparagus","silhouette":"feathery","foliage_color":"#5f9f3a","accent_color":null,"mature_height_in":60,"mature_spread_in":24},{"id":"rhubarb","common_name":"Rhubarb","silhouette":"upright_leafy","foliage_color":"#3f7f3a","accent_color":"#c43a4a","mature_height_in":36,"mature_spread_in":48},{"id":"basil","common_name":"Basil","silhouette":"bush","foliage_color":"#3f9a3f","accent_color":null,"mature_height_in":24,"mature_spread_in":12},{"id":"cilantro","common_name":"Cilantro","silhouette":"feathery","foliage_color":"#5fae4a","accent_color":"#ffffff","mature_height_in":24,"mature_spread_in":6},{"id":"parsley","common_name":"Parsley","silhouette":"feathery","foliage_color":"#2f7f2f","accent_color":null,"mature_height_in":12,"mature_spread_in":12},{"id":"dill","common_name":"Dill","silhouette":"feathery","foliage_color":"#7fae5a","accent_color":"#e6d34a","mature_height_in":36,"mature_spread_in":12},{"id":"chives","common_name":"Chives","silhouette":"grass_spike","foliage_color":"#3f8f4a","accent_color":"#b07ac8","mature_height_in":12,"mature_spread_in":8},{"id":"mint","common_name":"Mint","silhouette":"mound_sprawl","foliage_color":"#4f9f4f","accent_color":null,"mature_height_in":18,"mature_spread_in":24},{"id":"thyme","common_name":"Thyme","silhouette":"mound_sprawl","foliage_color":"#6f8f5f","accent_color":"#d9b8e0","mature_height_in":10,"mature_spread_in":12},{"id":"strawberry","common_name":"Strawberry","silhouette":"mound_sprawl","foliage_color":"#3f8f3f","accent_color":"#e0343f","mature_height_in":8,"mature_spread_in":18},{"id":"raspberry","common_name":"Raspberry","silhouette":"cane","foliage_color":"#4f8a40","accent_color":"#c42850","mature_height_in":60,"mature_spread_in":24},{"id":"blueberry","common_name":"Blueberry (highbush)","silhouette":"shrub","foliage_color":"#3f6f4f","accent_color":"#4a5fa8","mature_height_in":72,"mature_spread_in":60},{"id":"marigold_french","common_name":"Marigold (French)","silhouette":"flower_stem","foliage_color":"#3f7f3a","accent_color":"#f29a1e","mature_height_in":12,"mature_spread_in":10},{"id":"nasturtium","common_name":"Nasturtium","silhouette":"mound_sprawl","foliage_color":"#6fa85a","accent_color":"#f2681e","mature_height_in":12,"mature_spread_in":18},{"id":"pothos","common_name":"Pothos","silhouette":"house_trailing","foliage_color":"#4f9a3a","accent_color":"#e8e28a","mature_height_in":120,"mature_spread_in":24},{"id":"snake_plant","common_name":"Snake plant","silhouette":"house_sword","foliage_color":"#3f6f3f","accent_color":"#d8d070","mature_height_in":36,"mature_spread_in":12},{"id":"monstera","common_name":"Monstera","silhouette":"house_bigleaf","foliage_color":"#2f6f3a","accent_color":null,"mature_height_in":96,"mature_spread_in":48},{"id":"peace_lily","common_name":"Peace lily","silhouette":"house_clump","foliage_color":"#2f6a3a","accent_color":"#ffffff","mature_height_in":24,"mature_spread_in":24},{"id":"spider_plant","common_name":"Spider plant","silhouette":"house_clump","foliage_color":"#7fb85a","accent_color":"#f4f4e0","mature_height_in":12,"mature_spread_in":24},{"id":"apple","common_name":"Apple (semi-dwarf)","silhouette":"tree","foliage_color":"#4a8a3c","accent_color":"#d8363a","mature_height_in":180,"mature_spread_in":180},{"id":"pear","common_name":"Pear (European, dwarf)","silhouette":"tree","foliage_color":"#4f8f45","accent_color":"#c8c04a","mature_height_in":168,"mature_spread_in":156},{"id":"peach","common_name":"Peach","silhouette":"tree","foliage_color":"#5a9a45","accent_color":"#f2a05a","mature_height_in":144,"mature_spread_in":144},{"id":"fig","common_name":"Fig","silhouette":"tree","foliage_color":"#4f8040","accent_color":"#6b3a5a","mature_height_in":120,"mature_spread_in":120},{"id":"lemon_meyer","common_name":"Meyer lemon","silhouette":"potted_tree","foliage_color":"#2f7a3a","accent_color":"#f2d23a","mature_height_in":72,"mature_spread_in":48},{"id":"sunflower","common_name":"Sunflower","silhouette":"tall_stalk","foliage_color":"#5a9a3a","accent_color":"#f2c21e","mature_height_in":96,"mature_spread_in":24},{"id":"zinnia","common_name":"Zinnia","silhouette":"flower_stem","foliage_color":"#4f8f3f","accent_color":"#e8406a","mature_height_in":30,"mature_spread_in":12},{"id":"lavender","common_name":"Lavender (English)","silhouette":"spike_flower","foliage_color":"#8aa88a","accent_color":"#8a6ac8","mature_height_in":24,"mature_spread_in":24}];
window.PLANTS={list:LIST,byId:Object.fromEntries(LIST.map(p=>[p.id,p])),drawRaw:drawAny,draw:(ctx,p,x,y,w,h,stage,seed,o)=>{shadow(ctx,x,y,w);drawAny(ctx,p,x,y,w,h,stage||"mature",seed||7,o)},tuber,harvest,SKINS,potatoSkin,
  /* a plant at a size that keeps its own shape: s is the height it may take */
  drawFit:(ctx,p,x,y,s,stage,seed,o)=>{const asp=Math.max(.45,Math.min(2.2,(p.mature_height_in||12)/(p.mature_spread_in||12)));let h=s,w=h/asp;if(w>s*1.3){w=s*1.3;h=w*asp}shadow(ctx,x,y,w);drawAny(ctx,p,x,y,w,h,stage||"mature",seed||7,o)}};
})();
