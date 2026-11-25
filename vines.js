/* Vines: woody climbers that grow over a doorway, drawn from research. Needs core.js.
   Research: research/subjects/plants/english-ivy.md, vitaceae.md (muscadine.md, virginia-creeper.md), wisteria.md.

   VINES.render(ctx, kind, w, h, opts)    draws the vines over a door w x h px, its top-left corner at (0,0)
     kind    'english-ivy' | 'muscadine' | 'wisteria' | 'virginia-creeper'
     opts    seed     the same seed grows the same vine every time
             damage   0..1: how far the ax has cut it (0 untouched; the vine clears from the lock outward)
             state    'full' (damage 0) | 'damaged' (uses damage, default .5) | 'cut' (cut back: stubs at the frame, a heap at the foot)
             bloom    'none' | 'flowers' | 'fruit' | 'autumn' (what the vine carries; VINES.pick chooses one per door)
             lock     [u,v], where the lock sits, as fractions of w and h (default [.5,.53]); cutting starts there
   VINES.pick(seed)                       {kind, bloom}: a species and what it carries, the same for a seed every time
   VINES.removed(kind, aspect, seed, d0, d1, lock)   the leaves that fall between damage d0 and d1: [{x,y,a,s,col}],
                                          x and y as fractions of the door's width (y runs to aspect = h/w): for falling-leaf effects
   VINES.drawLeaf(ctx, kind, x, y, ang, size, col)   one leaf (for falling leaves); ang = the way the blade points, radians
   VINES.KINDS                            the species and their research-based settings
   Light from the upper left. Sizes follow the research, taking the door as about 1 m wide. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('vines.js needs core.js loaded first');
const {mix,lighten,darken}=A;
const TAU=Math.PI*2;

/* ---- species. Leaf and fruit sizes are in door widths (a door about 1 m wide). ---- */
const KINDS={
  'english-ivy':{title:'English ivy',latin:'Hedera helix',leafKind:'ivy',leaf:.072,leafCol:'#2c5627',leafAlt:'#1f4220',young:'#5f8a3c',vein:'#c8d6b4',
    bark:'#8b7656',barkYoung:'#6f7a43',stemW:.016,climb:'roots',roots:'#8a6a48',density:1.5,blooms:['none','none','flowers','fruit'],
    flower:'#c7cc6e',fruit:'#1c1d28'},
  'muscadine':{title:'Muscadine grape',latin:'Vitis rotundifolia',leafKind:'round',leaf:.12,leafCol:'#3d6b2c',leafAlt:'#2f5a24',young:'#7a9a3e',vein:'#a9bf7a',
    bark:'#6d5f45',barkYoung:'#7b7a4a',stemW:.02,climb:'tendril',density:1,blooms:['none','fruit','fruit'],
    fruitPurple:'#3b1a3c',fruitBronze:'#8f6a2a'},
  'wisteria':{title:'Wisteria',latin:'Wisteria sinensis / floribunda',leafKind:'pinnate',leaf:.24,leafCol:'#4a7a32',leafAlt:'#3a6728',young:'#8fae52',vein:'#b9cf8f',
    bark:'#8a8780',barkYoung:'#7d7458',stemW:.03,climb:'twine',density:.62,blooms:['none','flowers','flowers','fruit'],
    flower:'#9a7fd2',flowerPale:'#cbb8ee',bud:'#6a52a8',pod:'#8c8a62'},
  'virginia-creeper':{title:'Virginia creeper',latin:'Parthenocissus quinquefolia',leafKind:'palmate',leaf:.15,leafCol:'#335f2a',leafAlt:'#2a5022',young:'#6f8f3a',vein:'#9fb57a',
    bark:'#6a5648',barkYoung:'#8a3b2c',stemW:.016,climb:'discs',roots:'#b0683a',density:.9,blooms:['none','fruit','autumn','autumn'],
    fruit:'#232a46',stalk:'#b1352c',autumn:['#b8322a','#94202b','#c9542a','#7d1f30']}
};
const LIST=Object.keys(KINDS);

function hash(n){n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return((n^n>>>16)>>>0)/4294967296}
function pick(seed){const k=LIST[Math.floor(hash(seed*7+3)*LIST.length)%LIST.length],b=KINDS[k].blooms;return{kind:k,bloom:b[Math.floor(hash(seed*13+5)*b.length)%b.length]}}

/* ---------- leaves: outlines in leaf units (petiole at 0,0, blade pointing along +y to the tip at 0,1) ---------- */
function rpath(ctx,pts){ /* closed outline; each point [x,y,r]: r = corner rounding */
  const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);ctx.beginPath();ctx.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],e=m(p,q);ctx.arcTo(p[0],p[1],e[0],e[1],p[2])}ctx.closePath()}
