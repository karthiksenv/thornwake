import * as T from 'three';
import {Game} from './game';
import {World} from './world';
import {UI} from './ui';
import {Sound} from './audio';
import './style.css';
const canvas=document.querySelector<HTMLCanvasElement>('#world')!;
const game=new Game(),sound=new Sound();
let world:World;
try{world=new World(canvas,game);}catch(error){document.body.innerHTML='<div style="padding:50px;color:#dfd0a7;font:20px Georgia">Thornwake needs WebGL 2 to enter the weald. Enable hardware acceleration in your browser and reload.</div>';throw error;}
const ui=new UI(game);ui.onStart=()=>sound.start();ui.onSound=()=>sound.toggle();ui.onQuality=()=>{world.setQuality(!world.quality);return world.quality;};
const keys=new Set<string>();const mouse=new T.Vector2();const raycaster=new T.Raycaster();const plane=new T.Plane(new T.Vector3(0,1,0),0);const aim=new T.Vector3();let aimActive=false;
const binds:Record<string,string>={KeyJ:'attack',KeyK:'block',Space:'roll',KeyQ:'magic',KeyR:'heal',KeyE:'interact',KeyI:'inventory',Tab:'inventory',Escape:'pause'};
window.addEventListener('keydown',e=>{if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat&&binds[e.code]){sound.start();game.action(binds[e.code]);}});
window.addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointermove',e=>{mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(mouse,world.camera);if(raycaster.ray.intersectPlane(plane,aim))aimActive=true;});
canvas.addEventListener('pointerdown',e=>{sound.start();mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(mouse,world.camera);raycaster.ray.intersectPlane(plane,aim);aimActive=true;if(game.mode==='play'){game.angle=Math.atan2(aim.x-game.x,aim.z-game.z);if(e.button===0)game.action('attack');if(e.button===2)game.target={x:aim.x,z:aim.z};}else if(game.mode==='intro')game.action('skip');});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('resize',()=>world.resize());window.addEventListener('blur',()=>{keys.clear();if(game.mode==='play')game.mode='pause';});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(game.mode==='play')game.mode='pause';}});
let last=performance.now(),acc=0,frames=0,fpsAt=last;const dev=new URLSearchParams(location.search).has('dev');
function frame(now:number){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.08);last=now;acc+=dt;let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
 // Screen-relative axes match the elevated camera's diagonal projection.
 const input={x:x*.8+z*.6,z:-x*.6+z*.8,block:ui.guardHeld||keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyK'),aim:aimActive?{x:aim.x,z:aim.z}:undefined};
 while(acc>=1/60){game.update(1/60,input);acc-=1/60;}sound.events(game);world.update(game,dt);ui.update(game.time);frames++;if(now-fpsAt>750){const measuredFPS=Math.round(frames*1000/(now-fpsAt));world.adapt(measuredFPS);if(dev)document.querySelector('#dev')!.textContent=`${Math.round(frames*1000/(now-fpsAt))} fps · ${world.renderer.info.render.calls} draws · ${(world.renderer.info.render.triangles/1000).toFixed(0)}k tris`;frames=0;fpsAt=now;}}
requestAnimationFrame(frame);
if(dev)Object.assign(window,{__thornwake:{game,world,ui}});
