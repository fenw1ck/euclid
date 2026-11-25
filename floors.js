/* Indoor floors, seen from above, as textures: cut stone, wood planks, and carpet (a rug laid over either).
   Needs core.js. Research: research/patterns/floors/indoor/ (stone-floor, wood-floor, carpet).
   Every function returns a canvas covering wU x lU units (1 unit = about 1 m) at ppu px per unit; u runs across the
   room (x), v along it (z, away from you). The same seed gives the same floor every time.

   FLOORS.stone(wU, lU, ppu, seed)   flagstones in rows of mixed lengths (random ashlar), grout, worn paler down the middle
   FLOORS.wood(wU, lU, ppu, seed)    planks running along the room, random lengths with staggered end joints, grain, knots
   FLOORS.carpet(wU, lU, ppu, seed)  a rug: guard stripes, a patterned border, a field with a lattice and a medallion, fringe
   FLOORS.KINDS                      the stone and wood palettes the seed chooses from */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('floors.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry,fbm}=A;
const KINDS={stone:{limestone:['#cfc6b2','#c2b8a2','#d8d0bd','#b9ae97'],sandstone:['#d6b98c','#c9a877','#ddc39a','#bf9c6c'],slate:['#6d7377','#5f666b','#7a8085','#575d62']},
  wood:{oak:['#b0814f','#a47548','#bb8c58','#9a6c40'],walnut:['#6a4a32','#5c3f2a','#76543a','#4f3524'],pine:['#cfa66e','#c49a60','#d8b27c','#b88e56'],cherry:['#9a5a3a','#8c4f32','#a6653f','#7f4a2e']},
  carpet:[['#7a1f24','#1f2a4a','#e8dcc0','#c99a3e'],['#1f3a5a','#7a2a2a','#efe4cc','#b98a3a'],['#2f4a32','#8a6a2a','#e8dcc0','#5a2a2a'],['#5a2a4a','#2a4a5a','#eadfc6','#c99a3e']]};
const pick=(R,a)=>a[Math.floor(R()*a.length)];
function canvas(wU,lU,ppu){const c=document.createElement('canvas');c.width=Math.max(4,Math.round(wU*ppu));c.height=Math.max(4,Math.round(lU*ppu));return c}

function stone(wU,lU,ppu,seed){const c=canvas(wU,lU,ppu),g=c.getContext('2d'),R=rngMulberry(seed*733+1),pal=KINDS.stone[pick(R,Object.keys(KINDS.stone))],W=c.width,H=c.height,gr=Math.max(1,ppu*.025);
  g.fillStyle=darken(pal[0],.45);g.fillRect(0,0,W,H); /* grout */
  for(let v=0;v<lU;){const rh=.4+R()*.35;let u=-R()*.6;while(u<wU){const L=.45+R()*.8,col=mix(pick(R,pal),pick(R,pal),R()),x=u*ppu+gr/2,y=v*ppu+gr/2,w=L*ppu-gr,h=rh*ppu-gr;
      g.fillStyle=col;g.fillRect(x,y,w,h);
      const sh=g.createLinearGradient(x,y,x+w,y+h);sh.addColorStop(0,'rgba(255,250,235,.14)');sh.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=sh;g.fillRect(x,y,w,h); /* light from the upper left */
      for(let i=0;i<w*h/90;i++){g.fillStyle=R()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.07)';g.fillRect(x+R()*w,y+R()*h,1+R()*2,1+R()*1.5)}
      if(R()<.12){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;g.beginPath();g.moveTo(x+R()*w,y);g.lineTo(x+R()*w,y+h*(.4+R()*.6));g.stroke()} /* a hairline crack */
      u+=L}v+=rh}
  const wear=g.createLinearGradient(0,0,W,0);wear.addColorStop(0,'rgba(255,255,255,0)');wear.addColorStop(.5,'rgba(255,250,235,.09)');wear.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=wear;g.fillRect(0,0,W,H);
  return c}

function wood(wU,lU,ppu,seed){const c=canvas(wU,lU,ppu),g=c.getContext('2d'),R=rngMulberry(seed*911+3),pal=KINDS.wood[pick(R,Object.keys(KINDS.wood))],W=c.width,H=c.height,pw=(.12+R()*.08)*ppu,seam=Math.max(1,ppu*.012);
  g.fillStyle=darken(pal[0],.5);g.fillRect(0,0,W,H);let prev=[];
  for(let x=0,row=0;x<W;x+=pw,row++){let v=-R()*2*ppu;const joints=[];
    while(v<H){let L=(.9+R()*1.6)*ppu;const end=v+L;if(prev.some(j=>Math.abs(j-end)<pw*2))L+=pw*2.2; /* keep end joints apart from the last row's */
      const col=mix(pick(R,pal),pick(R,pal),R()),y0=v+seam,h=L-seam;g.fillStyle=col;g.fillRect(x+seam/2,y0,pw-seam,h);
      g.save();g.beginPath();g.rect(x+seam/2,y0,pw-seam,h);g.clip();g.strokeStyle=darken(col,.22);g.globalAlpha=.5;g.lineWidth=Math.max(.6,ppu*.006);const sd=R()*99;
      for(let k=1;k<4;k++){const xx=x+pw*k/4;g.beginPath();for(let t=0;t<=20;t++){const yy=y0+h*t/20;g.lineTo(xx+pw*.12*Math.sin(yy/(ppu*.35)+sd+k)+pw*.08*(fbm(xx*.05,yy*.02,sd)-.5),yy)}g.stroke()}
      if(R()<.18){const ky=y0+R()*h,kx=x+pw*(.3+R()*.4);g.globalAlpha=.7;g.fillStyle=darken(col,.45);g.beginPath();g.ellipse(kx,ky,pw*.12,pw*.2,0,0,7);g.fill()}
      g.globalAlpha=1;const sh=g.createLinearGradient(x,0,x+pw,0);sh.addColorStop(0,'rgba(255,245,225,.12)');sh.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=sh;g.fillRect(x,y0,pw,h);g.restore();
      joints.push(v+L);v+=L}prev=joints}
  return c}

function carpet(wU,lU,ppu,seed){const c=canvas(wU,lU,ppu),g=c.getContext('2d'),R=rngMulberry(seed*577+5),[field,border,ivory,gold]=(R(),R(),KINDS.carpet[(seed+Math.floor(R()*4))%KINDS.carpet.length]),W=c.width,H=c.height,u=ppu;
  const fr=u*.06;g.fillStyle=ivory;g.fillRect(0,0,W,H);
  for(let x=0;x<W;x+=Math.max(2,u*.03)){g.fillStyle='rgba(120,100,70,.35)';g.fillRect(x,0,1,fr);g.fillRect(x,H-fr,1,fr)} /* fringe at both ends */
  const b=Math.min(W,H-2*fr)*.14,X0=0,Y0=fr,X1=W,Y1=H-fr;
  g.fillStyle=border;g.fillRect(X0,Y0,X1-X0,Y1-Y0);
  g.fillStyle=gold;g.fillRect(X0+b*.12,Y0+b*.12,X1-X0-b*.24,Y1-Y0-b*.24);g.fillStyle=border;g.fillRect(X0+b*.2,Y0+b*.2,X1-X0-b*.4,Y1-Y0-b*.4); /* guard stripe */
  /* border motif: a running chain of small diamonds */
  const step=b*.7;g.fillStyle=ivory;const dia=(x,y,s)=>{g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.fill()};
  for(let x=X0+b;x<X1-b;x+=step){dia(x,Y0+b*.55,b*.18);dia(x,Y1-b*.55,b*.18)}for(let y=Y0+b;y<Y1-b;y+=step){dia(X0+b*.55,y,b*.18);dia(X1-b*.55,y,b*.18)}
  g.fillStyle=gold;g.fillRect(X0+b*.92,Y0+b*.92,X1-X0-b*1.84,Y1-Y0-b*1.84);
  const fx0=X0+b,fy0=Y0+b,fx1=X1-b,fy1=Y1-b;g.fillStyle=field;g.fillRect(fx0,fy0,fx1-fx0,fy1-fy0);
  /* field: a lattice of small motifs and a medallion */
  g.fillStyle=mix(field,ivory,.25);const ls=Math.max(6,b*.9);for(let y=fy0+ls/2;y<fy1;y+=ls)for(let x=fx0+ls/2+((y/ls|0)%2)*ls/2;x<fx1;x+=ls)dia(x,y,ls*.12);
  const mx=(fx0+fx1)/2,my=(fy0+fy1)/2,mr=Math.min(fx1-fx0,fy1-fy0)*.3;g.fillStyle=border;g.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?mr*.75:mr;g.lineTo(mx+Math.cos(a)*r,my+Math.sin(a)*r*1.25)}g.closePath();g.fill();
  g.fillStyle=gold;dia(mx,my,mr*.45);g.fillStyle=ivory;dia(mx,my,mr*.2);
  for(const[cx,cy]of[[fx0,fy0],[fx1,fy0],[fx0,fy1],[fx1,fy1]]){g.fillStyle=border;g.beginPath();g.arc(cx,cy,mr*.45,0,7);g.fill()} /* corner spandrels */
  for(let i=0;i<W*H/60;i++){g.fillStyle=R()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';g.fillRect(R()*W,R()*H,1,1)} /* pile */
  return c}

window.FLOORS={stone,wood,carpet,KINDS};
})();