const mirror=half=>half.concat(half.slice(1,-1).reverse().map(([x,y,r])=>[-x,y,r]));
/* ivy: juvenile leaves 3–5 lobed with triangular lobes and a heart-shaped base; adult (flowering) leaves unlobed, diamond to oval */
const IVY=mirror([[0,.1,.02],[.15,.0,.07],[.3,.05,.05],[.43,.2,.008],[.3,.3,.05],[.47,.47,.008],[.35,.57,.07],[.21,.67,.05],[.1,.86,.04],[0,1,.006]]);
const IVY_ADULT=mirror([[0,.06,.02],[.2,.08,.06],[.33,.3,.08],[.24,.6,.1],[.1,.85,.05],[0,1,.006]]);
/* muscadine: nearly round, heart-shaped at the stalk, coarse blunt teeth all round, unlobed */
const ROUND=(()=>{const p=[],n=34;for(let i=0;i<=n;i++){const t=i/n,th=-Math.PI/2+.32+t*(TAU-.64),tooth=i%2?.94:1.02,r=.5*tooth*(1-.07*Math.cos(th+Math.PI/2));
  p.push([Math.cos(th)*r,.5+Math.sin(th)*r*1.02,i%2?.03:.006])}p.push([0,.12,.03]);return p})();
/* one leaflet: lance-ovate, pointed; toothed on its outer part when `teeth` */
function leaflet(len,wid,teeth){const p=[[0,0,.0]],n=14;for(let i=1;i<n;i++){const t=i/n,w=wid*Math.sin(Math.PI*Math.pow(t,.8))*(1-.25*t),bump=teeth&&t>.4&&i%2?-.18*wid:0;p.push([w+bump*(w/wid),t*len,teeth?.004:.02])}
  p.push([0,len,.002]);for(let i=n-1;i>=1;i--){const t=i/n,w=wid*Math.sin(Math.PI*Math.pow(t,.8))*(1-.25*t),bump=teeth&&t>.4&&i%2?-.18*wid:0;p.push([-(w+bump*(w/wid)),t*len,teeth?.004:.02])}return p}

function shadeBlade(ctx,col,vein,glossy){ /* fill the current path with light and shaded halves, then a gloss */
  ctx.fillStyle=col;ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=darken(col,.22);ctx.fillRect(0,-.2,1,1.5);
  if(glossy){const g=ctx.createRadialGradient(-.12,.32,0,-.12,.32,.32);g.addColorStop(0,'rgba(255,255,240,.22)');g.addColorStop(1,'rgba(255,255,240,0)');ctx.fillStyle=g;ctx.fillRect(-.6,-.2,1.2,1.4)}
  ctx.restore();ctx.strokeStyle=darken(col,.45);ctx.lineWidth=.022;ctx.stroke()}
function veins(ctx,vein,lw,list){ctx.strokeStyle=vein;ctx.lineWidth=lw;ctx.beginPath();for(const[a,b,c,d]of list){ctx.moveTo(a,b);ctx.lineTo(c,d)}ctx.stroke()}

