import * as mc from "@minecraft/server";

import { doubleJump, pullEnemies } from "./netherite_sickle.ts";
import { summonLightning } from "./lightning.ts";
import {
  excaliburChargedAttack,
  sneakEffect,
} from "./golden_kings_excalibur.ts";

import {
  stunWave,
  thunderWave,
  groundStrike,
  updateCooldown,
} from "./electrizard.ts";

import { handleEntityHitEvent } from "./abyssal_anarchnid.ts";

export var item_being_used;

function applyEffects(
  entity: mc.Entity,
  effect_name: string,
  duration,
  amplifier
) {
  const effect = mc.EffectTypes.get(effect_name);
  if (!effect) {
    console.error(`Effect ${effect_name} not found`);
    return;
  }
  const effectOptions: mc.EntityEffectOptions = {
    amplifier: amplifier,
  };

  entity.addEffect(effect, duration * 20, effectOptions);
}

// mc.world.afterEvents.itemUse.subscribe((event) => {
//   const player = event.source as mc.Player;
//   if (player.getProperty("dummy:can_charge") == true) {
//     item_being_used = event.itemStack;
//   }
//   player.setProperty("dummy:can_summon_sword", false);
//   player.setProperty("dummy:can_charge", false);
// });

// mc.world.afterEvents.itemReleaseUse.subscribe((event) => {
//   const player = event.source as mc.Player;

//   player.setProperty("dummy:can_charge", true);
// });

mc.world.afterEvents.entityHurt.subscribe((event) => {
  const entity = event.hurtEntity;
  const attacker = event.damageSource;

  if (attacker && entity) {
    switch (attacker.damagingEntity?.typeId) {
      case "dummy:abyssal_anarchnid_web":
        applyEffects(entity, `slowness`, 6, 1);
        break;
      case "dummy:devilmon_spit":
        applyEffects(entity, `wither`, 4, 1);
        break;
      default:
        break;
    }
  }
});

mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  handleEntityHitEvent();

  const entity = event.hitEntity;
  const attacker = event.damagingEntity;
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // gives debuff to target when PLAYER ATTACKS
  if (entity && attacker && attacker instanceof mc.Player) {
    const item = attacker.getComponent(
      "minecraft:equippable"
    ) as mc.EntityEquippableComponent;
    const weapon = item.getEquipment(mc.EquipmentSlot.Mainhand);
    if (weapon) {
      switch (weapon.typeId) {
        case "dummy:netherite_sickle":
          applyEffects(entity, `wither`, 100, 1);
          applyEffects(entity, `weakness`, 100, 0);
          break;
        case "dummy:golden_kings_excalibur":
          if (getRandomInt(10) <= 1) {
            entity.setOnFire(5);
          }
          break;
      }
    } else {
      console.warn("No weapon");
    }
  }
});

mc.system.afterEvents.scriptEventReceive.subscribe((event) => {
  const { id, message, sourceEntity } = event;
  switch (id) {
    case "dummy:excalibur_sneak": {
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;

      try {
        sneakEffect(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:double_jump": {
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        doubleJump(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:pull": {
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        pullEnemies(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:electrizard_lightning": {
      if (!sourceEntity) return;
      try {
        summonLightning(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:excalibur_charged_attack": {
      if (!sourceEntity) return;
      if (!(sourceEntity instanceof mc.Player)) return;
      try {
        excaliburChargedAttack(sourceEntity);
      } catch (e) {
        console.error(e);
      }
      break;
    }
    case "dummy:electrizard_check_cooldowns":
      if (!sourceEntity) return;
      try {
        updateCooldown(sourceEntity);
      } catch (e) {
        console.error(e);
      }

      break;
    case "dummy:electrizard_thunderwave":
      if (!sourceEntity) return;
      try {
        thunderWave(sourceEntity);
      } catch (e) {
        console.error(e);
      }

      break;
    case "dummy:electrizard_stunwave":
      if (!sourceEntity) return;
      try {
        stunWave(sourceEntity);
      } catch (e) {
        console.error(e);
      }

      break;
    case "dummy:electrizard_ground_strike":
      if (!sourceEntity) return;
      try {
        groundStrike(sourceEntity);
      } catch (e) {
        console.error(e);
      }

      break;
  }
});
mc.world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source as mc.Player;
  const item = player.getComponent(
    "minecraft:equippable"
  ) as mc.EntityEquippableComponent;
  const totem = item.getEquipment(mc.EquipmentSlot.Mainhand)?.typeId;

  if (player && totem === "dummy:thunder_totem") {
    const summonLocation = {
      x: player.location.x,
      y: player.location.y,
      z: player.location.z,
    };

    for (let i = 0; i < 5; i++) {
      mc.system.runTimeout(() => {
        mc.world
          .getDimension("overworld")
          .spawnEntity("minecraft:lightning_bolt", summonLocation);
      }, i * 20); // 1 second intervals (20 ticks)
    }

    mc.system.runTimeout(() => {
      mc.world
        .getDimension("overworld")
        .spawnEntity("dummy:electrizard", summonLocation);
    }, 5 * 20);

    player.runCommandAsync("clear @s dummy:thunder_totem 0 1");
  }
});
