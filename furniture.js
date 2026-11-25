/* Furniture for rooms: bookshelf, armchair, side table (with a lamp). Needs core.js.
   Research: research/objects/furniture/. Sizes follow standard furniture (taking 1 unit = 1 m):
   bookshelf about 2 m tall with shelves every 0.28 m; armchair about 0.85 m wide and 0.95 m tall, seat at 0.45 m;
   side table about 0.63 m tall and 0.5 m wide.

   FURNITURE.bookshelf(w, h, seed)               a canvas w x h px: a built-in bookcase seen from the front, full of books
   FURNITURE.armchair(ctx, x, y, size, seed, o)  an upholstered armchair standing on (x, y), size = its width in px
                                                  o.view 'front' | 'side' (profile, facing right; o.mirror faces left)
   FURNITURE.sideTable(ctx, x, y, size, seed, o) a round side table on (x, y), size = its width in px; o.lamp: a lit lamp on it,
                                                  o.t: seconds, for the lamp's flicker
   FURNITURE.COLOURS                              the upholstery and wood colours the seed chooses from
   Light from the upper left, as everywhere else. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('furniture.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry}=A;
const COLOURS={cloth:['#7a2a2a','#2f4a3a','#3a3f6a','#7a5a2a','#5a2f4f'],wood:['#5a3820','#6e4526','#4a2e1c'],books:['#7a2a2a','#2f4a6a','#2f5a3a','#6a5a2a','#4a2f4f','#8a6a3a','#2a2a2a','#9a4a2a','#3a5a6a','#6a3a2a']};
const pick=(R,a)=>a[Math.floor(R()*a.length)];

/* ---- bookshelf: a wooden case, shelves every ~0.28 of 2 m, books of many heights and colours, some leaning, a few gaps ---- */
function bookshelf(w,h,seed){const c=document.createElement('canvas');c.width=Math.max(8,Math.round(w));c.height=Math.max(8,Math.round(h));const g=c.getContext('2d'),R=rngMulberry(seed*131+7),wood=pick(R,COLOURS.wood),W=c.width,H=c.height;
  const side=Math.max(2,W*.04),top=Math.max(3,H*.04),base=Math.max(4,H*.06),n=Math.max(3,Math.round(H/(W*.4))),sh=(H-top-base)/n,board=Math.max(1.5,sh*.07);
  g.fillStyle=darken(wood,.55);g.fillRect(0,0,W,H); /* the dark back of the case */
  for(let i=0;i<n;i++){const y0=top+i*sh,yb=y0+sh-board;let x=side+1;
    while(x<W-side-2){const bw=Math.max(1.5,W*(.025+R()*.035)),bh=sh*(.62+R()*.3);if(R()<.06){x+=bw*2.2;continue} /* a gap */
      const col=mix(pick(R,COLOURS.books),'#2a2018',R()*.3),lean=R()<.05&&x>side+bw*3;
      g.save();if(lean){g.translate(x,yb);g.rotate(-.25);g.translate(-x,-yb)}
      const gr=g.createLinearGradient(x,0,x+bw,0);gr.addColorStop(0,lighten(col,.18));gr.addColorStop(1,darken(col,.3));g.fillStyle=gr;g.fillRect(x,yb-bh,bw,bh);
      if(bw>3){g.fillStyle='rgba(230,200,120,.55)';g.fillRect(x+bw*.15,yb-bh*.85,bw*.7,Math.max(1,bh*.03));g.fillRect(x+bw*.15,yb-bh*.25,bw*.7,Math.max(1,bh*.03))} /* gilt bands */
      g.restore();x+=bw+(R()<.15?1:0)}
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(side,y0,W-2*side,sh*.12); /* shadow under the shelf above */
    g.fillStyle=wood;g.fillRect(0,yb,W,board);g.fillStyle=lighten(wood,.25);g.fillRect(0,yb,W,Math.max(1,board*.35))}
  g.fillStyle=wood;g.fillRect(0,0,side,H);g.fillRect(W-side,0,side,H);g.fillRect(0,0,W,top);g.fillRect(0,H-base,W,base);
  g.fillStyle=lighten(wood,.22);g.fillRect(0,0,Math.max(1,side*.35),H);g.fillRect(0,0,W,Math.max(1,top*.3));g.fillStyle=darken(wood,.3);g.fillRect(W-side*.4,0,side*.4,H);
  g.fillStyle=darken(wood,.2);g.fillRect(0,top*.6,W,Math.max(1,top*.25)); /* cornice */
  return c}

