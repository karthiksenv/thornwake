import { Game } from './game';
export class Sound {
 ctx:AudioContext|null=null; gain:GainNode|null=null; muted=false;
 start(){if(this.ctx){void this.ctx.resume();return;}this.ctx=new AudioContext();this.gain=this.ctx.createGain();this.gain.gain.value=.22;this.gain.connect(this.ctx.destination);for(const f of [55,82.4,110.2]){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.035;o.connect(g).connect(this.gain);o.start();}}
 tone(freq:number,duration:number,type:OscillatorType='sine',volume=.2,end=0){if(!this.ctx||!this.gain)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.gain);o.start(t);o.stop(t+duration);}
 events(game:Game){for(const e of game.events.splice(0)){if(e==='swing')this.tone(180,.18,'sawtooth',.09,40);else if(e==='hit'||e==='slam')this.tone(e==='slam'?65:210,.22,'triangle',.3,30);else if(e==='hurt')this.tone(90,.3,'sawtooth',.16,35);else if(e==='block')this.tone(720,.18,'triangle',.2,180);else if(['heal','magic','victory','equip','kill'].includes(e)){this.tone(440,.7,'sine',.18);setTimeout(()=>this.tone(660,.6,'sine',.12),80);setTimeout(()=>this.tone(880,.7,'sine',.1),160);}else if(e==='boss')this.tone(42,2,'sawtooth',.1);}}
 toggle(){this.muted=!this.muted;if(this.gain)this.gain.gain.value=this.muted?0:.22;return this.muted;}
}
