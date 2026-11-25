/* Creatures of Greek myth for the Euclid game's combat. Needs core.js. Research: research/subjects/creatures/.
   CREATURES.draw(ctx, kind, x, y, size, state, o)   one creature standing on (x, y), size = its height in px
     kind   'minotaur' | 'harpy' | 'hydra' | 'manticore' | 'basilisk'
     state  'friendly'    calm: head level or lowered, mouth shut, wings folded, tail down, soft round eyes
            'threatening' reared up, mouth open with teeth, wings spread, tail raised, narrowed eyes with a red glint
            'wounded'     hunched and lower, one eye shut, cuts across the body, wings drooping
            'dead'        lying on its side, eyes crossed out, colour drained
     o      seed (small colour variation), mirror (face right instead of left)
   Side view facing left; light from the upper left; outlines a darker shade of the local colour. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A)throw new Error('creatures.js needs core.js loaded first');
const {mix,lighten,darken,rngMulberry}=A,TAU=Math.PI*2;
const LIST=['harpy','basilisk','minotaur','manticore','hydra'],STATES=['friendly','threatening','wounded','dead'];
const POSE={friendly:{rear:0,open:0,wing:.15,droop:0,eye:'calm'},threatening:{rear:1,open:1,wing:1,droop:0,eye:'angry'},wounded:{rear:0,open:.35,wing:.05,droop:1,eye:'hurt',cuts:1},dead:{rear:0,open:.5,wing:0,droop:1,eye:'dead'}};
/* a smooth closed shape through points */
function blob(ctx,pts){ctx.beginPath();const n=pts.length;for(let i=0;i<=n;i++){const a=pts[i%n],b=pts[(i+1)%n],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(i===0)ctx.moveTo(m[0],m[1]);else ctx.quadraticCurveTo(a[0],a[1],m[0],m[1])}ctx.closePath()}
function paint(ctx,c,x0,y0,x1,y1,lw){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,lighten(c,.25));g.addColorStop(.55,c);g.addColorStop(1,darken(c,.3));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=darken(c,.5);ctx.lineWidth=lw||.012;ctx.lineJoin='round';ctx.stroke()}
function eye(ctx,x,y,r,p,col){if(p.eye==='dead'){ctx.strokeStyle='#2a1a10';ctx.lineWidth=r*.5;ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);ctx.stroke();return}
  if(p.eye==='hurt'){ctx.strokeStyle='#2a1a10';ctx.lineWidth=r*.45;ctx.beginPath();ctx.moveTo(x-r,y);ctx.quadraticCurveTo(x,y+r*.6,x+r,y);ctx.stroke();return}
  ctx.fillStyle=p.eye==='angry'?'#f4e6a0':'#fbf6e8';ctx.beginPath();ctx.ellipse(x,y,r,p.eye==='angry'?r*.55:r*.9,0,0,TAU);ctx.fill();
  ctx.fillStyle=p.eye==='angry'?'#c81e10':col||'#3a2410';ctx.beginPath();ctx.arc(x-r*.2,y,r*.5,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-r*.35,y-r*.25,r*.18,0,TAU);ctx.fill();
  if(p.eye==='angry'){ctx.strokeStyle='#2a1a10';ctx.lineWidth=r*.4;ctx.beginPath();ctx.moveTo(x-r*1.3,y-r*1.1);ctx.lineTo(x+r*1.2,y-r*.4);ctx.stroke()}}
