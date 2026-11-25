/* Containers: chests (and later boxes and trunks), drawn from research traits.
   Needs core.js. Research: research/objects/containers/ (traits vocabulary "container" in research/traits.yaml).

   CONTAINERS.drawChest(ctx, traits, x, y, size, state, seed, opts)
     traits  merged traits (research/index.json "merged", or CONTAINERS.defaults overridden by your own)
     x, y    where the middle of the chest's front edge meets the floor
     size    the chest's width on screen, in px
     state   'closed' | 'open'
     seed    the same seed draws the same chest every time
     opts    view: 'three-quarter' (default) | 'front';  mirror: true to face the other way;
             fill: 0..1 how full it is when open (default .6);  lid: opening angle in degrees (default 105)
   CONTAINERS.states(traits)   the states this chest can be drawn in */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('containers.js needs core.js loaded first');
const DEF={construction:'six-board',lid:'flat',width:1,height:.5,depth:.52,lid_height:.09,board_thickness:.035,planks:3,feet:'none',wood:'oak',wood_colour:'#7a5230',grain:'flat-sawn',
  metal:'wrought iron',metal_colour:'#3b3a3a',bands:2,corner_brackets:true,edge_binding:true,strap_hinges:true,lock_plate:'rectangle',hasp:true,handles:'ring',rivets:.6,contents:'coins',wear:.4,states:['closed','open']};
const {mix,lighten,darken,face,shade,ink,weight,lod,fbm,noise}=A;

/* ---------- wood: one board at a time ---------- */
function board(ctx,u0,v0,L,H,col,t,R,detail){ /* a board lying along u, from (u0,v0), L long and H high, in face units */
  const c=mix(mix(col,R()<.5?lighten(col,.12):darken(col,.12),R()),'#6b6158',t.wear*.32);ctx.fillStyle=c;ctx.fillRect(u0,v0-H*.01,L,H*1.02);
  if(detail==='icon')return;
  ctx.save();ctx.beginPath();ctx.rect(u0,v0,L,H);ctx.clip();
  const n=detail==='detail'?9:5,lw=H*.035,cx=u0+L*(.25+R()*.5),k=(1.6+R()*2.2)/L,sd=R()*1000;
  ctx.lineWidth=lw;ctx.strokeStyle=darken(c,.28);ctx.globalAlpha=.5;
  if(t.grain==='flat-sawn'){ /* cathedral grain: nested arches along the board */
    for(let i=0;i<n;i++){const top=v0+H*(.15+.9*i/n);ctx.beginPath();for(let s=0;s<=40;s++){const u=u0+L*s/40,du=u-cx,v=top-k*du*du*H*1.6+H*.12*(fbm(u*4,i*.7,sd)-.5);s?ctx.lineTo(u,v):ctx.moveTo(u,v)}ctx.stroke()}}
  else{for(let i=1;i<n;i++){const vv=v0+H*i/n;ctx.beginPath();for(let s=0;s<=30;s++){const u=u0+L*s/30,v=vv+H*.05*(fbm(u*3,i,sd)-.5);s?ctx.lineTo(u,v):ctx.moveTo(u,v)}ctx.stroke()}
    if(t.grain==='quarter-sawn'){ctx.globalAlpha=.25;ctx.fillStyle=lighten(c,.25);for(let i=0;i<L*14;i++){ctx.fillRect(u0+R()*L,v0+R()*H,L*.03,H*.04)}}}
  if(R()<.35){const ku=u0+L*(.15+R()*.7),kv=v0+H*(.3+R()*.4);ctx.globalAlpha=.75;ctx.fillStyle=darken(c,.45);ctx.beginPath();ctx.ellipse(ku,kv,H*.09,H*.06,0,0,7);ctx.fill();
    ctx.globalAlpha=.4;ctx.strokeStyle=darken(c,.35);ctx.lineWidth=lw;for(let r=1;r<3;r++){ctx.beginPath();ctx.ellipse(ku,kv,H*.09+r*H*.05,H*.06+r*H*.035,0,0,7);ctx.stroke()}}
  /* splits along the grain, more with wear */
  if(R()<t.wear*.9){ctx.globalAlpha=.8;ctx.strokeStyle=darken(c,.6);ctx.lineWidth=H*.03;const fromLeft=R()<.5,len=L*(.15+R()*.35),cv=v0+H*(.25+R()*.5);ctx.beginPath();for(let s2=0;s2<=12;s2++){const u=fromLeft?u0+len*s2/12:u0+L-len*s2/12;ctx[s2?'lineTo':'moveTo'](u,cv+H*.04*(noise(u*20,cv*20,sd)-.5))}ctx.stroke()}
  /* wear: lighter along the top edge, grime low down */
  ctx.globalAlpha=1;const g=ctx.createLinearGradient(0,v0,0,v0+H);g.addColorStop(0,'rgba(0,0,0,'+(.12+.18*t.wear)+')');g.addColorStop(.35,'rgba(0,0,0,0)');g.addColorStop(.92,'rgba(255,240,210,0)');g.addColorStop(1,'rgba(255,240,210,'+(.12*t.wear)+')');ctx.fillStyle=g;ctx.fillRect(u0,v0,L,H);
  ctx.restore();
  /* the seam above this board: dark gap with a lit lip */
  ctx.fillStyle=darken(c,.55);ctx.fillRect(u0,v0+H-H*.04,L,H*.04);}