/* draw one leaf: (x,y) where the leaf stalk meets the stem, ang the way the blade points, size the blade's length in px */
function drawLeaf(ctx,kind,x,y,ang,size,col,o){o=o||{};const K=KINDS[kind]||KINDS[kind.kind],small=size<9;ctx.save();ctx.translate(x,y);ctx.rotate(ang-Math.PI/2);ctx.scale(size,size);ctx.lineJoin='round';
  const vein=o.vein||K.vein;
  if(K.leafKind==='ivy'){ctx.strokeStyle=darken(col,.3);ctx.lineWidth=.04;ctx.beginPath();ctx.moveTo(0,-.25);ctx.lineTo(0,.1);ctx.stroke();ctx.translate(0,-.12);
    rpath(ctx,o.adult?IVY_ADULT:IVY);shadeBlade(ctx,col,vein,true);
    if(!small)veins(ctx,vein,.028,o.adult?[[0,.06,0,.95],[0,.3,.2,.2],[0,.3,-.2,.2],[0,.5,.2,.55],[0,.5,-.2,.55]]:[[0,.1,0,.95],[0,.12,.4,.2],[0,.12,-.4,.2],[0,.15,.43,.46],[0,.15,-.43,.46]])}
  else if(K.leafKind==='round'){ctx.strokeStyle=darken(col,.3);ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(0,-.3);ctx.lineTo(0,.12);ctx.stroke();ctx.translate(0,-.1);
    rpath(ctx,ROUND);shadeBlade(ctx,col,vein,true);
    if(!small)veins(ctx,vein,.022,[[0,.12,0,.97],[0,.14,.38,.18],[0,.14,-.38,.18],[0,.3,.44,.42],[0,.3,-.44,.42],[0,.5,.38,.7],[0,.5,-.38,.7],[0,.7,.22,.86],[0,.7,-.22,.86]])}
  else if(K.leafKind==='pinnate'){ /* rachis with 4–6 opposite pairs and a terminal leaflet, drooping */
    const pairs=o.pairs||5;ctx.strokeStyle=darken(col,.35);ctx.lineWidth=.016;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(.05,.5,0,.92);ctx.stroke();
    for(let i=0;i<=pairs;i++){const t=.16+.76*i/pairs,ly=t,lx=.05*Math.sin(t*Math.PI);
      const sides=i===pairs?[0]:[-1,1];for(const s of sides){ctx.save();ctx.translate(lx,ly);ctx.rotate(s?s*1.05-(t-.5)*.3*s:0);const c=o.vary?mix(col,o.vary[i%o.vary.length],.5):col;rpath(ctx,leaflet(.25,.065,false));shadeBlade(ctx,c,vein,false);if(!small)veins(ctx,vein,.01,[[0,.02,0,.22]]);ctx.restore()}}}
  else{ /* palmate: five leaflets from one point on a long stalk, toothed above the middle */
    ctx.strokeStyle=o.stalk||'#7a3a2a';ctx.lineWidth=.04;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,.3);ctx.stroke();ctx.translate(0,.3);
    const F=[[-1.2,.5],[-.6,.64],[0,.72],[.6,.64],[1.2,.5]];for(const[a,l]of F){ctx.save();ctx.rotate(a);rpath(ctx,leaflet(l,.13,true));shadeBlade(ctx,col,vein,true);if(!small)veins(ctx,vein,.012,[[0,.02,0,l*.92]]);ctx.restore()}}
  ctx.restore()}