function teeth(ctx,x0,x1,y,h,n){ctx.fillStyle='#f6f0dc';for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n;ctx.beginPath();ctx.moveTo(x-(x1-x0)/n*.4,y);ctx.lineTo(x,y+h);ctx.lineTo(x+(x1-x0)/n*.4,y);ctx.fill()}}
function cuts(ctx,pts,s){ctx.strokeStyle='rgba(140,20,20,.85)';ctx.lineWidth=s*.012;ctx.lineCap='round';for(const[x,y,a]of pts){ctx.beginPath();ctx.moveTo(x-Math.cos(a)*s*.06,y-Math.sin(a)*s*.06);ctx.lineTo(x+Math.cos(a)*s*.06,y+Math.sin(a)*s*.06);ctx.stroke()}}
function wing(ctx,x,y,len,open,col,bat){ /* folded (open 0) to spread (open 1), from a shoulder at (x,y) */
  const a=-.3-1.3*open,tip=[x+Math.cos(a+Math.PI)*-len*.2+len*.35*Math.cos(a),y+Math.sin(a)*len];ctx.save();ctx.translate(x,y);ctx.rotate(-.2-open*1.1);
  if(bat){blob(ctx,[[0,0],[len*.35,-len*.15],[len*.75,-len*.05],[len,len*.05],[len*.82,len*.22],[len*.62,len*.16],[len*.48,len*.32],[len*.3,len*.22],[len*.12,len*.3]]);paint(ctx,col,0,-len*.2,len,len*.3);
    ctx.strokeStyle=darken(col,.45);ctx.lineWidth=len*.02;for(const t of[.48,.62,.82]){ctx.beginPath();ctx.moveTo(len*.3,-len*.08);ctx.lineTo(len*t,len*.22);ctx.stroke()}}
  else{for(let k=0;k<6;k++){const l=len*(1-k*.1);ctx.save();ctx.rotate(k*.12);blob(ctx,[[0,-len*.03],[l*.6,-len*.06],[l,0],[l*.6,len*.07],[0,len*.05]]);paint(ctx,k%2?col:lighten(col,.08),0,-len*.06,0,len*.07,len*.012);ctx.restore()}}
  ctx.restore()}

const D={};
/* MINOTAUR: a bull's head and shoulders on a giant's body; horns, a nose ring, a leather kilt, hooves */
D.minotaur=(ctx,p,R)=>{const fur=mix('#6b4428','#4a3020',R()*.5),skin='#a8784e',lean=p.rear*-.08+p.droop*.12;
  ctx.save();ctx.translate(0,0);
  for(const[dx,bk]of[[.1,1],[-.06,0]]){blob(ctx,[[dx-.07,-.42],[dx+.07,-.42],[dx+.08,-.18],[dx+.05,-.05],[dx-.06,-.05],[dx-.08,-.2]]);paint(ctx,bk?darken(fur,.15):fur,dx-.08,-.4,dx+.08,0);
    blob(ctx,[[dx-.08,-.06],[dx+.06,-.06],[dx+.07,0],[dx-.09,0]]);paint(ctx,'#2e2620',dx-.08,-.06,dx+.07,0)} /* legs and hooves */
  ctx.save();ctx.rotate(lean);blob(ctx,[[-.16,-.78],[.14,-.8],[.17,-.55],[.12,-.4],[-.12,-.4],[-.17,-.58]]);paint(ctx,skin,-.17,-.8,.17,-.4); /* torso */
  ctx.strokeStyle=darken(skin,.25);ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.02,-.74);ctx.lineTo(-.02,-.46);ctx.moveTo(-.12,-.62);ctx.quadraticCurveTo(-.02,-.58,.1,-.63);ctx.stroke();
  blob(ctx,[[-.15,-.45],[.15,-.45],[.17,-.3],[-.17,-.3]]);paint(ctx,'#7a4e2a',-.17,-.45,.17,-.3); /* kilt */ctx.fillStyle='#c9a24a';ctx.fillRect(-.15,-.46,.3,.025);
  const arm=(sx,up)=>{ctx.save();ctx.translate(sx,-.74);ctx.rotate(up?-2.2:(.15+p.droop*.2));blob(ctx,[[-.04,0],[.04,0],[.05,.2],[.035,.34],[-.035,.34],[-.05,.2]]);paint(ctx,skin,-.05,0,.05,.34);blob(ctx,[[-.045,.33],[.045,.33],[.05,.4],[-.05,.4]]);paint(ctx,darken(skin,.1),-.05,.33,.05,.4);ctx.restore()};
  arm(.15,false);
  /* the head */ctx.save();ctx.translate(-.1,-.84+p.droop*.05);ctx.rotate(p.rear*-.25+p.droop*.35);
  blob(ctx,[[-.02,-.13],[.1,-.1],[.12,0],[.06,.08],[-.12,.1],[-.2,.06],[-.22,0],[-.14,-.08]]);paint(ctx,fur,-.22,-.13,.12,.1);
  blob(ctx,[[-.22,-.01],[-.12,-.02],[-.11,.08],[-.2,.09],[-.24,.05]]);paint(ctx,'#c49a7a',-.24,-.02,-.11,.09,.008); /* muzzle */
  ctx.fillStyle='#3a2418';ctx.beginPath();ctx.ellipse(-.215,.03,.01,.007,0,0,TAU);ctx.fill();ctx.strokeStyle='#c9a24a';ctx.lineWidth=.01;ctx.beginPath();ctx.arc(-.215,.065,.022,0,TAU);ctx.stroke();
  for(const s of[1,-1]){ctx.beginPath();ctx.moveTo(.0,-.09);ctx.quadraticCurveTo(.12,-.2+s*.01,.06-s*.02,-.28-p.rear*.04);ctx.quadraticCurveTo(.09,-.16,.04,-.06);ctx.closePath();paint(ctx,s>0?'#efe4c8':'#d8cba8',0,-.28,.12,-.06,.008)}
  if(p.open){ctx.fillStyle='#4a1a14';ctx.beginPath();ctx.ellipse(-.17,.085,.04,.015+.015*p.open,0,0,TAU);ctx.fill()}
  eye(ctx,-.09,-.03,.022,p);ctx.restore();
  arm(-.14,p.rear>.5);ctx.restore();ctx.restore()};
