import * as mc from "@minecraft/server";

function applyEffects(
  entity: mc.Entity,
  effect_name: string,
  duration,
  amplifier
) {
  const effect = mc.EffectTypes.get(effect_name);
  entity.runCommandAsync(`say {$effect}`);
  if (!effect) {
    console.error(`Effect ${effect_name} not found`);
    return;
  }
  const effectOptions: mc.EntityEffectOptions = {
    amplifier: amplifier,
  };

  entity.addEffect(effect, duration * 20, effectOptions);
}

function dealDamage(entity: mc.Entity, amount: number) {
  try {
    entity.runCommandAsync(`damage @s ${amount}`);
  } catch (error) {
    console.error(`Failed to deal damage: ${error}`);
  }
}

export function excaliburChargedAttack(player: mc.Player) {
  const entities = mc.world.getDimension("overworld").getEntities({
    location: player.location,
    maxDistance: 5,
    excludeTypes: ["player"],
  });

  //adds delay
  mc.system.runTimeout(() => {
    entities.forEach((entity) => {
      applyEffects(entity, `weakness`, 5, 2);
      applyEffects(entity, `slowness`, 5, 2);
      dealDamage(entity, 10);
      entity.setOnFire(5);
    });
  }, 20);
}

function summonLightKnightSwords(player: mc.Player, chargeTime: number) {
  const swordCount =
    chargeTime >= 60 ? 5 : chargeTime >= 40 ? 3 : chargeTime >= 20 ? 1 : 0;
  const attackDamage = chargeTime >= 60 ? 32 : chargeTime >= 40 ? 16 : 8;
  const entities = mc.world.getDimension("overworld").getEntities({
    location: player.location,
    maxDistance: 5,
    excludeTypes: ["player", "light_sword"],
  });
  if (swordCount > 0) {
    for (let i = 0; i < swordCount; i++) {
      const swordLocation = {
        x: player.location.x + (Math.random() - 0.5) * 3,
        y: player.location.y + 5,
        z: player.location.z + (Math.random() - 0.5) * 3,
      };

      mc.world
        .getDimension("overworld")
        .spawnEntity("dummy:light_knight_sword", swordLocation);
    }
    mc.system.runTimeout(() => {
      entities.forEach((entity) => {
        applyEffects(entity, `burn`, 5, 1);
        applyEffects(entity, `slowness`, 10, 3);
        applyEffects(entity, `weakness`, 10, 3);
        dealDamage(entity, attackDamage);
      });
    }, 20);
  }
}

mc.world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source as mc.Player;
  const item = player.getComponent(
    "minecraft:equippable"
  ) as mc.EntityEquippableComponent;
  const weaponId = item.getEquipment(mc.EquipmentSlot.Mainhand)?.typeId;
  if (weaponId && weaponId == "dummy:golden_kings_excalibur") {
    chargeStartTime.set(player.id, mc.system.currentTick);
    player.runCommandAsync(`say Charging started`);
  }
});

mc.world.afterEvents.itemReleaseUse.subscribe((event) => {
  const player = event.source as mc.Player;

  const item = player.getComponent(
    "minecraft:equippable"
  ) as mc.EntityEquippableComponent;
  const weaponId = item.getEquipment(mc.EquipmentSlot.Mainhand)?.typeId;
  if (player && weaponId && weaponId == "dummy:golden_kings_excalibur") {
    const playerId = player.id;
    const currentCooldown = cooldown.get(playerId) || 0;
    if (currentCooldown <= 0) {
      const startTime = chargeStartTime.get(player.id);
      const chargeTime =
        mc.system.currentTick - (startTime ?? mc.system.currentTick);
      summonLightKnightSwords(player, chargeTime);
      cooldown.set(playerId, 5 * 20); // 5 seconds cooldown in ticks
      player.runCommandAsync(`say Charged for ${chargeTime / 20} seconds`);
    }
    chargeStartTime.delete(player.id);
  }
});

// cooldown attempt -WORKING!
let cooldown = new Map<string, number>();
// charge timer
let chargeStartTime = new Map<string, number>();

//charge time still not working
mc.system.afterEvents.scriptEventReceive.subscribe((event) => {
  const player = event.sourceEntity as mc.Player;
  const playerId = player.id;

  // can be directly triggered with item use

  //   if (player && event.id === "dummy:excalibur_charged_attack") {
  //     const currentCooldown = cooldown.get(playerId) || 0;
  //     if (currentCooldown <= 0) {
  //       const chargeTime = player.getProperty("dummy:charge_time") as number;
  //       if (chargeTime !== undefined) {
  //         console.error(`Charge time  ${chargeTime}`);
  //         summonLightKnightSwords(player, 5);
  //         cooldown.set(playerId, 5 * 20); // 5 seconds cooldown in ticks
  //       } else {
  //         console.error(`Attribute component not found on player ${playerId}`);
  //       }
  //     } else {
  //       player.runCommandAsync(`say Ability is on cooldown!`);
  //     }
  //   }
  if (player && event.id === "dummy:excalibur_check_cooldown") {
    const currentCooldown = cooldown.get(playerId) || 0;
    //sets the cooldown property when this skill is used
    if (currentCooldown <= 0) {
      player.setProperty("dummy:excalibur_on_cooldown", false);
    } else {
      player.runCommandAsync(`say Ability is on cooldown!`);
      player.setProperty("dummy:excalibur_on_cooldown", true);
    }

    console.error(`cd checked ${currentCooldown}`);
  }
});

mc.system.runInterval(() => {
  cooldown.forEach((time, playerId) => {
    if (time > 0) {
      cooldown.set(playerId, time - 1);
    }
  });
}, 1); // Run every tick (20 times per second)

// SNEAK EFFECT
const sneakCooldown = new Map<string, number>();
export const sneakEffect = (player: mc.Player) => {
  const playerId = player.typeId;

  const currentCooldown = sneakCooldown.get(playerId) || 0;
  if (currentCooldown <= 0) {
    applyEffects(player, `strength`, 8, 4);
    applyEffects(player, `health_boost`, 8, 9);
    sneakCooldown.set(playerId, 10 * 20);
  }
};

mc.system.runInterval(() => {
  sneakCooldown.forEach((time, playerId) => {
    if (time > 0) {
      sneakCooldown.set(playerId, time - 1);
    }
  });
}, 1);