/* ---------- growth: stems from the frame, leaves at the nodes ---------- */
const MODELS={};
function model(kind,aspect,seed,lock){lock=lock||[.5,.53];const key=kind+'|'+aspect.toFixed(2)+'|'+seed+'|'+lock.join(',');if(MODELS[key])return MODELS[key];
  const K=KINDS[kind],R=A.rngMulberry(seed*977+31),H=aspect,L=[lock[0],lock[1]*H],maxD=Math.hypot(Math.max(L[0],1-L[0]),Math.max(L[1],H-L[1]));
  const stems=[],leaves=[],extras=[],ds=.022,leafGap=Math.max(1,Math.round(K.leaf*(K.leafKind==='pinnate'?.33:.5)/ds));
  const thrAt=p=>Math.max(.03,Math.min(.97,.05+.85*Math.hypot(p[0]-L[0],p[1]-L[1])/maxD+.12*(R()-.5)));
  function grow(p,hd,w,depth,steps,up,parent,at){const s={pts:[p.slice()],w:[w],thr:[thrAt(p)],depth,parent,at,leaves:[],end:true};stems.push(s);let x=p[0],y=p[1],h=hd,side=R()<.5?1:-1,turn=(R()-.5)*.08;
    for(let i=1;i<=steps;i++){turn=turn*.85+(R()-.5)*.14;h+=turn;
      /* climbers lean up (or, from the lintel, hang down); keep inside the door */
      const want=up?-Math.PI/2:Math.PI/2;h+=Math.atan2(Math.sin(want-h),Math.cos(want-h))*(K.climb==='twine'?.05:.035);
      if(x<.03&&Math.cos(h)<0)h=Math.PI-h;if(x>.97&&Math.cos(h)>0)h=Math.PI-h;if(y<.02&&Math.sin(h)<0)h=-h;if(y>H-.01&&Math.sin(h)>0)h=-h;
      x+=Math.cos(h)*ds;y+=Math.sin(h)*ds;x=Math.max(.01,Math.min(.99,x));y=Math.max(0,Math.min(H,y));
      const k=i/steps,ww=w*(1-.75*k)+.003;s.pts.push([x,y]);s.w.push(ww);s.thr.push(thrAt([x,y]));
      if(i%leafGap===0){side=-side;const n=[-Math.sin(h)*side,Math.cos(h)*side];let a=Math.atan2(n[1],n[0]);a=a+Math.atan2(Math.sin(Math.PI/2-a),Math.cos(Math.PI/2-a))*(K.leafKind==='pinnate'?.55:.38)+(R()-.5)*.5;
        const sz=K.leaf*(.72+R()*.45)*(1-.3*k*k),lf={s:stems.length-1,i,x,y,a,sz,col:mix(K.leafCol,R()<.5?K.leafAlt:lighten(K.leafCol,.12),R()),young:k>.85,thr:s.thr[i],r:R()};leaves.push(lf);
        /* tendrils, rootlets and fruit or flowers at some nodes */
        if(K.climb==='tendril'&&R()<.6)extras.push({t:'tendril',s:stems.length-1,i,a:a+Math.PI+(R()-.5)*.6,r:R()});
        if(K.climb==='discs'&&R()<.55)extras.push({t:'discs',s:stems.length-1,i,a:a+Math.PI+(R()-.5)*.8,r:R()});
        if(R()<(K.leafKind==='pinnate'?.4:.3))extras.push({t:'bloom',s:stems.length-1,i,a,r:R(),r2:R()})}
      if(depth<3&&steps-i>8&&R()<(depth?.05:.085)*K.density){grow([x,y],h+(R()<.5?1:-1)*(.5+R()*.7),ww*.7,depth+1,Math.floor((steps-i)*(.5+R()*.4)),up,stems.indexOf(s),i)}}
    return s}
  const n=Math.round(3+2*K.density),roots=[];
  for(let j=0;j<n;j++){const r=R();if(j%3===2)roots.push([[.15+.7*R(),0],Math.PI/2+(R()-.5)*.6,false]);else{const lft=j%2===0;roots.push([[lft?.03+R()*.18:.97-R()*.18,H],-Math.PI/2+(lft?.35:-.35)+(R()-.5)*.4,true])}}
  roots.push([[.35+.3*R(),0],Math.PI/2+(R()-.5)*.3,false]); /* one always hangs over the lock */
  roots.forEach(([p,hd,up],j)=>grow(p,hd,K.stemW*(.8+R()*.5)*(j<2?1.25:1),0,Math.round((up?H*1.15:H*.85)/ds*(.75+R()*.35)),up,-1,0));
  /* fill thin patches: extra shoots from existing stems toward the emptiest cells */
  const gx=6,gy=Math.round(6*H),cnt=new Array(gx*gy).fill(0),cell=(x,y)=>Math.min(gy-1,Math.floor(y/H*gy))*gx+Math.min(gx-1,Math.floor(x*gx));
  leaves.forEach(l=>cnt[cell(l.x,l.y)]++);for(let pass=0;pass<gx*gy*.5;pass++){let bi=-1,bv=1e9;cnt.forEach((v,i)=>{const yy=(Math.floor(i/gx)+.5)/gy*H;if(v<bv&&yy>.04)bv=v,bi=i});if(bv>=2*K.density)break;
    const cx=(bi%gx+.5)/gx,cy=(Math.floor(bi/gx)+.5)/gy*H;let best=null,bd=1e9;stems.forEach((s,si)=>s.pts.forEach((p,pi)=>{const d=Math.hypot(p[0]-cx,p[1]-cy);if(d<bd&&pi>1)bd=d,best=[si,pi]}));if(!best)break;
    const st=stems[best[0]],p=st.pts[best[1]],nl=leaves.length;grow(p,Math.atan2(cy-p[1],cx-p[0]),st.w[best[1]]*.7,Math.min(3,st.depth+1),Math.max(6,Math.round(bd/ds)+6),cy<p[1],best[0],best[1]);
    for(let i=nl;i<leaves.length;i++)cnt[cell(leaves[i].x,leaves[i].y)]++;cnt[bi]+=1}
  stems.forEach(s=>s.leaves=[]);leaves.forEach((l,i)=>stems[l.s].leaves.push(i));
  /* even cutting: a leaf falls when the ax reaches any point between it and its root. Remap every threshold through the
     spread of those leaf-fall values, so each strike clears about the same share of leaves (order unchanged). */
  const pm=(si,i)=>{const s=stems[si];let m=1;for(let k=0;k<=i&&k<s.thr.length;k++)m=Math.min(m,s.thr[k]);return s.parent>=0?Math.min(m,pm(s.parent,s.at)):m};
  const kills=leaves.map(l=>pm(l.s,l.i)).sort((a,b)=>a-b),F=x=>{let lo=0,hi=kills.length;while(lo<hi){const m=(lo+hi)>>1;if(kills[m]<=x)lo=m+1;else hi=m}return .02+.96*lo/kills.length};
  stems.forEach(s=>{s.thr=s.thr.map(F)});leaves.forEach(l=>l.thr=stems[l.s].thr[l.i]);
  const order=leaves.map((l,i)=>i).sort((a,b)=>leaves[a].r-leaves[b].r);
  return MODELS[key]={K,kind,H,stems,leaves,extras,order,L}}