/* ---- armchair: a rolled-arm club chair, upholstered, on short turned legs ---- */
function armchair(ctx,x,y,size,seed,o){o=o||{};const R=rngMulberry(seed*17+3),cloth=o.cloth||pick(R,COLOURS.cloth),wood=pick(R,COLOURS.wood),s=size,dk=darken(cloth,.3),lt=lighten(cloth,.18);
  ctx.save();ctx.translate(x,y);if(o.mirror)ctx.scale(-1,1);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,0,s*.55,s*.09,0,0,7);ctx.fill();
  const rr=(X,Y,w,h,r,f)=>{ctx.beginPath();ctx.roundRect(X,Y,w,h,r);ctx.fillStyle=f;ctx.fill()};
  if(o.view==='side'){ /* profile facing right: back at the left, seat, a rolled arm on top, legs */
    ctx.fillStyle=wood;ctx.fillRect(-s*.42,-s*.1,s*.06,s*.1);ctx.fillRect(s*.34,-s*.1,s*.06,s*.1);
    rr(-s*.48,-s*1.08,s*.26,s*1.0,s*.1,dk);                      /* back, seen edge-on and raked */
    rr(-s*.44,-s*.5,s*.9,s*.4,s*.06,cloth);                      /* seat base */
    rr(-s*.3,-s*.6,s*.74,s*.14,s*.06,lt);                        /* seat cushion */
    rr(-s*.46,-s*.72,s*.94,s*.24,s*.12,cloth);                   /* the arm, along the side */
    ctx.fillStyle=lt;ctx.beginPath();ctx.ellipse(s*.38,-s*.6,s*.1,s*.12,0,0,7);ctx.fill(); /* rolled arm front */
    ctx.strokeStyle=dk;ctx.lineWidth=Math.max(1,s*.012);ctx.beginPath();ctx.ellipse(s*.38,-s*.6,s*.05,s*.06,0,0,7);ctx.stroke()}
  else{ /* front: back, two rolled arms, seat cushion, legs */
    ctx.fillStyle=wood;for(const lx of[-.4,.34])ctx.fillRect(lx*s,-s*.1,s*.06,s*.1);
    rr(-s*.4,-s*1.1,s*.8,s*.7,s*.18,dk);rr(-s*.36,-s*1.05,s*.72,s*.6,s*.16,cloth);  /* back */
    rr(-s*.36,-s*.52,s*.72,s*.42,s*.05,cloth);rr(-s*.34,-s*.6,s*.68,s*.16,s*.06,lt); /* seat */
    for(const sd of[-1,1]){rr(sd>0?s*.3:-s*.5,-s*.72,s*.2,s*.62,s*.08,cloth);ctx.fillStyle=lt;ctx.beginPath();ctx.ellipse(sd*s*.4,-s*.7,s*.11,s*.07,0,0,7);ctx.fill()} /* rolled arms */
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-s*.34,-s*1.0,s*.2,s*.5)}
  ctx.restore()}

/* ---- side table: a round top on a turned pedestal; a small lamp with a warm shade and a book ---- */
function sideTable(ctx,x,y,size,seed,o){o=o||{};const R=rngMulberry(seed*23+9),wood=pick(R,COLOURS.wood),s=size,top=-s*1.26;
  ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,0,s*.45,s*.07,0,0,7);ctx.fill();
  ctx.fillStyle=wood;ctx.beginPath();ctx.moveTo(-s*.32,0);ctx.quadraticCurveTo(0,-s*.18,s*.32,0);ctx.lineTo(s*.28,s*.02);ctx.quadraticCurveTo(0,-s*.12,-s*.28,s*.02);ctx.fill(); /* tripod foot */
  ctx.fillRect(-s*.05,top,s*.1,-top-s*.1);ctx.beginPath();ctx.ellipse(0,top*.55,s*.09,s*.05,0,0,7);ctx.fill(); /* pedestal and its turned knop */
  ctx.fillStyle=darken(wood,.2);ctx.beginPath();ctx.ellipse(0,top+s*.03,s*.5,s*.1,0,0,7);ctx.fill();ctx.fillStyle=lighten(wood,.15);ctx.beginPath();ctx.ellipse(0,top,s*.5,s*.1,0,0,7);ctx.fill();
  const bc=pick(R,COLOURS.books);ctx.fillStyle=bc;ctx.fillRect(s*.05,top-s*.06,s*.3,s*.06);ctx.fillStyle='#efe4c8';ctx.fillRect(s*.07,top-s*.045,s*.26,s*.025);
  if(o.lamp){const lit=.85+.15*Math.sin((o.t||0)*7+seed);ctx.fillStyle='#b08a3c';ctx.fillRect(-s*.2,top-s*.06,s*.12,s*.06);ctx.fillRect(-s*.155,top-s*.5,s*.03,s*.45);
    const gl=ctx.createRadialGradient(-s*.14,top-s*.55,0,-s*.14,top-s*.55,s*1.3);gl.addColorStop(0,`rgba(255,200,120,${.4*lit})`);gl.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(-s*.14,top-s*.55,s*1.3,0,7);ctx.fill();
    ctx.fillStyle=`rgb(${Math.round(240*lit)},${Math.round(196*lit)},${Math.round(120*lit)})`;ctx.beginPath();ctx.moveTo(-s*.3,top-s*.42);ctx.lineTo(s*.02,top-s*.42);ctx.lineTo(-s*.05,top-s*.7);ctx.lineTo(-s*.23,top-s*.7);ctx.closePath();ctx.fill()}
  ctx.restore()}

window.FURNITURE={bookshelf,armchair,sideTable,COLOURS};
})();
