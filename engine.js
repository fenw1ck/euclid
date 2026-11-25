/* engine.js: how the game behaves, kept apart from how it looks, so another project can load it and so it can be read
   and improved on the Art Assets site ("Game engine" tab). No drawing here: only rules, numbers and small pure
   functions over a save object S. The Euclid game (game.html) is the first user.
   window.ENGINE = {clock, health, keys, locks, moves, traps, combat, cook, fuel, parts}
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
 {id:'fuel',name:'Firewood',what:'Each strike on vines gives 1 kindling; 5 kindling make 1 firewood. Fruit trees can be cut down for 3 firewood. The statue shop sells firewood.',params:()=>({KINDLING_PER_WOOD:fuel.KINDLING_PER_WOOD,WOOD_PER_TREE:fuel.WOOD_PER_TREE,FIREWOOD_PRICE:fuel.FIREWOOD_PRICE})}];

window.ENGINE={clock,health,keys,locks,moves,traps,combat,cook,fuel,parts,rng,VERSION:'2026-11-25'};
})();