/* where each stem is cut at damage d: draw points 0..cut-1. A cut stem drops everything beyond the cut, branches included. */
const near=(p,H)=>p[0]<.085||p[0]>.915||p[1]>H-.07||p[1]<.06;
function cuts(M,d){const c=M.stems.map(()=>0),cutHere=M.stems.map(()=>false);
  M.stems.forEach((s,si)=>{if(s.parent>=0&&c[s.parent]<=s.at){c[si]=0;return}let k=s.pts.length;
    for(let i=0;i<s.pts.length;i++){if(d>0&&s.thr[i]<d){k=i;break}if(d>=1&&(!near(s.pts[i],M.H)||i>3)){k=i;break}}
    c[si]=k;cutHere[si]=k<s.pts.length&&k>0});return{c,cutHere}}
const leafOn=(M,C,l)=>l.i<C.c[l.s];

function removed(kind,aspect,seed,d0,d1,lock){const M=model(kind,aspect,seed,lock),a=cuts(M,d0),b=cuts(M,d1),out=[];
  M.leaves.forEach(l=>{if(leafOn(M,a,l)&&!leafOn(M,b,l))out.push({x:l.x,y:l.y,a:l.a,s:l.sz,col:l.col})});return out}

/* ---------- drawing ---------- */
function stemPath(ctx,s,k,W,lw){for(let i=1;i<k;i++){const a=s.pts[i-1],b=s.pts[i];ctx.lineWidth=Math.max(.6,lw(s.w[i]*W));ctx.beginPath();ctx.moveTo(a[0]*W,a[1]*W);ctx.lineTo(b[0]*W,b[1]*W);ctx.stroke()}}
function drawStem(ctx,M,s,k,W,cutEnd,detail){if(k<2)return;const K=M.K,old=s.depth===0;
  const base=old?K.bark:mix(K.bark,K.barkYoung,.55);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(0,0,0,.28)';ctx.save();ctx.translate(W*.004,W*.006);stemPath(ctx,s,k,W,w=>w*1.1);ctx.restore(); /* shadow on the door */
  ctx.strokeStyle=darken(base,.35);stemPath(ctx,s,k,W,w=>w);ctx.strokeStyle=base;stemPath(ctx,s,k,W,w=>w*.72);
  ctx.save();ctx.translate(-W*.0025,-W*.003);ctx.strokeStyle=lighten(base,.25);stemPath(ctx,s,k,W,w=>w*.28);ctx.restore();
  if(detail){ /* bark marks and climbing parts along the stem */
    for(let i=1;i<k;i++){const p=s.pts[i],q=s.pts[i-1],w=s.w[i]*W,h=Math.atan2(p[1]-q[1],p[0]-q[0]),nx=-Math.sin(h),ny=Math.cos(h),X=p[0]*W,Y=p[1]*W;
      if(K.climb==='twine'&&w>3&&i%2===0){ /* twined, fluted trunk: diagonal bands round the stem */
        ctx.strokeStyle=lighten(base,.3);ctx.lineWidth=Math.max(.6,w*.12);ctx.beginPath();ctx.moveTo(X-nx*w*.45-Math.cos(h)*w*.4,Y-ny*w*.45-Math.sin(h)*w*.4);ctx.lineTo(X+nx*w*.45+Math.cos(h)*w*.4,Y+ny*w*.45+Math.sin(h)*w*.4);ctx.stroke();
        ctx.strokeStyle=darken(base,.4);ctx.lineWidth=Math.max(.5,w*.07);ctx.beginPath();ctx.moveTo(X-nx*w*.4,Y-ny*w*.4);ctx.lineTo(X+nx*w*.4+Math.cos(h)*w*.5,Y+ny*w*.4+Math.sin(h)*w*.5);ctx.stroke()}
      if((K.climb==='tendril'||K.climb==='twine')&&w>2.5&&i%3===1){ctx.fillStyle=lighten(base,.35);ctx.fillRect(X-w*.15,Y-w*.08,w*.3,Math.max(.6,w*.12))} /* lenticels */
      if(K.climb==='roots'&&i%1===0&&w>1.2){ctx.strokeStyle=K.roots;ctx.lineWidth=Math.max(.4,W*.0018);for(let r=0;r<2;r++){const t=(r-.5)*.8;ctx.beginPath();ctx.moveTo(X+nx*w*.4,Y+ny*w*.4);ctx.lineTo(X+nx*(w*.4+W*.012)+Math.cos(h)*t*W*.01,Y+ny*(w*.4+W*.012)+Math.sin(h)*t*W*.01);ctx.stroke()}} /* aerial rootlets */
      if(K.climb==='discs'&&old&&i%2===0&&w>2){ctx.strokeStyle=K.roots;ctx.lineWidth=Math.max(.4,W*.002);ctx.beginPath();ctx.moveTo(X+nx*w*.4,Y+ny*w*.4);ctx.lineTo(X+nx*(w*.5+W*.014),Y+ny*(w*.5+W*.014));ctx.stroke()} /* hairy aerial roots on old stems */
      if(K.climb==='tendril'&&old&&w>4&&i%2===0){ctx.strokeStyle=darken(base,.3);ctx.lineWidth=Math.max(.5,w*.06);ctx.beginPath();ctx.moveTo(X-Math.cos(h)*w*.6,Y-Math.sin(h)*w*.6);ctx.lineTo(X+Math.cos(h)*w*.6,Y+Math.sin(h)*w*.6);ctx.stroke()}}} /* grooves on old grape bark */
  if(cutEnd){const p=s.pts[k-1],q=s.pts[k-2],h=Math.atan2(p[1]-q[1],p[0]-q[0]),w=s.w[k-1]*W; /* a fresh cut: pale wood with a bark rim */
    ctx.save();ctx.translate(p[0]*W,p[1]*W);ctx.rotate(h);ctx.fillStyle='#e9d9b0';ctx.strokeStyle=darken(K.bark,.3);ctx.lineWidth=Math.max(.6,w*.18);ctx.beginPath();ctx.ellipse(0,0,Math.max(1,w*.28),Math.max(1,w*.52),0,0,TAU);ctx.fill();ctx.stroke();
    if(w>5){ctx.fillStyle='#c9a86c';ctx.beginPath();ctx.arc(0,0,w*.1,0,TAU);ctx.fill()}ctx.restore()}}

