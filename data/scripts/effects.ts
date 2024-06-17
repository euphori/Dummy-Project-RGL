import * as mc from "@minecraft/server";


interface EffectData {
    effect: string;
    duration: number;
    amplifier: number;
  }
  


//store last applied effect time
const lastEffectTime = new Map<string, number>();
var sneak_effect_available : boolean = true;


function can_sneak_effect(){
  sneak_effect_available = !sneak_effect_available
}

function applyEffects(player, effect_name, duration,amplifier){
    const effectType = mc.EffectTypes.get(effect_name);
    if(!effectType){
        console.error(`Effect ${effect_name} not found`);
        return;
    }
    const effectOptions: mc.EntityEffectOptions = {
        
        amplifier: amplifier,
        showParticles: true
    };
    // note: duration is in ticks
    player.addEffect(effectType, duration * mc.TicksPerSecond, effectOptions);
  }




export const giveEffect = (player: mc.Player, message : string) => {
    const data = JSON.parse(message) as EffectData;
    
    if(sneak_effect_available){
        applyEffects(player, data.effect, data.duration, data.amplifier)
        can_sneak_effect()
        mc.system.runTimeout(can_sneak_effect, 20 * 30);
    }
   
    
   
}