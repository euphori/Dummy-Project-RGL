import * as mc from "@minecraft/server";

import {giveEffect} from "./effects.ts"
import {doubleJump, pullEnemies} from "./netherite_sickle.ts"
import {summonLightning} from "./lightning.ts"




function applyEffects(entity: mc.Entity, effect_name : string, duration,amplifier ) {
  const effect = mc.EffectTypes.get(effect_name)
  entity.runCommandAsync(`say {$effect}`)
  if (!effect) {
      console.error(`Effect ${effect_name} not found`);
      return;
  }
  const effectOptions: mc.EntityEffectOptions = {
    
    amplifier: amplifier
};
  
  entity.addEffect(effect,duration, effectOptions)

}



mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  const entity = event.hitEntity;
  const attacker = event.damagingEntity;
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // gives debuff to target when PLAYER ATTACKS
  if (entity && attacker && attacker instanceof mc.Player) {
      const item = attacker.getComponent("minecraft:equippable") as mc.EntityEquippableComponent;
      const weapon = item.getEquipment(mc.EquipmentSlot.Mainhand)
      if (weapon) {
          switch (weapon.typeId) {
              case "dummy:netherite_sickle":
               
                applyEffects(entity, `wither`, 100, 1); 
                applyEffects(entity, `weakness`, 100,0); 
                break;
              case "dummy:golden_kings_excalibur":
                if(getRandomInt(10) <= 1){
                  entity.setOnFire(5)
                }
                break;
          }
          
      }else{
          console.warn("No weapon")
      }
  }
  // gives debuff to attacker when ENEMY ATTACKS PLAYER
  if (entity && attacker && !(attacker instanceof mc.Player)){
      const item = entity.getComponent("minecraft:equippable") as mc.EntityEquippableComponent;
      const weapon = item.getEquipment(mc.EquipmentSlot.Mainhand)
     
      if (weapon) {
          switch (weapon.typeId) {
              case "dummy:netherite_sickle":
                if(getRandomInt(10) <= 2){
                  attacker.runCommandAsync(`say enemy got debuff`);
                  applyEffects(attacker, `wither`, 5, 1); 
                  applyEffects(attacker, `slowness`, 5,2); 
                }
                
                break;
              default:
                return
                
          }
          
      }else{
          console.warn("No weapon")
      }
  }
})


mc.system.runInterval(() => {

  mc.world.getAllPlayers().forEach((player) => {
   
 // player.runCommandAsync(`say ${player.getProperty("dummy:atk_state")}`);
  });
}, mc.TicksPerSecond);



mc.system.afterEvents.scriptEventReceive.subscribe((event) => {
  const {id, message, sourceEntity} = event
  switch (id){
    case "dummy:apply_effect":{
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      
      try {
        giveEffect(sourceEntity, message);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:double_jump":{
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        doubleJump(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:pull":{
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        pullEnemies(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:electrizard_lightning":{
      if (!sourceEntity) return;
      try {
        summonLightning(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
  }

})