function drawExtra(ctx,M,e,W,bloom,o){const K=M.K,s=M.stems[e.s],p=s.pts[e.i],X=p[0]*W,Y=p[1]*W;
  if(e.t==='tendril'){ /* muscadine: a simple, unforked tendril that curls into a coil */
    ctx.strokeStyle=mix(K.young,'#8a7a3a',.4);ctx.lineWidth=Math.max(.5,W*.0025);ctx.beginPath();let x=X,y=Y,a=e.a,len=W*.05;ctx.moveTo(x,y);for(let i=0;i<26;i++){const k=i/26;a+=k<.45?.03:.38;const st=len/26*(k<.45?1.4:.7*(1.1-k));x+=Math.cos(a)*st;y+=Math.sin(a)*st;ctx.lineTo(x,y)}ctx.stroke()}
  else if(e.t==='discs'){ /* Virginia creeper: a tendril branched several times, each tip an adhesive disc */
    const a=e.a,l=W*.03,bx=X+Math.cos(a)*l,by=Y+Math.sin(a)*l;ctx.strokeStyle=bloom==='autumn'?'#a0452f':'#8a5a3a';ctx.lineWidth=Math.max(.5,W*.002);ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(bx,by);
    const n=4+Math.floor(e.r*3);for(let j=0;j<n;j++){const b=a+(j/(n-1)-.5)*1.8,tx=bx+Math.cos(b)*W*.018,ty=by+Math.sin(b)*W*.018;ctx.moveTo(bx,by);ctx.lineTo(tx,ty)}ctx.stroke();
    ctx.fillStyle='#c79a62';for(let j=0;j<n;j++){const b=a+(j/(n-1)-.5)*1.8;ctx.beginPath();ctx.arc(bx+Math.cos(b)*W*.018,by+Math.sin(b)*W*.018,Math.max(.6,W*.0035),0,TAU);ctx.fill()}}
  else if(e.t==='bloom'){
    if(bloom==='none'||bloom==='autumn')return;const R=A.rngMulberry(Math.floor(e.r*1e6));
    if(M.kind==='english-ivy'){ /* round umbels on adult stems: greenish flowers in autumn, then black berries */
      if(e.r2>.15)return;const cx=X+Math.cos(e.a)*W*.03,cy=Y+Math.sin(e.a)*W*.03-W*.01,n=12+Math.floor(R()*10),rr=W*.022;
      ctx.strokeStyle='#7f8a4a';ctx.lineWidth=Math.max(.4,W*.0015);for(let i=0;i<n;i++){const a=R()*TAU,r=rr*(.6+.4*R()),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.85;ctx.beginPath();ctx.moveTo(cx,cy+rr*.6);ctx.lineTo(x,y);ctx.stroke();
        if(bloom==='flowers'){ctx.fillStyle=mix(K.flower,'#9aa04a',R()*.5);ctx.beginPath();ctx.arc(x,y,W*.006,0,TAU);ctx.fill();ctx.fillStyle='#e8e2a0';ctx.fillRect(x-W*.002,y-W*.002,W*.003,W*.003)}
        else{berry(ctx,x,y,W*.0075,K.fruit)}}}
    else if(M.kind==='muscadine'){ /* fruit singly or a few together in a loose cluster: large, thick-skinned, purple or bronze */
      if(e.r2>.12)return;const col=o.bronze?K.fruitBronze:K.fruitPurple,n=3+Math.floor(R()*4),cx=X+Math.cos(e.a)*W*.02,cy=Y+W*.03;
      ctx.strokeStyle='#6a5a3a';ctx.lineWidth=Math.max(.5,W*.0022);for(let i=0;i<n;i++){const x=cx+(R()-.5)*W*.07,y=cy+R()*W*.06;ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(cx,cy-W*.01,x,y-W*.012);ctx.stroke();berry(ctx,x,y,W*(.016+R()*.006),col,true)}}
    else if(M.kind==='wisteria'){ /* pendulous racemes of pea flowers (pale and open above, buds below); or hanging velvety pods */
      if(bloom==='flowers'){if(e.r2<.3)return;const len=W*(.16+e.r2*.22),n=Math.round(len/(W*.012)),x0=X+(R()-.5)*W*.02;
        ctx.strokeStyle='#6f7a4a';ctx.lineWidth=Math.max(.5,W*.002);ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(x0+W*.01,Y+len*.5,x0,Y+len);ctx.stroke();
        for(let i=0;i<n;i++){const k=i/n,y=Y+W*.01+k*len,wid=W*.022*(1-.65*k),x=x0+Math.sin(k*3+e.r*9)*W*.004;
          for(const sd of[-1,1]){if(k>.85&&sd>0)continue;const fx=x+sd*wid*(.35+.3*R()),fy=y+(R()-.5)*W*.006,sz=W*.0095*(1-.55*k);
            const c=k<.55?mix(K.flowerPale,K.flower,k/.55):mix(K.flower,K.bud,(k-.55)/.45);
            ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(fx,fy,sz,sz*.8,0,0,TAU);ctx.fill(); /* banner */
            if(k<.8&&sz>1.2){ctx.fillStyle=darken(c,.25);ctx.beginPath();ctx.ellipse(fx+sd*sz*.2,fy+sz*.45,sz*.45,sz*.35,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(250,240,150,.8)';ctx.beginPath();ctx.arc(fx,fy-sz*.1,Math.max(.4,sz*.18),0,TAU);ctx.fill()}}}}
      else if(bloom==='fruit'){if(e.r2>.5)return;const n=1+Math.floor(R()*3);for(let j=0;j<n;j++){const x=X+(j-(n-1)/2)*W*.025,len=W*(.1+R()*.05),bend=(R()-.5)*.25;
        ctx.save();ctx.translate(x,Y);ctx.rotate(bend);ctx.fillStyle=K.pod;ctx.strokeStyle=darken(K.pod,.35);ctx.lineWidth=Math.max(.5,W*.002);ctx.beginPath();
        for(let i=0;i<=10;i++){const t=i/10,w=W*.013*(Math.sin(Math.PI*Math.min(1,t*1.15))*.8+.2)*(1-.18*Math.abs(Math.sin(t*Math.PI*4)));i?ctx.lineTo(w,t*len):ctx.moveTo(w,0)}
        for(let i=10;i>=0;i--){const t=i/10,w=W*.013*(Math.sin(Math.PI*Math.min(1,t*1.15))*.8+.2)*(1-.18*Math.abs(Math.sin(t*Math.PI*4)));ctx.lineTo(-w,t*len)}ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='rgba(235,230,200,.35)';ctx.lineWidth=Math.max(.5,W*.003);ctx.beginPath();ctx.moveTo(-W*.006,len*.1);ctx.lineTo(-W*.007,len*.8);ctx.stroke();ctx.restore()}}}
    else if(M.kind==='virginia-creeper'&&bloom==='fruit'){ /* blue-black berries on branched red stalks */
      if(e.r2>.5)return;const cx=X+Math.cos(e.a)*W*.025,cy=Y+W*.035;ctx.strokeStyle=K.stalk;ctx.lineWidth=Math.max(.5,W*.0022);
      const tips=[];ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(cx,cy);for(let j=0;j<3;j++){const a=Math.PI/2+(j-1)*.7,bx=cx+Math.cos(a)*W*.025,by=cy+Math.sin(a)*W*.025;ctx.moveTo(cx,cy);ctx.lineTo(bx,by);for(let m=0;m<3;m++){const b=a+(m-1)*.6,tx=bx+Math.cos(b)*W*.014,ty=by+Math.sin(b)*W*.014;ctx.moveTo(bx,by);ctx.lineTo(tx,ty);tips.push([tx,ty])}}ctx.stroke();
      tips.forEach(([x,y])=>{if(R()<.8)berry(ctx,x,y,W*.0065,K.fruit,true)})}}}
function berry(ctx,x,y,r,col,bloomDust){r=Math.max(.8,r);const g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);g.addColorStop(0,lighten(col,.3));g.addColorStop(1,darken(col,.25));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  if(bloomDust){ctx.fillStyle='rgba(200,205,225,.16)';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}if(r>1.5){ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(x-r*.35,y-r*.38,r*.22,0,TAU);ctx.fill()}}

/* a heap of cut stems and wilting leaves at the foot of a cut-back door */
function heap(ctx,M,W,seed){const R=A.rngMulberry(seed*31+7),H=M.H,K=M.K;for(const side of[0,1]){const x0=side?.62:.04,x1=side?.96:.38;
  for(let i=0;i<7;i++){const a=x0+R()*(x1-x0),b=Math.min(x1,a+.1+R()*.15),y=H-.01-R()*.05;ctx.strokeStyle=darken(K.bark,.15);ctx.lineWidth=Math.max(.8,W*(.006+R()*.01));ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a*W,y*W);ctx.quadraticCurveTo((a+b)/2*W,(y-.03)*W,b*W,(y+.01)*W);ctx.stroke()}
  for(let i=0;i<14;i++){const x=(x0+R()*(x1-x0))*W,y=(H-.015-R()*.07)*W,c=mix(K.leafCol,'#8b7a3a',.35+R()*.4);drawLeaf(ctx,M.kind,x,y,R()*TAU,K.leaf*W*(.6+R()*.3),c,{adult:M.kind==='english-ivy'&&R()<.3})}}}

function render(ctx,kind,w,h,o){o=o||{};const K=KINDS[kind];if(!K)throw new Error('unknown vine '+kind);
  const seed=o.seed||1,bloom=o.bloom||'none',d=o.state==='cut'?1:o.state==='full'?0:Math.max(0,Math.min(1,o.damage==null?(o.state==='damaged'?.5:0):o.damage)),W=w,M=model(kind,h/w,seed,o.lock);
  const detail=w>=70,C=cuts(M,d),RR=A.rngMulberry(seed*5+1);
  ctx.save();if(d>=1)heap(ctx,M,W,seed);
  /* old stems behind, young stems in among the leaves */
  M.stems.forEach((s,si)=>{if(s.depth===0)drawStem(ctx,M,s,C.c[si],W,C.cutHere[si],detail)});
  const half=Math.floor(M.order.length/2),autumn=bloom==='autumn',wilt=l=>d>0&&d<1&&l.thr<d+.12;
  const leafCol=l=>{let c=l.col;if(autumn)c=mix(c,K.autumn[Math.floor(l.r*K.autumn.length*7)%K.autumn.length],.55+.45*((l.r*13)%1));if(l.young&&!autumn)c=mix(c,K.young,.45);if(wilt(l))c=mix(c,'#8d7f3c',.4);return c};
  const one=li=>{const l=M.leaves[li];if(!leafOn(M,C,l))return;const droop=wilt(l)?.5:0;drawLeaf(ctx,kind,l.x*W,l.y*W,l.a+droop*Math.sign(Math.cos(l.a)),l.sz*W,leafCol(l),{adult:kind==='english-ivy'&&bloom!=='none'&&l.r>.4,pairs:4+Math.floor(l.r*3),stalk:autumn?'#a83a2a':'#8a3a2c',vein:autumn?'#e6b08a':undefined})};
  M.order.slice(0,half).forEach(one);
  M.stems.forEach((s,si)=>{if(s.depth>0)drawStem(ctx,M,s,C.c[si],W,C.cutHere[si],detail)});
  if(detail)M.extras.forEach(e=>{if(e.t!=='bloom'&&e.i<C.c[e.s])drawExtra(ctx,M,e,W,bloom,o)});
  M.order.slice(half).forEach(one);
  M.extras.forEach(e=>{if(e.t==='bloom'&&e.i<C.c[e.s]&&d<1)drawExtra(ctx,M,e,W,bloom,{bronze:hash(seed*3+1)>.7})});
  ctx.restore()}

window.VINES={KINDS,LIST,render,pick,removed,drawLeaf,model};
})();