function boards(ctx,L,H,n,col,t,R,detail){ctx.fillStyle=darken(col,.2);ctx.fillRect(-.004,-.004,L+.008,H+.008);const hs=[];let sum=0;for(let i=0;i<n;i++){const h=.8+R()*.4;hs.push(h);sum+=h}let v=0;for(let i=0;i<n;i++){const h=H*hs[i]/sum;board(ctx,0,v,L,h,col,t,R,detail);v+=h}}

/* ---------- metal ---------- */
function strap(ctx,u,v,w,h,col,t,R,detail,sd){ /* a flat metal strap in face units, with its lit top edge */
  ctx.fillStyle=col;ctx.fillRect(u,v,w,h);if(detail==='icon')return;
  const e=Math.min(w,h)*.22;ctx.fillStyle=lighten(col,.28);if(w>h)ctx.fillRect(u,v+h-e,w,e);else ctx.fillRect(u,v,e,h);
  ctx.fillStyle=darken(col,.45);if(w>h)ctx.fillRect(u,v,w,e*.7);else ctx.fillRect(u+w-e*.7,v,e*.7,h);
  if(t.wear>0){ctx.save();ctx.beginPath();ctx.rect(u,v,w,h);ctx.clip();const n=Math.round((w*h)*900*t.wear);for(let i=0;i<n;i++){const px=u+R()*w,py=v+R()*h;if(noise(px*30,py*30,sd)<.62-t.wear*.42)continue;
    ctx.fillStyle=R()<.6?`rgba(150,72,28,${.35+.5*t.wear})`:`rgba(205,200,190,${.2+.3*t.wear})`;const r=Math.min(w,h)*(.06+R()*.1);ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill()}ctx.restore()}}
function rivet(ctx,u,v,r,col){ctx.fillStyle=darken(col,.35);ctx.beginPath();ctx.arc(u,v,r,0,7);ctx.fill();ctx.fillStyle=lighten(col,.45);ctx.beginPath();ctx.arc(u-r*.3,v+r*.3,r*.45,0,7);ctx.fill()}
function rivetsAlong(ctx,u0,v0,u1,v1,r,col,t,detail){if(detail!=='detail'&&detail!=='card')return;const L=Math.hypot(u1-u0,v1-v0),n=Math.max(2,Math.round(L/(r*10)*t.rivets*1.6));for(let i=0;i<n;i++){const f=(i+.5)/n;rivet(ctx,u0+(u1-u0)*f,v0+(v1-v0)*f,r,col)}}
function bracket(ctx,cu,cv,su,sv,len,wd,col,t,R,detail,sd,r){ /* an L-shaped corner bracket; su,sv = +1/-1, which way its arms run */
  strap(ctx,su>0?cu:cu-len,sv>0?cv:cv-wd,len,wd,col,t,R,detail,sd);strap(ctx,su>0?cu:cu-wd,sv>0?cv:cv-len,wd,len,col,t,R,detail,sd+1);
  if(detail!=='icon'){rivet(ctx,cu+su*wd*.5,cv+sv*wd*.5,r,col);rivet(ctx,cu+su*len*.75,cv+sv*wd*.5,r,col);rivet(ctx,cu+su*wd*.5,cv+sv*len*.75,r,col)}}
