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

const drawAny=(ctx,p,x,y,w,h,stage,seed)=>isTomato(p)&&!['seedling','dormant','dead','planned','gone'].includes(stage)?drawTomato(ctx,p,x,y,w,h,stage,seed):drawPlant(ctx,p,x,y,w,h,stage,seed);
function shadow(ctx,x,y,w){ctx.save();const g=ctx.createRadialGradient(x,y,0,x,y,w*.55);g.addColorStop(0,"rgba(30,20,8,.32)");g.addColorStop(1,"rgba(30,20,8,0)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,w*.55,Math.max(2,w*.12),0,0,Math.PI*2);ctx.fill();ctx.restore()}
const LIST=[{"id":"tomato_cherry","common_name":"Tomato (cherry)","silhouette":"vine_staked","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":72,"mature_spread_in":30},{"id":"tomato_indeterminate","common_name":"Tomato (indeterminate)","silhouette":"vine_staked","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":72,"mature_spread_in":24},{"id":"tomato_determinate","common_name":"Tomato (determinate)","silhouette":"bush","foliage_color":"#3f7f3a","accent_color":"#e0483b","mature_height_in":48,"mature_spread_in":24},{"id":"pepper_bell","common_name":"Pepper (bell)","silhouette":"bush","foliage_color":"#3c7a35","accent_color":"#3f9a2f","mature_height_in":30,"mature_spread_in":18},{"id":"eggplant","common_name":"Eggplant","silhouette":"bush","foliage_color":"#4d6e46","accent_color":"#5b2a6e","mature_height_in":36,"mature_spread_in":24},{"id":"corn_sweet","common_name":"Sweet corn","silhouette":"tall_stalk","foliage_color":"#5f9a3a","accent_color":"#e8cf5a","mature_height_in":84,"mature_spread_in":18},{"id":"bean_bush","common_name":"Bean (bush)","silhouette":"bush","foliage_color":"#5a9a3f","accent_color":"#7fbf4d","mature_height_in":20,"mature_spread_in":12},{"id":"bean_pole","common_name":"Bean (pole)","silhouette":"vine_staked","foliage_color":"#5a9a3f","accent_color":"#7fbf4d","mature_height_in":96,"mature_spread_in":12},{"id":"pea","common_name":"Pea","silhouette":"vine_staked","foliage_color":"#78b057","accent_color":"#b8dc8a","mature_height_in":48,"mature_spread_in":6},{"id":"potato","common_name":"Potato","silhouette":"bush","foliage_color":"#4f8a40","accent_color":"#efe9f4","mature_height_in":24,"mature_spread_in":18},{"id":"squash_summer","common_name":"Summer squash / zucchini","silhouette":"mound_sprawl","foliage_color":"#4b8a3c","accent_color":"#f2c230","mature_height_in":30,"mature_spread_in":48},{"id":"squash_winter","common_name":"Winter squash","silhouette":"mound_sprawl","foliage_color":"#4b8a3c","accent_color":"#e08a2c","mature_height_in":24,"mature_spread_in":96},{"id":"cucumber","common_name":"Cucumber","silhouette":"vine_staked","foliage_color":"#4b8a3c","accent_color":"#3d7a2e","mature_height_in":72,"mature_spread_in":24},{"id":"lettuce","common_name":"Lettuce (leaf)","silhouette":"rosette","foliage_color":"#9ccc5a","accent_color":null,"mature_height_in":10,"mature_spread_in":10},{"id":"spinach","common_name":"Spinach","silhouette":"rosette","foliage_color":"#3f7f3a","accent_color":null,"mature_height_in":8,"mature_spread_in":8},{"id":"kale","common_name":"Kale","silhouette":"upright_leafy","foliage_color":"#3c6e5a","accent_color":null,"mature_height_in":24,"mature_spread_in":18},{"id":"cabbage","common_name":"Cabbage","silhouette":"rosette","foliage_color":"#8fb88a","accent_color":null,"mature_height_in":18,"mature_spread_in":24},{"id":"broccoli","common_name":"Broccoli","silhouette":"upright_leafy","foliage_color":"#4f7f62","accent_color":"#3f6b3a","mature_height_in":30,"mature_spread_in":18},{"id":"chard","common_name":"Swiss chard","silhouette":"upright_leafy","foliage_color":"#3f7f3a","accent_color":"#d2384a","mature_height_in":18,"mature_spread_in":12},{"id":"carrot","common_name":"Carrot","silhouette":"feathery","foliage_color":"#5f9f3a","accent_color":"#f08a24","mature_height_in":12,"mature_spread_in":4},{"id":"beet","common_name":"Beet","silhouette":"upright_leafy","foliage_color":"#4a7a3a","accent_color":"#8a1e3f","mature_height_in":12,"mature_spread_in":6},{"id":"radish","common_name":"Radish","silhouette":"root_top","foliage_color":"#6aa84a","accent_color":"#d8364b","mature_height_in":6,"mature_spread_in":3},{"id":"onion","common_name":"Onion (bulb)","silhouette":"grass_spike","foliage_color":"#6aa58a","accent_color":"#efe3b0","mature_height_in":18,"mature_spread_in":4},{"id":"garlic","common_name":"Garlic","silhouette":"grass_spike","foliage_color":"#6f9f6a","accent_color":"#f2efe6","mature_height_in":24,"mature_spread_in":6},{"id":"asparagus","common_name":"Asparagus","silhouette":"feathery","foliage_color":"#5f9f3a","accent_color":null,"mature_height_in":60,"mature_spread_in":24},{"id":"rhubarb","common_name":"Rhubarb","silhouette":"upright_leafy","foliage_color":"#3f7f3a","accent_color":"#c43a4a","mature_height_in":36,"mature_spread_in":48},{"id":"basil","common_name":"Basil","silhouette":"bush","foliage_color":"#3f9a3f","accent_color":null,"mature_height_in":24,"mature_spread_in":12},{"id":"cilantro","common_name":"Cilantro","silhouette":"feathery","foliage_color":"#5fae4a","accent_color":"#ffffff","mature_height_in":24,"mature_spread_in":6},{"id":"parsley","common_name":"Parsley","silhouette":"feathery","foliage_color":"#2f7f2f","accent_color":null,"mature_height_in":12,"mature_spread_in":12},{"id":"dill","common_name":"Dill","silhouette":"feathery","foliage_color":"#7fae5a","accent_color":"#e6d34a","mature_height_in":36,"mature_spread_in":12},{"id":"chives","common_name":"Chives","silhouette":"grass_spike","foliage_color":"#3f8f4a","accent_color":"#b07ac8","mature_height_in":12,"mature_spread_in":8},{"id":"mint","common_name":"Mint","silhouette":"mound_sprawl","foliage_color":"#4f9f4f","accent_color":null,"mature_height_in":18,"mature_spread_in":24},{"id":"thyme","common_name":"Thyme","silhouette":"mound_sprawl","foliage_color":"#6f8f5f","accent_color":"#d9b8e0","mature_height_in":10,"mature_spread_in":12},{"id":"strawberry","common_name":"Strawberry","silhouette":"mound_sprawl","foliage_color":"#3f8f3f","accent_color":"#e0343f","mature_height_in":8,"mature_spread_in":18},{"id":"raspberry","common_name":"Raspberry","silhouette":"cane","foliage_color":"#4f8a40","accent_color":"#c42850","mature_height_in":60,"mature_spread_in":24},{"id":"blueberry","common_name":"Blueberry (highbush)","silhouette":"shrub","foliage_color":"#3f6f4f","accent_color":"#4a5fa8","mature_height_in":72,"mature_spread_in":60},{"id":"marigold_french","common_name":"Marigold (French)","silhouette":"flower_stem","foliage_color":"#3f7f3a","accent_color":"#f29a1e","mature_height_in":12,"mature_spread_in":10},{"id":"nasturtium","common_name":"Nasturtium","silhouette":"mound_sprawl","foliage_color":"#6fa85a","accent_color":"#f2681e","mature_height_in":12,"mature_spread_in":18},{"id":"pothos","common_name":"Pothos","silhouette":"house_trailing","foliage_color":"#4f9a3a","accent_color":"#e8e28a","mature_height_in":120,"mature_spread_in":24},{"id":"snake_plant","common_name":"Snake plant","silhouette":"house_sword","foliage_color":"#3f6f3f","accent_color":"#d8d070","mature_height_in":36,"mature_spread_in":12},{"id":"monstera","common_name":"Monstera","silhouette":"house_bigleaf","foliage_color":"#2f6f3a","accent_color":null,"mature_height_in":96,"mature_spread_in":48},{"id":"peace_lily","common_name":"Peace lily","silhouette":"house_clump","foliage_color":"#2f6a3a","accent_color":"#ffffff","mature_height_in":24,"mature_spread_in":24},{"id":"spider_plant","common_name":"Spider plant","silhouette":"house_clump","foliage_color":"#7fb85a","accent_color":"#f4f4e0","mature_height_in":12,"mature_spread_in":24},{"id":"apple","common_name":"Apple (semi-dwarf)","silhouette":"tree","foliage_color":"#4a8a3c","accent_color":"#d8363a","mature_height_in":180,"mature_spread_in":180},{"id":"pear","common_name":"Pear (European, dwarf)","silhouette":"tree","foliage_color":"#4f8f45","accent_color":"#c8c04a","mature_height_in":168,"mature_spread_in":156},{"id":"peach","common_name":"Peach","silhouette":"tree","foliage_color":"#5a9a45","accent_color":"#f2a05a","mature_height_in":144,"mature_spread_in":144},{"id":"fig","common_name":"Fig","silhouette":"tree","foliage_color":"#4f8040","accent_color":"#6b3a5a","mature_height_in":120,"mature_spread_in":120},{"id":"lemon_meyer","common_name":"Meyer lemon","silhouette":"potted_tree","foliage_color":"#2f7a3a","accent_color":"#f2d23a","mature_height_in":72,"mature_spread_in":48},{"id":"sunflower","common_name":"Sunflower","silhouette":"tall_stalk","foliage_color":"#5a9a3a","accent_color":"#f2c21e","mature_height_in":96,"mature_spread_in":24},{"id":"zinnia","common_name":"Zinnia","silhouette":"flower_stem","foliage_color":"#4f8f3f","accent_color":"#e8406a","mature_height_in":30,"mature_spread_in":12},{"id":"lavender","common_name":"Lavender (English)","silhouette":"spike_flower","foliage_color":"#8aa88a","accent_color":"#8a6ac8","mature_height_in":24,"mature_spread_in":24}];
window.PLANTS={list:LIST,byId:Object.fromEntries(LIST.map(p=>[p.id,p])),drawRaw:drawAny,draw:(ctx,p,x,y,w,h,stage,seed)=>{shadow(ctx,x,y,w);drawAny(ctx,p,x,y,w,h,stage||"mature",seed||7)},
  /* a plant at a size that keeps its own shape: s is the height it may take */
  drawFit:(ctx,p,x,y,s,stage,seed)=>{const asp=Math.max(.45,Math.min(2.2,(p.mature_height_in||12)/(p.mature_spread_in||12)));let h=s,w=h/asp;if(w>s*1.3){w=s*1.3;h=w*asp}shadow(ctx,x,y,w);drawAny(ctx,p,x,y,w,h,stage||"mature",seed||7)}};
})();
