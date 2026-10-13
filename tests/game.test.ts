import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,CAMP,ALTAR} from '../src/game';
const idle={x:0,z:0,block:false};
const playable=()=>{const g=new Game();g.mode='play';return g;};
test('dodge costs stamina, moves, and prevents incoming damage',()=>{const g=playable(),e=g.enemies[0];g.action('roll');assert.equal(g.stamina,72);g.hurt(30,e);assert.equal(g.hp,125);const z=g.z;g.update(.1,idle);assert.notEqual(g.z,z);});
test('directional guard reduces only attacks in front',()=>{const g=playable(),e=g.enemies[0];g.angle=Math.PI;g.block=true;e.x=g.x;e.z=g.z-1;g.hurt(20,e);assert.ok(g.hp>119);g.invuln=0;g.hp=125;e.z=g.z+1;g.hurt(20,e);assert.equal(g.hp,105);});
test('combo progresses with costs and cooldown prevents spam',()=>{const g=playable();g.action('attack');const st=g.stamina;g.action('attack');assert.equal(g.stamina,st);g.update(.4,idle);g.action('attack');assert.equal(g.combo,1);g.update(.4,idle);g.action('attack');assert.equal(g.combo,2);});
test('equipment cannot be acquired by equipping unknown items',()=>{const g=playable();g.action('inventory');g.equip('thornblade');assert.equal(g.equipment.weapon,'sunblade');g.owned.push('thornblade');g.equip('thornblade');assert.equal(g.stats().might,32);g.equip('thornblade');assert.equal(g.equipment.weapon,null);});
test('rest restores all resources; levels charge essence',()=>{const g=playable();g.x=CAMP.x;g.z=CAMP.z;g.hp=20;g.mana=0;g.flasks=0;g.action('interact');assert.equal(g.mode,'rest');assert.equal(g.hp,125);assert.equal(g.flasks,3);g.levelUp();assert.equal(g.level,1);g.souls=90;g.levelUp();assert.equal(g.level,2);assert.equal(g.souls,20);assert.equal(g.hp,140);});
test('full chapter gates boss and ends at altar; restart clears progression',()=>{const g=playable();for(let i=0;i<3;i++)g.damageEnemy(g.enemies[i],100);assert.equal(g.wardensSlain,3);assert.ok(g.owned.includes('thornblade'));g.z=-24;g.update(.016,idle);assert.ok(g.bossAwake);g.damageEnemy(g.enemies[3],999);assert.ok(g.owned.includes('crown'));g.x=ALTAR.x;g.z=ALTAR.z;g.action('interact');assert.equal(g.mode,'ending');g.update(8,idle);assert.equal(g.mode,'victory');g.start();assert.equal(g.souls,0);assert.equal(g.wardensSlain,0);assert.equal(g.mode,'intro');assert.equal(g.enemies[3].hp,340);});
test('defeat stops combat actions and pause freezes actors',()=>{const g=playable();g.hurt(1000,g.enemies[0]);assert.equal(g.mode,'defeat');g.action('heal');assert.equal(g.hp,0);g.start();g.mode='pause';const x=g.x;g.update(1,{x:1,z:0,block:false});assert.equal(g.x,x);});
test('magic has real range, cost and cooldown',()=>{const g=playable(),e=g.enemies[0];e.x=g.x;e.z=g.z-3;g.action('magic');assert.equal(e.hp,17);assert.equal(g.mana,55);g.action('magic');assert.equal(g.mana,55);assert.equal(g.magicCooldown,5);});
test('a controller can complete real combat from the spawn without damage overrides',()=>{
 const g=playable();g.action('interact');g.mode='play';
 for(let tick=0;tick<60*180&&g.enemies[3].hp>0&&g.hp>0;tick++){
  const e=g.enemies.find(e=>e.hp>0)!;const dx=e.x-g.x,dz=e.z-g.z,d=Math.hypot(dx,dz);
  g.angle=Math.atan2(dx,dz);
  if(g.hp<65&&g.flasks>0)g.action('heal');
  if(d<5&&g.magicCooldown<=0&&g.mana>=25)g.action('magic');
  if(d<2.7&&(e.phase==='recover'||e.phase==='idle')&&g.attackCooldown<=0)g.action('attack');
  g.update(1/60,{x:d>2.35?dx:0,z:d>2.35?dz:0,block:true,aim:{x:e.x,z:e.z}});
 }
 assert.ok(g.hp>0,'controller survives using guard, recovery windows and flasks');
 assert.equal(g.wardensSlain,3);assert.equal(g.enemies[3].hp,0);
});
test('defeated enemies award essence and oath progress only once',()=>{const g=playable();g.damageEnemy(g.enemies[0],100);g.damageEnemy(g.enemies[0],100);assert.equal(g.wardensSlain,1);assert.equal(g.souls,45);g.damageEnemy(g.enemies[3],999);assert.equal(g.enemies[3].hp,340);});