/* HARPY: a woman's face, feathered body, a bird's wings and talons; often in the air */
D.harpy=(ctx,p,R)=>{const fe=mix('#7a6248','#5a5a66',R()),face='#d8b090',hover=p.droop?0:.12;ctx.save();ctx.translate(0,-hover);
  wing(ctx,.06,-.66,.5,p.wing,darken(fe,.15));
  for(const dx of[.06,-.04]){ctx.strokeStyle='#c9a24a';ctx.lineWidth=.022;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(dx,-.34);ctx.lineTo(dx-.01,-.12);ctx.stroke();for(const a of[-.6,0,.6]){ctx.beginPath();ctx.moveTo(dx-.01,-.12);ctx.lineTo(dx-.01+Math.sin(a)*.05,-.12+Math.cos(a)*.05);ctx.stroke()}}
  blob(ctx,[[-.1,-.72],[.12,-.7],[.16,-.5],[.1,-.32],[-.08,-.3],[-.13,-.5]]);paint(ctx,fe,-.13,-.72,.16,-.3);
  ctx.strokeStyle=darken(fe,.3);ctx.lineWidth=.007;for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=-.08+c*.055+(r%2)*.025,y=-.62+r*.07;ctx.beginPath();ctx.arc(x,y,.025,.2,Math.PI-.2);ctx.stroke()}
  wing(ctx,.02,-.64,.46,p.wing*.9,fe);
  ctx.save();ctx.translate(-.04,-.8);ctx.rotate(p.rear*-.15+p.droop*.4);blob(ctx,[[-.08,-.08],[.05,-.09],[.07,.02],[.02,.09],[-.07,.08],[-.1,0]]);paint(ctx,face,-.1,-.09,.07,.09);
  blob(ctx,[[-.06,-.1],[.1,-.1],[.14,.05],[.12,.2],[.06,.12],[.04,-.02]]);paint(ctx,'#3a2a22',-.06,-.1,.14,.2); /* hair */
  eye(ctx,-.05,-.01,.017,p,'#4a6a3a');ctx.strokeStyle='#7a3a2a';ctx.lineWidth=.01;ctx.beginPath();if(p.open>.5){ctx.ellipse(-.06,.05,.022,.016,0,0,TAU);ctx.fillStyle='#5a1a14';ctx.fill();teeth(ctx,-.08,-.04,.035,.012,3)}else{ctx.moveTo(-.08,.05);ctx.quadraticCurveTo(-.06,p.eye==='calm'?.065:.045,-.04,.05);ctx.stroke()}
  ctx.restore();ctx.restore()};
