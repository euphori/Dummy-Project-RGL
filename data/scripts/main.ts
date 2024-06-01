import * as mc from "@minecraft/server";

import {giveEffect} from "./effects.ts"
import {doubleJump} from "./netherite_sickle.ts"



mc.system.runInterval(() => {
  mc.world.getAllPlayers().forEach((player) => {
 //player.runCommandAsync(`say ${player.}`);
  });
}, mc.TicksPerSecond);



mc.system.afterEvents.scriptEventReceive.subscribe((event) => {
  const {id, message, sourceEntity} = event
  switch (id){
    case "dummy:effect":{
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      
      try {
        giveEffect(sourceEntity, message);
      } catch (e) {
        console.error(e);
      }

    }
    case "dummy:double_jump":{
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        doubleJump(sourceEntity);
      } catch (e) {
        console.error(e);
      }
    }
  }

})