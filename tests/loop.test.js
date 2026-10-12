import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{style:{},children:Array.from({length:3},()=>({classList:{toggle(){}}})),classList:{toggle(){}},addEventListener(){},getContext(){return {};},setPointerCapture(){},textContent:'',hidden:false});return elements.get(id);}
Object.assign(globalThis,{document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{},innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},location:{search:''}});
let src=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
src=src.replace("import * as T from 'three';",`import * as Actual from '${pathToFileURL(process.cwd()+'/node_modules/three/build/three.module.js').href}'; const T={...Actual,WebGLRenderer:class{setPixelRatio(){} setSize(){} render(){} info={render:{calls:0}}}};`);
src=src.replace("'./rules.js'",JSON.stringify(pathToFileURL(process.cwd()+'/src/rules.js').href));
src+='\nexport {update,reset,attack,interact,enemies,shrines,keys}; export const state=()=>({p,mode});';
const game=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
function tick(n){for(let i=0;i<n;i++)game.update(1/60);}
test('movement, combat, all shrines, keeper, victory and fresh restart',()=>{game.reset();const p=game.state().p;game.keys.add('KeyW');tick(60);game.keys.clear();assert.ok(p.z<11);for(const e of game.enemies){if(e.big)continue;p.x=e.x;p.z=e.z+2;for(let j=0;j<4&&e.hp>0;j++){p.stamina=100;p.hp=100;game.attack();tick(36);}assert.ok(e.hp<=0,'sentinel defeated');}for(const s of game.shrines){p.x=s.x;p.z=s.z+1;game.interact();assert.ok(s.lit);assert.equal(p.flasks,3);}const boss=game.enemies.at(-1);for(let i=0;i<15&&boss.hp>0;i++){p.x=boss.x;p.z=boss.z+2;p.stamina=100;p.hp=100;game.attack();tick(36);}assert.equal(game.state().mode,'won');game.reset();assert.equal(game.state().mode,'playing');assert.equal(game.state().p.hp,100);assert.ok(game.shrines.every(s=>!s.lit));assert.ok(game.enemies.every(e=>e.hp===e.max));});
test('enemy attacks lead to defeat and exhausted healing cannot revive',()=>{game.reset();const p=game.state().p,e=game.enemies[0];p.x=e.x;p.z=e.z+1;p.hp=1;tick(100);assert.equal(game.state().mode,'dead');assert.equal(p.hp,0);});