/* HYDRA: a serpent's body with several necks and heads (here five) over coiled tail */
D.hydra=(ctx,p,R)=>{const sc=mix('#3d7a4a','#2e6a6a',R()),belly='#c8c47a';
  blob(ctx,[[-.35,-.02],[.35,-.02],[.38,-.14],[.2,-.3],[-.15,-.32],[-.36,-.16]]);paint(ctx,sc,-.38,-.32,.38,0);ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(0,-.06,.3,.04,0,0,TAU);ctx.fill();
  ctx.strokeStyle=darken(sc,.25);ctx.lineWidth=.006;for(let i=0;i<10;i++){ctx.beginPath();ctx.arc(-.3+i*.065,-.17,.03,Math.PI*.1,Math.PI*.9);ctx.stroke()}
  const n=5;for(let k=0;k<n;k++){const t=k/(n-1),bx=-.18+t*.3,lean=(t-.5)*(.9+p.rear*.5),h=.55+.25*Math.sin(t*Math.PI)+p.rear*.12-p.droop*(.2+(k%2)*.25),hx=bx+Math.sin(lean)*h*.6-.12,hy=-.25-h;
    ctx.strokeStyle=darken(sc,.4);ctx.lineWidth=.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx,-.22);ctx.quadraticCurveTo(bx+lean*.2+.08,(hy-.22)/2,hx+.03,hy);ctx.stroke();ctx.strokeStyle=k%2?sc:lighten(sc,.08);ctx.lineWidth=.055;ctx.stroke();
    ctx.save();ctx.translate(hx,hy);ctx.rotate(-.2+p.rear*-.25+p.droop*(.6+(k%2)*.4));blob(ctx,[[-.1,-.02],[-.02,-.05],[.05,-.03],[.05,.03],[-.02,.04],[-.1,.02]]);paint(ctx,sc,-.1,-.05,.05,.04,.008);
    if(p.open>.3&&!(p.eye==='hurt'&&k%2)){ctx.fillStyle='#5a1a14';ctx.beginPath();ctx.moveTo(-.1,.0);ctx.lineTo(-.02,.005);ctx.lineTo(-.1,.04*p.open);ctx.fill();if(p.rear){ctx.strokeStyle='#c81e10';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.1,.01);ctx.lineTo(-.15,.0);ctx.lineTo(-.17,.02);ctx.moveTo(-.15,0);ctx.lineTo(-.17,-.015);ctx.stroke()}}
    eye(ctx,-.03,-.02,.013,p);ctx.restore()}};
/* MANTICORE: a lion's body, a maned face, bat wings, a scorpion's tail */
D.manticore=(ctx,p,R)=>{const fur=mix('#b8803a','#9a5a2a',R()*.6),mane='#7a3a1a',up=p.rear*.08-p.droop*.08;
  /* the scorpion tail first (behind) */const tl=.55+p.rear*.15-p.droop*.25;ctx.strokeStyle=darken('#8a3a2a',.2);ctx.lineWidth=.04;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(.3,-.42);ctx.bezierCurveTo(.5,-.45,.5,-.42-tl,.3,-.45-tl);ctx.stroke();
  for(let i=0;i<6;i++){const t=i/6,x=.3+.2*Math.sin(t*Math.PI)*.9,y=-.43-tl*t;ctx.fillStyle=i%2?'#8a3a2a':'#a04a32';ctx.beginPath();ctx.ellipse(x,y,.03,.022,0,0,TAU);ctx.fill()}
  ctx.fillStyle='#2a1a10';ctx.beginPath();ctx.moveTo(.3,-.45-tl);ctx.lineTo(.22,-.42-tl+.04);ctx.lineTo(.27,-.48-tl);ctx.fill();
  wing(ctx,.08,-.52-up,.5,p.wing,'#5a3a3a',true);
  for(const[dx,bk]of[[.24,1],[-.2,1],[.2,0],[-.24,0]]){blob(ctx,[[dx-.04,-.3],[dx+.04,-.3],[dx+.04,-.03],[dx+.06,0],[dx-.06,0],[dx-.04,-.03]]);paint(ctx,bk?darken(fur,.2):fur,dx-.06,-.3,dx+.06,0)}
  blob(ctx,[[-.3,-.48-up],[.28,-.46],[.34,-.36],[.28,-.24],[-.28,-.24],[-.34,-.36]]);paint(ctx,fur,-.34,-.5,.34,-.24);
  ctx.save();ctx.translate(-.32,-.5-up);ctx.rotate(p.rear*-.2+p.droop*.4);ctx.fillStyle=mane;for(let i=0;i<14;i++){const a=i/14*TAU;ctx.beginPath();ctx.ellipse(Math.cos(a)*.11,Math.sin(a)*.12,.06,.03,a,0,TAU);ctx.fill()}
  blob(ctx,[[-.08,-.1],[.06,-.09],[.08,.03],[.02,.1],[-.07,.09],[-.1,0]]);paint(ctx,'#c89a6a',-.1,-.1,.08,.1);
  eye(ctx,-.04,-.03,.018,p,'#6a4a1a');ctx.fillStyle='#5a3020';ctx.beginPath();ctx.ellipse(-.09,.01,.012,.009,0,0,TAU);ctx.fill();
  if(p.open>.3){ctx.fillStyle='#5a1a14';ctx.beginPath();ctx.ellipse(-.06,.06,.035,.012+.02*p.open,0,0,TAU);ctx.fill();teeth(ctx,-.09,-.03,.045,.016,4);teeth(ctx,-.09,-.03,.08,-.014,4)}else{ctx.strokeStyle='#5a3020';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.09,.05);ctx.lineTo(-.03,.05);ctx.stroke()}
  ctx.restore()};