function edges(ctx,L,H,wd,col,t,R,detail,sd,which){which=which||'lrtb';if(which.includes('b'))strap(ctx,0,0,L,wd,col,t,R,detail,sd);if(which.includes('t'))strap(ctx,0,H-wd,L,wd,col,t,R,detail,sd+2);if(which.includes('l'))strap(ctx,0,0,wd,H,col,t,R,detail,sd+3);if(which.includes('r'))strap(ctx,L-wd,0,wd,H,col,t,R,detail,sd+4)}
function bandsU(t,L){const n=t.bands|0;if(!n)return[];const out=[];for(let i=0;i<n;i++)out.push(n===1?L/2:L*(.18+.64*i/(n-1)));return out}
function outline(ctx,L,H,col,px){ctx.strokeStyle=ink(col);ctx.lineWidth=weight(px)/((ctx.getTransform().a**2+ctx.getTransform().b**2)**.5||1);ctx.globalAlpha=.85;ctx.strokeRect(0,0,L,H);ctx.globalAlpha=1}

/* ---------- the chest ---------- */
function drawChest(ctx,traits,x,y,size,state,seed,opts){
  const t=Object.assign({},DEF,traits||{}),o=opts||{},R=A.rngLCG(seed||7),sd=(seed||7)*13,detail=lod(size),open=state==='open';
  const W=1,H=t.height,D=t.depth,LH=t.lid_height,bt=t.board_thickness,foot=t.feet==='none'?0:.05,ov=.012;
  const V=A.view(o.view||'three-quarter',size,{mirror:o.mirror}),wood=t.wood_colour,metal=t.metal_colour,mw=.045,rr=.009,F=(O,U,Wv,fn)=>face(ctx,V,O,U,Wv,fn);
  const nFront=[0,0,-1],nTop=[0,1,0],nSide=o.mirror?[-1,0,0]:[1,0,0],sideX=o.mirror?0:W,farX=o.mirror?W:0;
  ctx.save();const base=V.p(.5,0,0);ctx.translate(x-base[0],y-base[1]);
  /* contact shadow on the floor */
  {const pts=[[-.03,-.02],[W+.03,-.02],[W+.03,D+.04],[-.03,D+.04]].map(([a,b])=>V.p(a,0,b));ctx.save();ctx.filter=`blur(${Math.max(1,size*.025)}px)`;ctx.fillStyle='rgba(20,12,4,.38)';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.restore()}
  const y0=foot;
  /* feet */
  if(foot){const fc=shade(darken(wood,.15),nFront);for(const fx of[.04,W-.12]){F([fx,0,0],[.08,0,0],[0,foot,0],(c,l,h)=>{c.fillStyle=fc;c.fillRect(0,0,l,h)});F([o.mirror?fx:fx+.08,0,0],[0,0,D],[0,foot,0],(c,l,h)=>{c.fillStyle=shade(wood,nSide);c.fillRect(0,0,l,h)})}}
  const fronts=(c,L,Hh,col)=>{boards(c,L,Hh,t.planks,col,t,R,detail)};
  /* the lid's geometry: profile points (z, y) of its top surface, from front to back */
  const prof=[];if(t.lid==='domed'){for(let i=0;i<=8;i++){const a=Math.PI*i/8;prof.push([D/2-Math.cos(a)*(D/2+ov),y0+H+Math.sin(a)*LH])}}else{prof.push([-ov,y0+H+LH],[D+ov*0,y0+H+LH])}
  const phi=(o.lid==null?105:o.lid)*Math.PI/180,hy=y0+H,hz=D;
  const rot=open?(z,yy)=>{const dz=z-hz,dy=yy-hy;return[hz+dz*Math.cos(phi)+dy*Math.sin(phi),hy-dz*Math.sin(phi)+dy*Math.cos(phi)]}:(z,yy)=>[z,yy];
  const rv=(v)=>open?[v[0],-v[2]*Math.sin(phi)+v[1]*Math.cos(phi),v[2]*Math.cos(phi)+v[1]*Math.sin(phi)]:v; /* rotate a direction vector */
  const P=(xx,z,yy)=>{const[zz,y2]=rot(z,yy);return[xx,y2,zz]};
  const lidX0=-ov,lidX1=W+ov;
  function lidOuter(){ /* the lid's outer surface: strips along x */
    const bu=bandsU(t,W);
    for(let i=0;i<prof.length-1;i++){const[z0,ya]=prof[i],[z1,yb]=prof[i+1],O=P(lidX0,z0,ya),O2=P(lidX0,z1,yb),Wv=[0,O2[1]-O[1],O2[2]-O[2]],n=rv([0,(z1-z0),-(yb-ya)]),col=shade(wood,n);
      F(O,[lidX1-lidX0,0,0],Wv,(c,l,h)=>{board(c,0,0,l,h+.001,col,t,R,detail);
        if(t.edge_binding&&(i===0))strap(c,0,0,l,mw,shade(metal,n),t,R,detail,sd+i);
        if(t.edge_binding){strap(c,0,0,mw,h,shade(metal,n),t,R,detail,sd+30+i);strap(c,l-mw,0,mw,h,shade(metal,n),t,R,detail,sd+40+i)}
        for(const b of bu)strap(c,b-ov-mw*.6,0,mw*1.2,h+.001,shade(metal,n),t,R,detail,sd+50+i);
        if(t.strap_hinges&&!bu.length)for(const b of[W*.3,W*.7])strap(c,b-mw*.6,0,mw*1.2,h+.001,shade(metal,n),t,R,detail,sd+60+i)})}
    /* the lid's front lip (flat lid): a narrow face below the top */
    if(t.lid!=='domed'){const O=P(lidX0,-ov,y0+H),n=rv(nFront);F(O,[lidX1-lidX0,0,0],(()=>{const Q=P(lidX0,-ov,y0+H+LH);return[0,Q[1]-O[1],Q[2]-O[2]]})(),(c,l,h)=>{c.fillStyle=shade(wood,n);c.fillRect(0,0,l,h);board(c,0,0,l,h,shade(wood,n),t,R,detail);
      if(t.edge_binding)edges(c,l,h,Math.min(mw,h*.35),shade(metal,n),t,R,detail,sd+70,'tb');for(const b of bandsU(t,W))strap(c,b-ov-mw*.6,0,mw*1.2,h,shade(metal,n),t,R,detail,sd+71);
      if(t.hasp&&!open){const hw=.07;strap(c,l/2-hw/2,-.05,hw,h+.05,shade(metal,n),t,R,detail,sd+72)}})}}
  function lidEnd(){ /* the lid's visible end (profile) */
    const n=rv(nSide);ctx.save();ctx.beginPath();const p0=V.p(...P(o.mirror?lidX0:lidX1,-ov,y0+H));ctx.moveTo(...p0);for(const[z,yy]of prof)ctx.lineTo(...V.p(...P(o.mirror?lidX0:lidX1,z,yy)));ctx.lineTo(...V.p(...P(o.mirror?lidX0:lidX1,D+ov*0,y0+H)));ctx.closePath();
    ctx.lineJoin='round';ctx.fillStyle=shade(darken(wood,.05),n);ctx.fill();ctx.strokeStyle=ink(wood);ctx.lineWidth=weight(size);ctx.stroke();
    if(t.edge_binding){ctx.strokeStyle=shade(metal,n);ctx.lineWidth=mw*size*.7;ctx.beginPath();for(let i=0;i<prof.length;i++){const[z,yy]=prof[i];const q=V.p(...P(o.mirror?lidX0:lidX1,z,yy));i?ctx.lineTo(...q):ctx.moveTo(...q)}ctx.stroke()}ctx.restore()}
  function lidInner(){ /* open: the underside of the lid, now facing us */
    const n=rv([0,-1,0]);const a=P(lidX0,-ov,y0+H),b=P(lidX0,D,y0+H);F(a,[lidX1-lidX0,0,0],[0,b[1]-a[1],b[2]-a[2]],(c,l,h)=>{const col=darken(shade(wood,n),.18);boards(c,l,h,Math.max(2,t.planks),col,t,R,detail);
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,.05)');g.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=g;c.fillRect(0,0,l,h);
      if(t.strap_hinges)for(const b2 of(bandsU(t,W).length?bandsU(t,W):[W*.3,W*.7])){c.fillStyle=darken(metal,.2);c.fillRect(b2-mw*.5,h-.06,mw,.06)}})}
  function box(){
    const fc=shade(wood,nFront),sc=shade(wood,nSide),mf=shade(metal,nFront),ms=shade(metal,nSide),bu=bandsU(t,W),cl=Math.min(.14,H*.3);
    /* the end */
    F([sideX,y0,0],[0,0,D],[0,H,0],(c,l,h)=>{boards(c,l,h,t.planks,sc,t,R,detail);
      if(t.edge_binding)edges(c,l,h,mw,ms,t,R,detail,sd+80);if(t.corner_brackets){bracket(c,0,0,1,1,cl,mw*1.2,ms,t,R,detail,sd+81,rr);bracket(c,0,h,1,-1,cl,mw*1.2,ms,t,R,detail,sd+82,rr);bracket(c,l,0,-1,1,cl,mw*1.2,ms,t,R,detail,sd+83,rr);bracket(c,l,h,-1,-1,cl,mw*1.2,ms,t,R,detail,sd+84,rr)}
      if(t.handles!=='none'){const hu=l/2,hv=h*.7,pr=.05;c.fillStyle=ms;c.fillRect(hu-pr,hv-pr*.6,pr*2,pr*1.2);rivet(c,hu-pr*.6,hv,rr,ms);rivet(c,hu+pr*.6,hv,rr,ms);c.strokeStyle=darken(ms,.2);c.lineWidth=.022;c.beginPath();
        if(t.handles==='ring')c.ellipse(hu,hv-.075,.07,.07,0,0,7);else{c.moveTo(hu-.09,hv);c.lineTo(hu-.09,hv-.07);c.quadraticCurveTo(hu,hv-.12,hu+.09,hv-.07);c.lineTo(hu+.09,hv)}c.stroke();c.strokeStyle=lighten(ms,.35);c.lineWidth=.007;c.stroke()}
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(.2,'rgba(0,0,0,0)');g.addColorStop(.9,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.2)');c.fillStyle=g;c.fillRect(0,0,l,h);outline(c,l,h,wood,size)});
    /* the front */
    F([0,y0,0],[W,0,0],[0,H,0],(c,l,h)=>{boards(c,l,h,t.planks,fc,t,R,detail);
      for(const b of bu){strap(c,b-mw*.6,0,mw*1.2,h,mf,t,R,detail,sd+90+b*10);rivetsAlong(c,b,mw,b,h-mw,rr,mf,t,detail)}
      if(t.edge_binding)edges(c,l,h,mw,mf,t,R,detail,sd+91);
      if(t.corner_brackets){bracket(c,0,0,1,1,cl,mw*1.2,mf,t,R,detail,sd+92,rr);bracket(c,0,h,1,-1,cl,mw*1.2,mf,t,R,detail,sd+93,rr);bracket(c,l,0,-1,1,cl,mw*1.2,mf,t,R,detail,sd+94,rr);bracket(c,l,h,-1,-1,cl,mw*1.2,mf,t,R,detail,sd+95,rr)}
      if(t.edge_binding)rivetsAlong(c,mw*2,h-mw*.5,l-mw*2,h-mw*.5,rr*.8,mf,t,detail);
      if(t.lock_plate!=='none'){const pw=.13,ph=Math.min(.17,h*.42),pu=l/2-pw/2,pv=h-ph-(t.edge_binding?mw*.4:0);c.fillStyle=mf;c.beginPath();if(t.lock_plate==='shield'){c.moveTo(pu,pv+ph);c.lineTo(pu+pw,pv+ph);c.lineTo(pu+pw,pv+ph*.35);c.quadraticCurveTo(pu+pw,pv,pu+pw/2,pv-ph*.05);c.quadraticCurveTo(pu,pv,pu,pv+ph*.35)}else c.rect(pu,pv,pw,ph);c.closePath();c.fill();
        c.strokeStyle=ink(metal,.6);c.lineWidth=.006;c.stroke();if(detail!=='icon'){c.fillStyle='#0b0a09';c.beginPath();c.arc(l/2,pv+ph*.55,.014,0,7);c.fill();c.beginPath();c.moveTo(l/2-.008,pv+ph*.55);c.lineTo(l/2+.008,pv+ph*.55);c.lineTo(l/2+.005,pv+ph*.25);c.lineTo(l/2-.005,pv+ph*.25);c.fill();
          for(const[du,dv]of[[.018,.02],[pw-.018,.02],[.018,ph-.02],[pw-.018,ph-.02]])rivet(c,pu+du,pv+dv,rr*.8,mf)}
        if(t.hasp&&!open){c.fillStyle=lighten(mf,.08);c.fillRect(l/2-.035,h-(t.lid==='domed'?.0:.0)-ph*.55,.07,ph*.55);rivet(c,l/2,h-ph*.4,rr,mf)}}
      /* occlusion under the lid lip and at the floor */
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.88,'rgba(0,0,0,0)');g.addColorStop(1,open?'rgba(0,0,0,0)':'rgba(0,0,0,.3)');c.fillStyle=g;c.fillRect(0,0,l,h);outline(c,l,h,wood,size)})}
  function interior(){const dk=c2=>darken(c2,.35);
    /* back wall (inside face), the far end (inside face) and the floor */
    F([0,y0,D-bt],[W,0,0],[0,H,0],(c,l,h)=>{boards(c,l,h,t.planks,dk(shade(wood,nFront)),t,R,detail);const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,.1)');c.fillStyle=g;c.fillRect(0,0,l,h)});
    F([o.mirror?W-bt:bt,y0,0],[0,0,D],[0,H,0],(c,l,h)=>{boards(c,l,h,t.planks,dk(shade(wood,o.mirror?[1,0,0]:[-1,0,0])),t,R,detail);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,l,h)});
    F([0,y0+bt,0],[W,0,0],[0,0,D],(c,l,h)=>{c.fillStyle=darken(wood,.55);c.fillRect(0,0,l,h)});
    if(t.contents==='coins')coins();else if(t.contents==='cloth')cloth()}
  function coins(){const f=o.fill==null?.6:o.fill;if(f<=0)return;const gold='#e2b13c',n=detail==='icon'?16:detail==='card'?120:300,list=[];
    for(let i=0;i<n;i++){const u=bt+.03+R()*(W-2*bt-.06),w=bt+.03+R()*(D-2*bt-.06),du=(u-W/2)/(W/2),dw=(w-D/2)/(D/2),hh=Math.max(0,1-(du*du*.8+dw*dw*.7))*H*(.55+.6*f);list.push([u,y0+bt+hh*(.9+R()*.1),w])}
    {const top=y0+bt+H*(.55+.6*f)*.5,c0=V.p(W/2,top,D/2),rx=(W/2-bt)*.92*size,ry=(D/2-bt)*.5*.53*size*1.4;ctx.save();ctx.fillStyle=darken(gold,.3);ctx.beginPath();ctx.ellipse(c0[0],c0[1],rx,ry+H*size*.18*f,0,0,7);ctx.fill();ctx.restore()}
    list.sort((a,b)=>b[2]-a[2]||a[1]-b[1]);const r=.032;
    for(const[u,yy,w]of list){const p=V.p(u,yy,w),rx=r*size,ry=r*size*.42,tilt=(R()-.5)*.5;ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(tilt);ctx.fillStyle=darken(gold,.38);ctx.beginPath();ctx.ellipse(0,ry*.35,rx,ry,0,0,7);ctx.fill();
      ctx.fillStyle=shade(gold,[0,1,-.2]);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,7);ctx.fill();if(detail!=='icon'){ctx.strokeStyle=darken(gold,.25);ctx.lineWidth=Math.max(.4,rx*.08);ctx.beginPath();ctx.ellipse(0,0,rx*.72,ry*.72,0,0,7);ctx.stroke();
      if(R()<.25){ctx.fillStyle='rgba(255,250,220,.9)';ctx.beginPath();ctx.ellipse(-rx*.35,-ry*.3,rx*.18,ry*.15,0,0,7);ctx.fill()}}ctx.restore()}}
  function cloth(){F([bt,y0+H*.55,bt],[W-2*bt,0,0],[0,0,D-2*bt],(c,l,h)=>{c.fillStyle='#7a2f3a';c.fillRect(0,0,l,h);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.01;for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,h*R());c.quadraticCurveTo(l/2,h*R(),l,h*R());c.stroke()}})}
  function rims(){const rc=lighten(shade(wood,nTop),.05),rim=(O,U,Wv)=>F(O,U,Wv,(c,l,h)=>{c.fillStyle=rc;c.fillRect(0,0,l,h);if(t.edge_binding){c.fillStyle=shade(metal,nTop);c.fillRect(0,0,l,h)}});
    rim([0,y0+H,D-bt],[W,0,0],[0,0,bt]);rim([farX===0?0:W-bt,y0+H,0],[bt,0,0],[0,0,D]);rim([0,y0+H,0],[W,0,0],[0,0,bt]);rim([sideX===W?W-bt:0,y0+H,0],[bt,0,0],[0,0,D])}
  if(open){lidInner();lidEnd();interior();box();rims()}else{box();lidOuter();lidEnd()}
  ctx.restore()}
window.CONTAINERS={defaults:DEF,drawChest,states:t=>((t&&t.states)||DEF.states).slice()};
})();
