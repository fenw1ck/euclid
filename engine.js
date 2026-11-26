/* engine.js: how the game behaves, kept apart from how it looks, so another project can load it and so it can be read
   and improved on the Art Assets site ("Game engine" tab). No drawing here: only rules, numbers and small pure
   functions over a save object S. The Euclid game (game.html) is the first user.
   window.ENGINE = {clock, health, keys, locks, moves, traps, combat, cook, fuel, skeleton, parts}
   Every number a designer might tune is a named field; ENGINE.parts describes each part for the engine tab. */
(function(){
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rng=seed=>{let s=(Math.floor(seed)>>>0)||1;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};

/* ---------- time: a game clock that runs while you play (1 real second = 1 game minute: a day takes 24 minutes) ---------- */
const clock={MIN_PER_SEC:1,DAY:1440,START:8*60,GROW_HOURS:6,
  now:S=>S.time==null?clock.START:S.time,
  tick(S,dt){S.time=clock.now(S)+dt*clock.MIN_PER_SEC;return S.time},
  day:t=>Math.floor(t/1440)+1,hour:t=>Math.floor((t%1440)/60),minute:t=>Math.floor(t%60),
  fmt:t=>`Day ${clock.day(t)} · ${String(clock.hour(t)).padStart(2,'0')}:${String(clock.minute(t)).padStart(2,'0')}`,
  isNight:t=>{const h=clock.hour(t);return h<6||h>=20},
  /* daylight 0 (midnight) .. 1 (noon), for tinting glass rooms */
  daylight:t=>{const h=(t%1440)/60;return clamp(.5-.5*Math.cos((h-2)/24*2*Math.PI)*1.15+.08,0,1)},
  /* a plant first seen growing is ready GROW_HOURS game hours later */
  grown:(S,since)=>clock.now(S)-since>=clock.GROW_HOURS*60};

/* ---------- health ---------- */
const health={MAX:100,REGEN_PER_HOUR:2,FAINT_COIN_LOSS:.1,WAKE_HP:50,
  hp:S=>S.hp==null?health.MAX:S.hp,
  /* returns true when this blow makes you faint */
  damage(S,n){S.hp=clamp(health.hp(S)-n,0,health.MAX);return S.hp<=0},
  heal(S,n){S.hp=clamp(health.hp(S)+n,0,health.MAX);return S.hp},
  regen(S,gameMinutes){if(health.hp(S)>0)health.heal(S,health.REGEN_PER_HOUR*gameMinutes/60)},
  /* fainting: you wake at the front doors with WAKE_HP, having dropped a tenth of your coins */
  faint(S){const lost=Math.floor((S.coins||0)*health.FAINT_COIN_LOSS);S.coins=(S.coins||0)-lost;S.hp=health.WAKE_HP;return{lost}}};

/* ---------- keys: the usual PC game layout ---------- */
const keys={MAP:{map:['m'],bag:['i','b','tab'],jump:[' '],climb:['c'],attack:['f'],interact:['e','enter'],close:['escape'],help:['h','?'],
    up:['w','arrowup'],down:['s','arrowdown'],left:['a','arrowleft'],right:['d','arrowright']},
  LABEL:{map:'Map',bag:'Bag (inventory)',jump:'Jump',climb:'Climb a ledge',attack:'Attack with your weapon',interact:'Use, open, pick up, talk',close:'Close / back',help:'Keys',up:'Walk forward',down:'Walk back',left:'Step left',right:'Step right'},
  action(k){k=String(k||'').toLowerCase();for(const a in keys.MAP)if(keys.MAP[a].includes(k))return a;return null},
  list:()=>Object.keys(keys.MAP).map(a=>[a,keys.LABEL[a],keys.MAP[a].map(k=>({' ':'Space',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',escape:'Esc'})[k]||(k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1)))])};

/* ---------- lock timers: each unsolved lock gives you a time limit; run out and it seals for a while ---------- */
const locks={BASE_SEC:120,PER_STEP_SEC:25,COOLDOWN_MIN:90,DAMAGE:10,
  limit:steps=>locks.BASE_SEC+locks.PER_STEP_SEC*Math.max(1,steps||1),
  cooling:(S,n)=>!!(S.cool&&S.cool[n]&&clock.now(S)<S.cool[n]),
  seal(S,n){(S.cool=S.cool||{})[n]=clock.now(S)+locks.COOLDOWN_MIN;return S.cool[n]},
  left:(S,n)=>S.cool&&S.cool[n]?Math.max(0,S.cool[n]-clock.now(S)):0};

/* ---------- moving: jumping, climbing, falling ---------- */
const moves={JUMP_H:.9,JUMP_T:.62,CLIMB_T:.9,STEP_UP:.35,FALL_SAFE:.9,FALL_DMG_PER_M:30,
  /* height of a jump t seconds after take-off (a parabola), 0 when landed */
  jumpY:t=>t<0||t>moves.JUMP_T?0:4*moves.JUMP_H*(t/moves.JUMP_T)*(1-t/moves.JUMP_T),
  /* a ledge can be jumped onto if it is no higher than the jump; higher ones are climbed */
  canJumpOnto:h=>h<=moves.JUMP_H*.95,
  fallDamage:h=>h<=moves.FALL_SAFE?0:Math.round((h-moves.FALL_SAFE)*moves.FALL_DMG_PER_M+4),
  LEDGE_HEIGHTS:[.6,1.2],LEDGE_CHANCE:.35,LEDGE_ITEM_CHANCE:.85};

/* ---------- traps ---------- */
const traps={PLATE_DMG:12,PLATE_RESET_SEC:3,PLATE_CHANCE:.3,BACKTRACK_DMG:15,PATH_CHANCE:.18,KINDS:['flame','spikes','fog'],
  KIND_LABEL:{flame:'flame throwers in the walls',spikes:'spikes in the floor',fog:'poison fog'},
  /* the path trap: points and edges on the floor. Walk every edge once without going back over one (an Euler trail).
     Built by walking a random trail on a grid of points, so a solution always exists: the trail itself. */
  pathGraph(seed,cols,rows,len){const R=rng(seed),nodes=[],edges=[],used=new Set(),key=(a,b)=>a<b?a+'-'+b:b+'-'+a;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)nodes.push({c,r});
    const nb=i=>{const n=nodes[i],o=[];for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){const c=n.c+dc,r=n.r+dr;if(c>=0&&c<cols&&r>=0&&r<rows)o.push(r*cols+c)}return o};
    let at=Math.floor(R()*cols),start=at;for(let k=0;k<len;k++){const opts=nb(at).filter(j=>!used.has(key(at,j)));if(!opts.length)break;const j=opts[Math.floor(R()*opts.length)];used.add(key(at,j));edges.push([at,j]);at=j}
    const keep=new Set(edges.flat());return{nodes,edges,start,cols,rows,used:keep}},
  /* moving from node a to node b: is it an edge, is it the first time, is the whole graph done? */
  step(g,walked,a,b){const k=a<b?a+'-'+b:b+'-'+a,isEdge=g.edges.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));if(!isEdge)return{edge:false};
    if(walked.includes(k))return{edge:true,backtrack:true};walked.push(k);return{edge:true,backtrack:false,done:walked.length>=g.edges.length}},
  kindFor:seed=>traps.KINDS[Math.floor(rng(seed*7+1)()*3)]};

/* ---------- combat: knives, swords and staffs against the creatures of myth ---------- */
const combat={
  WEAPONS:{knife:{name:'Knife',reach:1.3,rate:.45,dmg:6},sword:{name:'Sword',reach:1.9,rate:.75,dmg:11},staff:{name:'Staff',reach:2.4,rate:.95,dmg:8}},
  MATERIALS:{bronze:{name:'Bronze',mult:1,dur:18,price:1},iron:{name:'Iron',mult:1.5,dur:32,price:2.2},starmetal:{name:'Starmetal',mult:2.2,dur:55,price:4.5}},
  PRICE:{knife:10,sword:22,staff:14},FIST:{dmg:2,reach:1.1,rate:.6},
  weapon(id){const m=String(id||'').match(/^weapon-(knife|sword|staff)-(bronze|iron|starmetal)$/);if(!m)return null;const W=combat.WEAPONS[m[1]],M=combat.MATERIALS[m[2]];
    return{id,kind:m[1],material:m[2],name:`${M.name} ${W.name}`,reach:W.reach,rate:W.rate,dmg:Math.round(W.dmg*M.mult),dur:M.dur,price:Math.round(combat.PRICE[m[1]]*M.price)}},
  allWeapons:()=>Object.keys(combat.WEAPONS).flatMap(k=>Object.keys(combat.MATERIALS).map(m=>`weapon-${k}-${m}`)),
  /* a weapon's wear: perfect, damaged, broken (broken weapons don't hit) */
  wear:(left,dur)=>left<=0?'broken':left/dur>.66?'perfect':'damaged',
  CREATURES:{
    harpy:{name:'Harpy',hp:28,dmg:7,rate:1.2,speed:1.9,from:3,flies:true,lore:'Half woman, half bird of prey; snatches and scratches.'},
    basilisk:{name:'Basilisk',hp:45,dmg:11,rate:1.7,speed:1.1,from:8,lore:'A crested serpent-king whose gaze stuns.'},
    minotaur:{name:'Minotaur',hp:70,dmg:15,rate:1.9,speed:1.3,from:14,lore:'Bull-headed giant of the labyrinth; charges.'},
    manticore:{name:'Manticore',hp:65,dmg:14,rate:1.6,speed:1.5,from:20,lore:'Lion body, bat wings, a scorpion tail of spines.'},
    hydra:{name:'Hydra',hp:95,dmg:9,rate:1.1,speed:.8,from:28,lore:'Many-headed water serpent; each head bites.'}},
  SPAWN_CHANCE:.22,FRIENDLY_CHANCE:.3,AGGRO_M:3.6,BITE_M:1.25,WOUNDED_AT:.4,
  /* which creature (if any) lives in hall n: deeper halls hold stronger ones */
  spawn(n,roomType,seed){const R=rng(n*131+seed);if(n<3||roomType==='kitchen'||R()>combat.SPAWN_CHANCE)return null;const ok=Object.keys(combat.CREATURES).filter(k=>n>=combat.CREATURES[k].from);if(!ok.length)return null;
    const kind=ok[Math.floor(R()*ok.length)];return{kind,friendly:R()<combat.FRIENDLY_CHANCE,hp:combat.CREATURES[kind].hp}},
  state(c){const C=combat.CREATURES[c.kind];return c.hp<=0?'dead':c.hp<C.hp*combat.WOUNDED_AT?'wounded':c.friendly?'friendly':'threatening'},
  LOOT:{coinsMin:3,coinsPerHp:.12}};

/* ---------- fuel: firewood and kindling ---------- */
const fuel={KINDLING_PER_WOOD:5,KINDLING_PER_STRIKE:1,WOOD_PER_TREE:3,TREES:/^(apple|pear|peach|fig)/,TREE_STRIKES:[8,5,3],FIREWOOD_PRICE:3,
  wood:S=>(S.wood||0)+Math.floor((S.kindling||0)/fuel.KINDLING_PER_WOOD),
  /* pay n firewood, using whole logs first, then kindling at 5 to 1; false if there isn't enough */
  pay(S,n){if(fuel.wood(S)<n)return false;const w=Math.min(S.wood||0,n);S.wood=(S.wood||0)-w;S.kindling=(S.kindling||0)-(n-w)*fuel.KINDLING_PER_WOOD;return true}};

/* ---------- cooking: ingredients must be cooked, in a kitchen oven or a cauldron over a campfire ---------- */
const cook={WOOD_PER_UNIT:2,CAULDRON_PRICE:40,RAW_HP:4,COOKED_HP:12,BURNT_HP:2,
  /* the same timing check as Cult of the Lamb's cooking or Disney Dreamlight Valley's stove: a marker sweeps a bar; stop it
     inside the lit range. One range per ingredient, so one wide range for a baked potato, three narrow ones for a three-part dish. */
  RECIPES:[
    {id:'potato-baked',name:'Baked Potato',needs:['potato'],hp:14},
    {id:'potato-soup',name:'Potato Soup',needs:['potato','onion','garlic'],hp:32},
    {id:'ratatouille',name:'Ratatouille',needs:['eggplant','tomato','pepper','squash_summer'],hp:42},
    {id:'bean-stew',name:'Bean Stew',needs:['bean','tomato','onion'],hp:34},
    {id:'squash-roast',name:'Roast Squash with Garlic',needs:['squash_winter','garlic'],hp:24},
    {id:'rhubarb-crumble',name:'Rhubarb and Strawberry Crumble',needs:['rhubarb','strawberry'],hp:26}],
  /* what an item is: potato-red -> potato; produce-bean_pole -> bean_pole */
  plantOf:id=>{id=String(id||'');if(/^potato-(red|purple|brown)$/.test(id))return'potato';const m=id.match(/^produce-(.+)$/);return m?m[1]:null},
  matches:(need,id)=>{const p=cook.plantOf(id);return!!p&&(p===need||p.startsWith(need+'_')||p.startsWith(need))},
  /* the recipes you can make from a bag (each needs one of each ingredient, and at least one must be an Ingredient) */
  available(inv,isIngredient){const out=[];for(const r of cook.RECIPES){const used=[];let ok=true;for(const n of r.needs){const i=inv.findIndex((x,k)=>!used.includes(k)&&cook.matches(n,x));if(i<0){ok=false;break}used.push(i)}if(ok)out.push({...r,use:used})}
    inv.forEach((x,i)=>{if(isIngredient(x)&&!/^potato-/.test(x))out.push({id:'cooked-'+cook.plantOf(x),name:'Cooked '+cook.plantOf(x).replace(/_/g,' '),needs:[cook.plantOf(x)],hp:cook.COOKED_HP,use:[i]})});
    return out},
  /* the minigame for a recipe: one check per ingredient; fewer checks get wider, slower ranges */
  checks(recipe,seed){const R=rng(seed||1),n=clamp(recipe.needs.length,1,4),w=n===1?.5:clamp(.34-.05*(n-2),.18,.34),sp=n===1?.55:.7+.12*n;
    return Array.from({length:n},(_,i)=>{const lo=clamp(.15+R()*(.85-w-.15),.05,.95-w);return{lo,hi:lo+w,speed:sp*(1+i*.08),label:recipe.needs[i]}})},
  /* where the marker is at time t (seconds): it sweeps back and forth */
  marker:(t,speed)=>{const u=(t*speed)%2;return u<1?u:2-u},
  hit:(c,x)=>x>=c.lo&&x<=c.hi};

/* ---------- skeleton: posable bodies for creatures (25 Nov 2026) ----------
   Geometry only (no colours, no drawing), so any project and any art style can use it. A body plan turns proportions
   and a pose into parts: closed outlines in units (ground at y = 0, facing left, about 1 unit tall), each with a role
   that the art decides how to paint ('fur','mane','skin','hair','feather','wing','scale','belly','chitin','sting',
   'horn','hoof','cloth','metal'), plus bones (for wing struts and debugging) and head anchors (where a face goes).
   Plans: quadruped (manticore), biped (minotaur), bird (harpy), serpent (basilisk), hydra.
   skeleton.build(kind, state, o) -> {parts, bones, heads, bounds}; state = friendly | threatening | wounded | dead.
   Proportions are anatomical (research/subjects/creatures/), so a change of style changes the paint, not the body. */
const skeleton=(()=>{const TAU=Math.PI*2;
 const cr=(J,n)=>{const out=[];for(let i=0;i<J.length-1;i++){const p0=J[Math.max(0,i-1)],p1=J[i],p2=J[i+1],p3=J[Math.min(J.length-1,i+2)];for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(d=>.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3)).concat([i+t]))}}const L=J[J.length-1];out.push([L[0],L[1],J.length-1]);return out};
 /* a limb or neck: a tube along joints J, width Wd at each joint, an optional muscle bulge [segment, amount, side] */
 const limb=(J,Wd,bulge)=>{const S=cr(J,8),Lf=[],Rt=[];S.forEach((p,k)=>{const a=S[Math.max(0,k-1)],b=S[Math.min(S.length-1,k+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,i=Math.min(Wd.length-2,Math.floor(p[2])),f=p[2]-i,w=(Wd[i]+(Wd[i+1]-Wd[i])*f)/2,m=bulge&&i===bulge[0]?Math.sin(f*Math.PI)*bulge[1]:0,nx=-dy/l,ny=dx/l;
   Lf.push([p[0]+nx*(w+(bulge&&bulge[2]>0?m:0)),p[1]+ny*(w+(bulge&&bulge[2]>0?m:0))]);Rt.push([p[0]-nx*(w+(bulge&&bulge[2]<0?m:0)),p[1]-ny*(w+(bulge&&bulge[2]<0?m:0))])});return Lf.concat(Rt.reverse())};
 const ell=(c,rx,ry,n,f,rot)=>{const o=[],cs=Math.cos(rot||0),sn=Math.sin(rot||0);for(let i=0;i<n;i++){const a=i/n*TAU,k=f?f(a,i):1,x=Math.cos(a)*rx*k,y=Math.sin(a)*ry*k;o.push([c[0]+x*cs-y*sn,c[1]+x*sn+y*cs])}return o};
 const off=(J,O)=>J.map((p,i)=>O&&O[i]?[p[0]+O[i][0],p[1]+O[i][1]]:p.slice());
 const rotAll=(pts,pv,a)=>{const c=Math.cos(a),s=Math.sin(a);return pts.map(([x,y])=>[pv[0]+(x-pv[0])*c-(y-pv[1])*s,pv[1]+(x-pv[0])*s+(y-pv[1])*c])};
 const STATE={friendly:{rear:0,spread:.3,droop:0,open:0},threatening:{rear:1,spread:1,droop:0,open:1},wounded:{rear:0,spread:.1,droop:1,open:.4},dead:{rear:0,spread:.1,droop:1,open:.5}};
 /* a bat wing: shoulder ws; e = spread 0 (folded along the back) .. 1 (raised); tatter notches the trailing edge */
 const batWing=(ws,att,e,size,tatter,seed)=>{const lerp=(a,b)=>a+(b-a)*e,a1=lerp(-.75,-1.85),L1=lerp(.26,.34)*size,wr=[ws[0]+Math.cos(a1)*L1,ws[1]+Math.sin(a1)*L1];
   const fa=[[-.25,-1.1],[.2,-.55],[.65,-.05]].map(([f,s])=>f+(s-f)*e),fl=[[.26,.48],[.3,.56],[.24,.46]].map(([f,s])=>(f+(s-f)*e)*size),tips=fa.map((a,i)=>[wr[0]+Math.cos(a)*fl[i],wr[1]+Math.sin(a)*fl[i]]);
   const pull=(a,b,k)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];return[m[0]+(wr[0]-m[0])*k,m[1]+(wr[1]-m[1])*k]};let r=seed||7;const R=()=>{r=(r*16807)%2147483647;return r/2147483647};
   const edge=(a,b)=>{const p=[pull(a,b,lerp(.28,.4))];if(tatter)for(let q=1;q<4;q++){const t=q/4,m=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];p.push([m[0]+(wr[0]-m[0])*(.15+R()*.2*tatter),m[1]+(wr[1]-m[1])*(.15+R()*.2*tatter)])}return p};
   return{pts:[ws,[(ws[0]+wr[0])/2,(ws[1]+wr[1])/2-.02],wr,tips[0],...edge(tips[0],tips[1]),tips[1],...edge(tips[1],tips[2]),tips[2],...edge(tips[2],att),att,[(att[0]+ws[0])/2,(att[1]+ws[1])/2+.02]],bones:[[ws,wr],...tips.map(t=>[wr,t])]}};
 /* a feathered wing: the same frame, the trailing edge cut into primaries */
 const birdWing=(ws,e,size)=>{const lerp=(a,b)=>a+(b-a)*e,a=lerp(1.15,-1.35),L=lerp(.36,.62)*size,tip=[ws[0]+Math.cos(a)*L,ws[1]+Math.sin(a)*L],nx=-Math.sin(a),ny=Math.cos(a),pts=[[ws[0]-.02,ws[1]-.01]];
   for(let i=0;i<=6;i++){const t=i/6,bx=ws[0]+(tip[0]-ws[0])*t,by=ws[1]+(tip[1]-ws[1])*t,w=L*(.12-.08*t);pts.push([bx-nx*w*.6,by-ny*w*.6])}
   for(let i=8;i>=0;i--){const t=i/8,bx=ws[0]+(tip[0]-ws[0])*t,by=ws[1]+(tip[1]-ws[1])*t,w=L*(.3-.18*t)+(i%2?L*.05:0);pts.push([bx+nx*w,by+ny*w])}return{pts,bones:[[ws,tip]]}};
 const tailSegs=(T0,n,thick,role)=>{const S=cr(T0,6),out=[];for(let i=0;i<n;i++){const u=i/(n-1),k=Math.min(S.length-2,Math.round(u*(S.length-2))),a=S[k],b=S[k+1],ang=Math.atan2(b[1]-a[1],b[0]-a[0]),r=(.058-.03*u)*thick;out.push({role,seg:i,pts:ell([a[0],a[1]],r*1.1,r*.85,14,null,ang)})}
   const e=S[S.length-1],d=S[S.length-3],ang=Math.atan2(e[1]-d[1],e[0]-d[0]),R=(x,y)=>[e[0]+x*Math.cos(ang)-y*Math.sin(ang),e[1]+x*Math.sin(ang)+y*Math.cos(ang)],t=thick;
   out.push({role:'sting',pts:[R(-.01*t,-.025*t),R(.06*t,-.02*t),R(.11*t,.03*t),R(.12*t,.08*t),R(.08*t,.025*t),R(-.01*t,.025*t)]});return out};
 const plans={};
 /* QUADRUPED (manticore): a lion's body (shoulder ~0.66 of length-to-ground, deep chest, tucked belly, jointed legs: elbow, carpus; stifle, hock),
    a man's face in a mane, folded or raised bat wings, a scorpion's segmented tail */
 plans.quadruped=(st,o)=>{const p=Object.assign({len:.78,shoulderH:.66,hipH:.64,chest:.34,belly:.25,rump:.3,hump:.02,legW:1,paw:.065,head:1,wing:1,tail:1},o),L=p.len,Ws=p.shoulderH-st.droop*.05,Hh=p.hipH,x0=-L/2,x1=L/2,pw=p.paw,parts=[],bones=[];
  const foreJ=[[x0,-Ws+p.chest*.35],[x0+.05,-Ws+p.chest+.03],[x0,-pw*1.6-.06],[x0-.02,-pw*.5]],hindJ=[[x1-.02,-Hh+p.rump*.35],[x1-.14,-Hh+p.rump+.06],[x1+.06,-Math.max(.12,Hh*.28)],[x1,-pw*.5]];
  const fw=[.19,.12,.07,.07].map(v=>v*p.legW),hw=[.27,.14,.075,.075].map(v=>v*p.legW),paw=P=>ell([P[0]-pw*.35,-pw*.55],pw*1.25,pw*.6,16);
  const leg=(J,Wd,far,bul)=>{parts.push({role:'fur',far,pts:limb(J,Wd,bul)},{role:'fur',far,paw:1,pts:paw(J[J.length-1])})};
  const fo=st.droop?[[0,0],[0,.03],[-.02,.02],[0,0]]:st.rear?[[0,0],[.02,-.05],[-.08,-.1],[-.14,-.08]]:null;
  leg(off(hindJ,[[0,0],[-.03,0],[-.07,0],[-.06,0]]),hw.map(v=>v*.92),1,[0,.03,-1]);leg(off(off(foreJ,fo),[[0,0],[.03,0],[.06,0],[.07,0]]),fw.map(v=>v*.92),1,[0,.02,1]);
  const W=batWing([x0+.13,-Ws-.02],[x1-.05-.1*st.spread,-Hh+.03],st.spread,p.wing,st.droop?.6:0);if(st.spread>.4)parts.push({role:'wing',far:1,pts:W.pts.map(([x,y])=>[x+.05,y-.04])});
  const tb=[x1+.09,-Hh+.04],th=p.tail*(st.droop?.75:1)*(1+st.rear*.1);parts.push(...tailSegs([[0,0],[.12,-.1],[.2,-.28],[.17,-.46],[.06,-.56],[-.07,-.54],[-.14,-.47]].map(([x,y])=>[tb[0]+x*th,tb[1]+y*th]),13,1,'chitin'));
  parts.push({role:'fur',torso:1,pts:[[x0-.13,-Ws+p.chest*.45],[x0-.1,-Ws+.07],[x0+.02,-Ws-.01-p.hump-st.droop*.04],[0,-(Ws+Hh)/2+.02],[x1-.02,-Hh-.01],[x1+.1,-Hh+.06],[x1+.13,-Hh+p.rump*.5],[x1+.05,-Hh+p.rump],[x1-.14,-Hh+p.rump*.92],[0,-(Ws+Hh)/2+p.belly+.02],[x0+.12,-Ws+p.chest],[x0-.02,-Ws+p.chest+.01],[x0-.12,-Ws+p.chest*.8]]});
  leg(hindJ,hw,0,[0,.05,-1]);leg(off(foreJ,fo),fw,0,[0,.03,1]);parts.push({role:'wing',pts:W.pts});bones.push(...W.bones);
  const F=[x0-.17,-Ws-.05+st.droop*.1-st.rear*.03],mc=[F[0]+.03,F[1]+.02],R=.22*p.head;
  parts.push({role:'mane',pts:ell(mc,R,R,80,(a)=>{const b=Math.max(0,Math.cos(a)),d=Math.max(0,Math.sin(a));return(1+.07*Math.sin(a*11)+.03*Math.sin(a*23))*(1+b*.6*(1-Math.abs(Math.sin(a))*.3))*(1+d*.35)}),center:mc});
  parts.push({role:'skin',face:1,pts:ell([F[0],F[1]],.1*p.head,.13*p.head,40,(a)=>{const t=Math.sin(a);return t>0?1-.3*t*t*.6:1})});
  return{parts,bones,heads:[{type:'human',x:F[0],y:F[1],scale:p.head,eyes:[[F[0]-.037*p.head,F[1]-.023*p.head],[F[0]+.037*p.head,F[1]-.023*p.head]]}]}};
 /* BIPED (minotaur): a man's body about 7.5 heads tall (the bull head counts as 1.3), broad shoulders, a kilt, hooves;
    a bull's head with a long muzzle, horns curving out and forward; threatening raises a fist */
 plans.biped=(st,o)=>{const p=Object.assign({h:1},o),parts=[],bones=[],dr=st.droop,lean=dr*.12;
  const hipY=-.47,shY=-.79+dr*.04,legs=[[.03,1],[-.03,0]];
  for(const[dx,far]of legs){const J=[[dx,hipY],[dx-.03+dr*.04,-.26],[dx+.01,-.07],[dx-.02,-.03]];parts.push({role:'fur',far,pts:limb(J,[.13,.09,.055,.05],[0,.025,1])},{role:'hoof',far,pts:ell([dx-.03,-.022],.045,.024,12)})}
  const arm=(sx,far)=>{const s0=[sx,shY+.02];let J=[s0,[sx-.04,shY+.19],[sx-.03,shY+.34],[sx-.04,shY+.38]];if(st.rear&&!far)J=[s0,[sx-.14,shY-.08],[sx-.2,shY-.23],[sx-.21,shY-.27]];if(dr&&!far)J=[s0,[sx-.02,shY+.16],[sx+.06,shY+.26],[sx+.07,shY+.27]];
   parts.push({role:'fur',far,pts:limb(J,[.085,.07,.05,.05],[0,.02,1])},{role:'fur',far,pts:ell(J[3],.035,.03,10)})};
  arm(.1,1);
  parts.push({role:'fur',torso:1,pts:[[-.15,shY],[-.06,shY-.04],[.08,shY-.04],[.16,shY],[.15,shY+.15],[.09,hipY-.02],[.1,hipY+.04],[-.1,hipY+.04],[-.09,hipY-.02],[-.15,shY+.13]]});
  parts.push({role:'cloth',pts:[[-.12,hipY-.02],[.12,hipY-.02],[.14,hipY+.12],[.09,hipY+.1],[.05,hipY+.14],[0,hipY+.11],[-.05,hipY+.15],[-.09,hipY+.1],[-.14,hipY+.12]]});
  arm(-.1,0);
  const hc=[-.09-dr*.04,shY-.11+dr*.05-st.rear*.01];parts.push({role:'fur',pts:limb([[-.02,shY+.02],[hc[0]+.02,hc[1]+.03]],[.13,.1])});
  for(const[sx,far]of[[1,1],[-1,0]])parts.push({role:'horn',far,pts:limb([[hc[0]+.02*sx,hc[1]-.06],[hc[0]+.08*sx+.02,hc[1]-.09],[hc[0]+.07*sx-.03,hc[1]-.17-st.rear*.02]],[.04,.022,.006])});
  parts.push({role:'fur',pts:ell(hc,.085,.075,20)},{role:'fur',pts:ell([hc[0]-.09,hc[1]+.035],.065,.048,16,null,-.25)},{role:'fur',pts:ell([hc[0]+.06,hc[1]-.04],.04,.016,10,null,-.5)});
  return{parts,bones,heads:[{type:'bull',x:hc[0],y:hc[1],scale:1,eyes:[[hc[0]-.04,hc[1]-.025]]}]}};
 /* BIRD (harpy): a vulture-sized bird body (pear-shaped, deep breast), scaled legs with the ankle bending back, taloned feet,
    long feathered wings, tail feathers; a woman's head and long hair */
 plans.bird=(st,o)=>{const p=Object.assign({},o),parts=[],bones=[],dr=st.droop;
  for(const[dx,far]of[[.05,1],[-.02,0]]){const J=[[dx,-.4],[dx+.05,-.27],[dx-.01,-.1],[dx-.03,-.02]];parts.push({role:'hoof',far,pts:limb(J,[.05,.03,.022,.02])});for(const t of[-.05,-.01,.03])parts.push({role:'hoof',far,pts:limb([[dx-.03,-.02],[dx-.03+t,-.004]],[.014,.006])})}
  const bc=[.03,-.55+dr*.05];const W=birdWing([.05,-.68+dr*.04],st.spread,1);if(st.spread>.4)parts.push({role:'feather',far:1,pts:W.pts.map(([x,y])=>[x+.04,y-.03])});
  parts.push({role:'feather',pts:[[.12,-.45],[.3,-.36],[.33,-.3],[.12,-.38]]});
  parts.push({role:'feather',torso:1,pts:ell(bc,.13,.19,28,(a)=>1+(Math.sin(a)>0?.12*Math.sin(a):0),-.35)});
  parts.push({role:'feather',pts:W.pts});bones.push(...W.bones);
  const hc=[-.07,-.8+dr*.1];parts.push({role:'skin',pts:limb([[-.02,-.68+dr*.06],[hc[0]+.01,hc[1]+.06]],[.06,.045])});
  parts.push({role:'hair',pts:[[hc[0]+.02,hc[1]-.07],[hc[0]+.08,hc[1]-.05],[hc[0]+.1,hc[1]+.05],[hc[0]+.12,hc[1]+.18],[hc[0]+.06,hc[1]+.16],[hc[0]+.03,hc[1]+.04]]});
  parts.push({role:'skin',face:1,pts:ell(hc,.055,.068,24,(a)=>Math.sin(a)>0?1-.25*Math.sin(a)**2:1)});
  parts.push({role:'hair',pts:ell([hc[0]+.01,hc[1]-.04],.062,.04,16)});
  return{parts,bones,heads:[{type:'human',x:hc[0],y:hc[1],scale:.52,eyes:[[hc[0]-.02,hc[1]-.008],[hc[0]+.018,hc[1]-.008]]}]}};
 const snakeHead=(h,k)=>[[h[0]-.11*k,h[1]+.015*k],[h[0]-.09*k,h[1]-.03*k],[h[0]-.02*k,h[1]-.05*k],[h[0]+.05*k,h[1]-.045*k],[h[0]+.08*k,h[1]-.01*k],[h[0]+.06*k,h[1]+.035*k],[h[0]-.02*k,h[1]+.045*k],[h[0]-.09*k,h[1]+.04*k]];
 /* SERPENT (basilisk): a snake's long body laid in coils, a raised neck (about a third of its length), a small head with a crown crest */
 plans.serpent=(st,o)=>{const parts=[],dr=st.droop,r=st.rear;
  parts.push({role:'scale',pts:ell([.04,-.07],.32,.07,24)},{role:'scale',pts:ell([.03,-.15],.25,.065,24)},{role:'scale',pts:ell([.02,-.22],.18,.06,24)});
  const hc=[-.12-r*.03,-.66-r*.18+dr*.35],J=[[.04,-.24],[.12+r*.05,-.4+dr*.1],[.06,(hc[1]-.24)/2-.05+dr*.05],[hc[0]+.05,hc[1]+.02]];parts.push({role:'scale',pts:limb(J,[.085,.07,.055,.05])});
  for(let k=0;k<3;k++)parts.push({role:'horn',pts:[[hc[0]-.04+k*.04,hc[1]-.045],[hc[0]-.03+k*.04,hc[1]-.12-k%2*.02],[hc[0]-.01+k*.04,hc[1]-.045]]});
  parts.push({role:'scale',pts:snakeHead(hc,1.25)});
  return{parts,bones:[],heads:[{type:'serpent',x:hc[0],y:hc[1],scale:.65,eyes:[[hc[0]-.045,hc[1]-.025]],open:st.open}]}};
 /* HYDRA: a heavy body low in the marsh, five necks of snake proportions, each with its own head */
 plans.hydra=(st,o)=>{const parts=[],heads=[],dr=st.droop,r=st.rear,H=[[-.34,-.55],[-.2,-.78],[-.02,-.88],[.16,-.8],[.28,-.6]],B=[[-.16,-.2],[-.08,-.26],[.02,-.28],[.1,-.26],[.18,-.2]];
  const neck=i=>{const d=dr&&(i===1||i===3)?1:0,h=[H[i][0]*(1+r*.15)-d*.08,H[i][1]-r*.12+d*.42],b=B[i];const sw=(i%2?-1:1)*.05;parts.push({role:'scale',pts:limb([b,[b[0]+(h[0]-b[0])*.2+sw,(b[1]+h[1])*.55],[b[0]+(h[0]-b[0])*.6-sw,h[1]+.14-d*.2],[h[0]+.05,h[1]+.015]],[.07,.055,.045,.04])});
   parts.push({role:'scale',pts:snakeHead(h,.95)});heads.push({type:'serpent',x:h[0],y:h[1],scale:.5,eyes:[[h[0]-.035,h[1]-.02]],hurt:d})};
  [0,2,4].forEach(neck);parts.push({role:'scale',torso:1,pts:[[-.32,-.05],[-.24,-.24],[0,-.31],[.24,-.25],[.34,-.08],[.3,-.02],[-.3,-.02]]});[1,3].forEach(neck);
  return{parts,bones:[],heads}};
 const KIND={manticore:'quadruped',minotaur:'biped',harpy:'bird',basilisk:'serpent',hydra:'hydra'};
 function bounds(parts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;parts.forEach(p=>p.pts.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}));return{x0,y0,x1,y1,w:x1-x0,h:y1-y0}}
 /* build: the plan for a creature (or a plan name), posed for a state, scaled so the friendly pose stands 1 unit tall */
 function build(kind,state,o){const plan=plans[KIND[kind]||kind];if(!plan)return null;const st=Object.assign({},STATE[state]||STATE.friendly);const ref=plan(STATE.friendly,o),k=1/bounds(ref.parts).y0*-1,B=plan(st,o);
  const sc=pts=>pts.map(([x,y])=>[x*k,y*k]);B.parts.forEach(p=>{p.pts=sc(p.pts);if(p.center)p.center=sc([p.center])[0]});B.bones=B.bones.map(sc);B.heads.forEach(h=>{const q=sc([[h.x,h.y]])[0];h.x=q[0];h.y=q[1];h.scale*=k;h.eyes=sc(h.eyes)});
  B.state=state;B.kind=kind;B.mood={friendly:'calm',threatening:'angry',wounded:'hurt',dead:'dead'}[state]||'calm';B.open=st.open;B.bounds=bounds(B.parts);return B}
 return{plans:Object.keys(plans),KIND,STATE,build,bounds,limb,ell,cr}})();