/* BASILISK: the serpent-king: a coiled snake with a crown-shaped crest and a stare */
D.basilisk=(ctx,p,R)=>{const sc=mix('#8a9a3a','#6a7a2a',R()),rise=.42+p.rear*.18-p.droop*.22;
  for(let k=2;k>=0;k--){ctx.beginPath();ctx.ellipse(.05,-.06-k*.06,.3-k*.06,.07,0,0,TAU);paint(ctx,k%2?sc:lighten(sc,.06),-.3,-.15-k*.06,.3,0)}
  ctx.strokeStyle=darken(sc,.4);ctx.lineWidth=.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(.05,-.2);ctx.quadraticCurveTo(.15,-.2-rise*.6,-.08,-.2-rise);ctx.stroke();ctx.strokeStyle=sc;ctx.lineWidth=.08;ctx.stroke();
  ctx.strokeStyle='#d8d08a';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(.0,-.22);ctx.quadraticCurveTo(.08,-.2-rise*.6,-.11,-.19-rise);ctx.stroke();
  ctx.save();ctx.translate(-.1,-.24-rise);ctx.rotate(p.rear*-.3+p.droop*.6);blob(ctx,[[-.14,-.02],[-.03,-.06],[.06,-.04],[.07,.04],[-.02,.06],[-.14,.03]]);paint(ctx,sc,-.14,-.06,.07,.06,.01);
  ctx.fillStyle=p.eye==='dead'?'#8a7a4a':'#d4a020';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-.04+i*.035,-.05);ctx.lineTo(-.03+i*.035,-.12-(i===1?.03:0)-p.rear*.03);ctx.lineTo(-.01+i*.035,-.05);ctx.fill()} /* the crown crest */
  eye(ctx,-.06,-.015,.017,p,'#c8a010');if(p.rear>.5){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,220,80,.35)';ctx.beginPath();ctx.moveTo(-.07,-.015);ctx.lineTo(-.35,-.08);ctx.lineTo(-.35,.05);ctx.fill();ctx.restore()} /* the stare */
  if(p.open>.3){ctx.fillStyle='#5a1a14';ctx.beginPath();ctx.moveTo(-.14,.01);ctx.lineTo(-.04,.02);ctx.lineTo(-.13,.01+.05*p.open);ctx.fill();ctx.fillStyle='#f6f0dc';ctx.beginPath();ctx.moveTo(-.12,.015);ctx.lineTo(-.115,.04);ctx.lineTo(-.11,.015);ctx.fill()}
  ctx.restore()};

function draw(ctx,kind,x,y,size,state,o){o=o||{};const f=D[kind];if(!f)return;const p=POSE[state]||POSE.friendly,R=rngMulberry((o.seed||1)*97+3),dead=state==='dead';
  ctx.save();ctx.translate(x,y);ctx.scale(size*(o.mirror?-1:1),size);
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,0,dead?.55:.4,.05,0,0,TAU);ctx.fill();
  if(dead){try{ctx.filter='saturate(35%) brightness(85%)'}catch(e){}
    if(kind==='hydra'||kind==='basilisk'||kind==='manticore')ctx.scale(1,kind==='manticore'?.42:.55); /* serpents and the beast slump where they are */
    else{ctx.translate(-.42,kind==='harpy'?-.36:-.17);ctx.rotate(Math.PI/2);ctx.scale(.85,.85)}} /* minotaur and harpy lie on their side */
  f(ctx,p,R);
  if(p.cuts)cuts(ctx,[[-.05,-.55,.8],[.08,-.45,-.6],[.15,-.62,1.1]],1);
  ctx.restore()}
window.CREATURES={draw,LIST,STATES,POSE};
})();
