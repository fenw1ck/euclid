/* Creatures of Greek myth for the Euclid game's combat, in the house style (research/rendering/house-style.md):
   bodies from the engine's skeleton (ENGINE.skeleton in engine.js: anatomical proportions, posed per state), painted as a
   back-lit silhouette: one dark shape, a cool rim of moonlight on its outer edge, hair breaking the edge, glowing eyes.
   Needs core.js (ART_CORE.house) and engine.js (ENGINE.skeleton; it may load after this file).
   CREATURES.draw(ctx, kind, x, y, size, state, o)   one creature standing on (x, y), size = its height in px
     kind   'minotaur' | 'harpy' | 'hydra' | 'manticore' | 'basilisk'
     state  'friendly'    calm: wings folded, amber eyes
            'threatening' reared, wings raised, a raised fist (minotaur), eyes burning red
            'wounded'     hunched and lower, wings torn, eyes dim
            'dead'        lying down or slumped, no light in the eyes, the rim fading
     o      seed, mirror (face right instead of left)
   Side view facing left. Each pose is painted once into a cached canvas per size bucket, then drawn with one drawImage. */
(function(){
"use strict";
const A=window.ART_CORE;if(!A||!A.house)throw new Error('creatures.js needs core.js (with ART_CORE.house) loaded first');
const LIST=['harpy','basilisk','minotaur','manticore','hydra'],STATES=['friendly','threatening','wounded','dead'];
const EYE={calm:['rgba(255,236,150,1)','rgba(255,180,60,.85)',1],angry:['rgba(255,220,160,1)','rgba(255,70,30,.9)',1.35],hurt:['rgba(255,220,150,.7)','rgba(220,150,60,.5)',.7],dead:null};
function paint(ctx,kind,b,state,o){const SK=window.ENGINE&&ENGINE.skeleton;if(!SK)return false;const B=SK.build(kind,state);if(!B)return false;
  const W=ctx.canvas.width,H=ctx.canvas.height,ox=ctx.__ox,oy=ctx.__oy,dead=state==='dead';
  /* dead: lie down (bipeds and birds on their side) or slump (serpents, beasts) */
  const tf=([x,y])=>{if(dead){if(kind==='minotaur'||kind==='harpy'){const k=.85;return[ox+(-y-.45)*b*k,oy+(x-.02)*b*k-.02*b]}return[ox+x*b,oy+y*b*(kind==='manticore'?.5:.6)]}return[ox+x*b,oy+y*b]};
  const parts=B.parts.map(p=>({...p,pts:p.pts.map(tf),center:p.center?tf(p.center):null}));
  const ec=EYE[B.mood],eyes=ec?B.heads.flatMap(h=>h.eyes.map((e,i)=>{const q=tf(e);return{x:q[0],y:q[1],r:b*.028*Math.max(.45,h.scale)*ec[2]*(h.hurt?.6:1),core:ec[0],col:ec[1]}})).filter((e,i)=>!(B.mood==='hurt'&&i%2)):[];
  ctx.save();ctx.filter='blur('+Math.max(2,b*.012)+'px)';ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(ox,oy,b*(dead?.55:.42),b*.04,0,0,Math.PI*2);ctx.fill();ctx.restore();
  A.house.paint(ctx,W,H,parts,{s:b,bones:B.bones.map(q=>q.map(tf)),eyes,dim:dead?.8:state==='wounded'?.3:0,seed:(o.seed||1)*7+kind.length});return true}
const CACHE=new Map();
function draw(ctx,kind,x,y,size,state,o){o=o||{};if(!LIST.includes(kind)||!(size>0))return;
  const b=size<=24?24:size<=48?48:size<=96?96:size<=160?160:size<=260?260:400,k=[kind,state,o.seed||1,b].join('|');let c=CACHE.get(k);
  if(!c){c=document.createElement('canvas');c.width=Math.ceil(b*2.2);c.height=Math.ceil(b*1.5);const g=c.getContext('2d');g.__ox=c.width*.5;g.__oy=c.height*.9;if(!paint(g,kind,b,state,o))return;c.ox=g.__ox;c.oy=g.__oy;if(CACHE.size>300)CACHE.clear();CACHE.set(k,c)}
  const s=size/b;ctx.save();ctx.translate(x,y);ctx.scale(s*(o.mirror?-1:1),s);ctx.drawImage(c,-c.ox,-c.oy);ctx.restore()}
window.CREATURES={draw,LIST,STATES};
})();