/* ---------- the parts, described for the engine tab and the Request Builder ---------- */
const parts=[
 {id:'clock',name:'Time',what:'A game clock: 1 real second is 1 game minute, so a day lasts 24 minutes. Plants first seen growing are ready 6 game hours later. Glass rooms dim at night.',params:()=>({MIN_PER_SEC:clock.MIN_PER_SEC,GROW_HOURS:clock.GROW_HOURS,START:'08:00'})},
 {id:'health',name:'Health',what:'100 health. Combat, traps and falls take it away; food and time give it back (2 an hour). At 0 you faint and wake at the front doors with 50, a tenth of your coins dropped.',params:()=>({MAX:health.MAX,REGEN_PER_HOUR:health.REGEN_PER_HOUR,WAKE_HP:health.WAKE_HP,FAINT_COIN_LOSS:health.FAINT_COIN_LOSS})},
 {id:'keys',name:'Keys and UI',what:'The usual PC layout: M map, I bag, WASD walk, Space jump, C climb, F attack, E use, Esc back, H keys. A minimap sits in the corner, the clock and the health bar at the top.',params:()=>Object.fromEntries(keys.list().map(([a,l,k])=>[l,k.join(' / ')]))},
 {id:'locks',name:'Lock timers',what:'Every unsolved lock is timed: 2 minutes plus 25 seconds a step. Run out and it seals for 90 game minutes and the snap costs 10 health.',params:()=>({BASE_SEC:locks.BASE_SEC,PER_STEP_SEC:locks.PER_STEP_SEC,COOLDOWN_MIN:locks.COOLDOWN_MIN,DAMAGE:locks.DAMAGE})},
 {id:'moves',name:'Jumping, climbing, ledges',what:'Jump 0.9 m (Space); climb higher ledges (C). Stone ledges line some rooms, usually with an item on top. Stepping off anything over 0.9 m hurts: 30 health a metre above that, plus 4.',params:()=>({JUMP_H:moves.JUMP_H,FALL_SAFE:moves.FALL_SAFE,FALL_DMG_PER_M:moves.FALL_DMG_PER_M,LEDGE_HEIGHTS:moves.LEDGE_HEIGHTS.join(', '),LEDGE_CHANCE:moves.LEDGE_CHANCE})},
 {id:'traps',name:'Traps',what:'Pressure plates spring spikes (jump over them). Timed locks seal. Path rooms have points and edges on the floor: walk every edge once without going back over one (an Euler trail); backtracking fires flame throwers, spikes or poison fog.',params:()=>({PLATE_DMG:traps.PLATE_DMG,BACKTRACK_DMG:traps.BACKTRACK_DMG,PLATE_CHANCE:traps.PLATE_CHANCE,PATH_CHANCE:traps.PATH_CHANCE})},
 {id:'combat',name:'Combat',what:'Knife (fast, short), sword (strong), staff (long reach), each in bronze, iron or starmetal. Weapons wear out: perfect, damaged, broken. Harpies, basilisks, minotaurs, manticores and hydras live in deeper halls; some are friendly until struck.',params:()=>({creatures:Object.values(combat.CREATURES).map(c=>`${c.name} ${c.hp}hp/${c.dmg}dmg from hall ${c.from}`).join('; '),weapons:combat.allWeapons().map(w=>{const x=combat.weapon(w);return`${x.name} ${x.dmg}dmg ${x.dur}uses`}).join('; ')})},
 {id:'cook',name:'Cooking',what:'Ingredients (food that must be cooked) go in a kitchen oven, or in a cauldron over a greenhouse campfire (2 firewood a dish). A timing check per ingredient: stop the sweeping marker inside the lit range. Miss and it burns.',params:()=>({WOOD_PER_UNIT:cook.WOOD_PER_UNIT,recipes:cook.RECIPES.map(r=>`${r.name} (${r.needs.join(' + ')})`).join('; ')})},
 {id:'skeleton',name:'Skeleton',what:'Posable bodies for creatures: five body plans (four-legged, two-legged, bird, serpent, many-headed) with anatomical proportions, jointed legs, wing bones, tail curves and head anchors, posed for friendly, threatening, wounded and dead. Geometry only: the art style paints it.',params:()=>({plans:skeleton.plans.join(', '),creatures:Object.entries(skeleton.KIND).map(([k,v])=>k+' → '+v).join('; '),states:Object.keys(skeleton.STATE).join(', ')})},
 {id:'fuel',name:'Firewood',what:'Each strike on vines gives 1 kindling; 5 kindling make 1 firewood. Fruit trees can be cut down for 3 firewood. The statue shop sells firewood.',params:()=>({KINDLING_PER_WOOD:fuel.KINDLING_PER_WOOD,WOOD_PER_TREE:fuel.WOOD_PER_TREE,FIREWOOD_PRICE:fuel.FIREWOOD_PRICE})}];

window.ENGINE={clock,health,keys,locks,moves,traps,combat,cook,fuel,skeleton,parts,rng,VERSION:'2026-11-25'};
})();
