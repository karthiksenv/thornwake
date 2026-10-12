export const CONFIG = Object.freeze({health:100,stamina:100,speed:5,attackCost:20,dodgeCost:28,attackDamage:28,reach:3.1,flasks:3});
export function freshPlayer(){return {x:0,z:15,hp:100,stamina:100,flasks:3,attack:0,cooldown:0,dodge:0,invulnerable:0,guard:false,kills:0,level:1};}
export function canAttack(p){return p.hp>0&&p.stamina>=CONFIG.attackCost&&p.cooldown<=0&&p.dodge<=0;}
export function incomingDamage(p,damage,facing){if(p.invulnerable>0)return 0;if(p.guard&&facing&&p.stamina>=15){p.stamina=Math.max(0,p.stamina-15);return damage*.1;}return damage;}
export function inArc(px,pz,angle,ex,ez,reach=CONFIG.reach){const dx=ex-px,dz=ez-pz;return Math.hypot(dx,dz)<reach&&(dx*Math.sin(angle)+dz*Math.cos(angle))/Math.max(.01,Math.hypot(dx,dz))>-.1;}
