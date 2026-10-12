import test from 'node:test';
import assert from 'node:assert/strict';
import {freshPlayer,canAttack,incomingDamage,inArc} from '../src/rules.js';
test('combat refuses exhausted, dead and recovering attacks',()=>{const p=freshPlayer();assert.equal(canAttack(p),true);p.stamina=19;assert.equal(canAttack(p),false);p.stamina=100;p.cooldown=.2;assert.equal(canAttack(p),false);p.cooldown=0;p.hp=0;assert.equal(canAttack(p),false);});
test('guard absorbs frontal damage and spends stamina, but not rear attacks',()=>{const p=freshPlayer();p.guard=true;assert.equal(incomingDamage(p,20,true),2);assert.equal(p.stamina,85);assert.equal(incomingDamage(p,20,false),20);p.stamina=10;assert.equal(incomingDamage(p,20,true),20);});
test('dodge invulnerability prevents all damage without consuming guard stamina',()=>{const p=freshPlayer();p.invulnerable=.2;p.guard=true;assert.equal(incomingDamage(p,32,true),0);assert.equal(p.stamina,100);});
test('sword arc rejects targets behind and outside range',()=>{assert.equal(inArc(0,0,0,0,2),true);assert.equal(inArc(0,0,0,0,-2),false);assert.equal(inArc(0,0,0,0,4),false);assert.equal(inArc(0,0,Math.PI/2,2,0),true);});
