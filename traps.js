/* Traps for the Euclid game. Needs core.js. Research: research/objects/traps.md. Front or floor views, light from the
   upper left; size in px per metre. These are the parts a room draws in its own perspective:
   TRAPS.plate(ctx,pts,o)               a pressure plate on the floor: pts = its four corners already projected; o.down (pressed)
   TRAPS.spikes(ctx,x,y,w,h,u)          bronze spikes thrust up from the floor; u = 0 (hidden) .. 1 (fully out)
   TRAPS.nozzle(ctx,x,y,r)              a lion-mouth flame nozzle set in a wall, seen face on
   TRAPS.flame(ctx,x0,y0,x1,y1,w,t,u)   a jet of flame from (x0,y0) toward (x1,y1); u = how far it reaches (0..1)
   TRAPS.fog(ctx,x,y,r,t,u)             a cloud of green poison fog; u = how thick (0..1)
   TRAPS.stud(ctx,x,y,r,o)              a path-trap point: a bronze stud in the floor; o.lit (visited), o.here (where you stand)
   TRAPS.edge(ctx,a,b,w,o)              a path-trap edge inlaid in the floor between two projected points; o.walked (glows gold), o.bad (red) */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('traps.js needs core.js loaded first');
const {lighten,darken}=A,TAU=Math.PI*2;
function plate(ctx,pts,o){o=o||{};ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=o.down?'rgba(60,50,40,.55)':'rgba(120,110,95,.38)';ctx.fill();
  ctx.strokeStyle=o.down?'rgba(30,20,10,.7)':'rgba(70,60,50,.45)';ctx.lineWidth=1;ctx.stroke();const c=pts.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);ctx.fillStyle='rgba(40,30,20,.35)';for(const p of pts){ctx.beginPath();ctx.arc((p[0]*.25+c[0]*.75),(p[1]*.25+c[1]*.75),1.2,0,TAU);ctx.fill()}}
function spikes(ctx,x,y,w,h,u){if(u<=0)return;const n=Math.max(3,Math.round(w/(h*.25)));for(let i=0;i<n;i++){const sx=x-w/2+w*(i+.5)/n,sh=h*u*(.8+.2*((i*7)%3)/2),sw=w/n*.35;
  const g=ctx.createLinearGradient(sx-sw,0,sx+sw,0);g.addColorStop(0,'#e0b870');g.addColorStop(1,'#7a5020');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx-sw,y);ctx.lineTo(sx,y-sh);ctx.lineTo(sx+sw,y);ctx.closePath();ctx.fill();ctx.strokeStyle='#5a3a10';ctx.lineWidth=Math.max(.5,sw*.15);ctx.stroke()}}
function nozzle(ctx,x,y,r){const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'#c8a060');g.addColorStop(1,'#6a4a20');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='#4a3010';ctx.lineWidth=Math.max(.6,r*.1);ctx.stroke();
  ctx.fillStyle='#1a1008';ctx.beginPath();ctx.ellipse(x,y+r*.25,r*.4,r*.25,0,0,TAU);ctx.fill();ctx.fillStyle='#4a3010';for(const s of[-1,1]){ctx.beginPath();ctx.arc(x+s*r*.35,y-r*.25,r*.1,0,TAU);ctx.fill()}}
function flame(ctx,x0,y0,x1,y1,w,t,u){if(u<=0)return;const ex=x0+(x1-x0)*u,ey=y0+(y1-y0)*u,ang=Math.atan2(ey-y0,ex-x0),L=Math.hypot(ex-x0,ey-y0);ctx.save();ctx.translate(x0,y0);ctx.rotate(ang);
  for(const[k,c]of[[1,'rgba(230,80,20,.7)'],[.6,'rgba(255,160,40,.85)'],[.3,'rgba(255,235,160,.9)']]){ctx.beginPath();ctx.moveTo(0,-w*k*.2);for(let i=0;i<=8;i++){const s=i/8;ctx.lineTo(L*s,-w*k*(.2+s*.8)*(1+.15*Math.sin(t*20+i*2)))}for(let i=8;i>=0;i--){const s=i/8;ctx.lineTo(L*s,w*k*(.2+s*.8)*(1+.15*Math.sin(t*17+i*3)))}ctx.closePath();ctx.fillStyle=c;ctx.fill()}ctx.restore()}
function fog(ctx,x,y,r,t,u){if(u<=0)return;ctx.save();for(let i=0;i<9;i++){const a=i/9*TAU+t*.3,d=r*.45*(1+.2*Math.sin(t+i)),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d*.4,rr=r*(.45+.1*Math.sin(t*1.3+i));const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,`rgba(140,200,80,${.35*u})`);g.addColorStop(1,'rgba(140,200,80,0)');ctx.fillStyle=g;ctx.fillRect(cx-rr,cy-rr,2*rr,2*rr)}ctx.restore()}
function stud(ctx,x,y,r,o){o=o||{};ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+r*.2,r*1.1,r*.45,0,0,TAU);ctx.fill();const c=o.here?'#ffd27a':o.lit?'#e0b860':'#a07a40',g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,lighten(c,.4));g.addColorStop(1,darken(c,.3));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r,r*.45,0,0,TAU);ctx.fill();ctx.strokeStyle=darken(c,.5);ctx.lineWidth=Math.max(.5,r*.12);ctx.stroke();
  if(o.here){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,210,120,.35)';ctx.beginPath();ctx.ellipse(x,y,r*2,r*.9,0,0,TAU);ctx.fill();ctx.restore()}}
function edge(ctx,a,b,w,o){o=o||{};ctx.lineCap='round';ctx.strokeStyle='rgba(40,30,20,.45)';ctx.lineWidth=w*1.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle=o.bad?'#d83a2a':o.walked?'#ffd27a':'#b8955a';ctx.lineWidth=w;ctx.stroke();
  if(o.walked||o.bad){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=o.bad?'rgba(255,80,40,.4)':'rgba(255,210,120,.35)';ctx.lineWidth=w*3;ctx.stroke();ctx.restore()}}
window.TRAPS={plate,spikes,nozzle,flame,fog,stud,edge};
})();
