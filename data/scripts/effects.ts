import * as mc from "@minecraft/server";



function applyFireResistance(player){
    const fireResistanceEffect = mc.EffectTypes.get("fire_resistance");
    const duration = 10000; 
    const amplifier = 1; 
  
    player.addEffect(fireResistanceEffect, duration, amplifier, true);
  }


export const giveEffect = (player: mc.Player, message : string) => {
    switch (message) {
        case "fire_resistance":
            applyFireResistance(player)
    
        default:
            break;
    }
}