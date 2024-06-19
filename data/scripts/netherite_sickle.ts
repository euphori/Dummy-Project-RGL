import * as mc from "@minecraft/server";

export const doubleJump = (player: mc.Player) => {
  player.applyKnockback(0, 0, 0, 1);
};

function getDirectionVectors(player: mc.Player) {
  const viewDirection = player.getViewDirection();
  const frontVector = {
    x: viewDirection.x,
    y: 0,
    z: viewDirection.z,
  };
  const backVector = {
    x: -viewDirection.x,
    y: 0,
    z: -viewDirection.z,
  };
  return { frontVector, backVector };
}

function getDirectionToPlayer(player: mc.Player, entity: mc.Entity) {
  const playerPos = player.location;
  const entityPos = entity.location;

  // Calculate the direction vector from the entity to the player
  return {
    x: playerPos.x - entityPos.x,
    y: playerPos.y - entityPos.y,
    z: playerPos.z - entityPos.z,
  };
}

function normalizeVector(vector: { x: number; y: number; z: number }) {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function pullEntity(player: mc.Player, entity: mc.Entity, pullStrength) {
  const direction = getDirectionToPlayer(player, entity);
  const normalizedDirection = normalizeVector(direction);

  // Apply a velocity to the entity towards the player

  entity.applyImpulse({
    x: normalizedDirection.x * pullStrength,
    y: normalizedDirection.y * pullStrength,
    z: normalizedDirection.z * pullStrength,
  });
}

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

let cooldown = new Map<string, number>();

mc.world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source as mc.Player;
  const playerId = player.typeId;
  const item = player.getComponent(
    "minecraft:equippable"
  ) as mc.EntityEquippableComponent;
  const weaponId = item.getEquipment(mc.EquipmentSlot.Mainhand)?.typeId;
  const currentCooldown = cooldown.get(playerId) || 0;
  if (weaponId && weaponId == "dummy:netherite_sickle") {
    if (currentCooldown <= 0) {
      pullEnemies(player);
      cooldown.set(playerId, 3 * 20);
    }
  }
});

mc.system.afterEvents.scriptEventReceive.subscribe((event) => {
  const player = event.sourceEntity as mc.Player;
  const playerId = player.typeId;
  if (player && event.id === "dummy:sickle_check_cooldown") {
    const currentCooldown = cooldown.get(playerId) || 0;
    //sets the cooldown property when this skill is used
    if (currentCooldown <= 0) {
      player.setProperty("dummy:sickle_on_cooldown", false);
    } else {
      player.runCommandAsync(`say Ability is on cooldown!`);
      player.setProperty("dummy:sickle_on_cooldown", true);
    }

    console.error(`cd checked ${currentCooldown}`);
  }
});

export function pullEnemies(player: mc.Player) {
  const { frontVector, backVector } = getDirectionVectors(player);
  const entities = mc.world.getDimension("overworld").getEntities({
    location: player.location,
    maxDistance: 5,
    excludeTypes: ["player"],
  });

  function dealDamage(entity: mc.Entity, amount: number) {
    try {
      entity.runCommandAsync(`damage @s ${amount}`);
    } catch (error) {
      console.error(`Failed to deal damage: ${error}`);
    }
  }
  mc.system.runTimeout(() => {
    entities.forEach((entity) => {
      const entityPos = entity.location;
      const playerPos = player.location;
      const directionToEntity = {
        x: entityPos.x - playerPos.x,
        y: entityPos.y - playerPos.y,
        z: entityPos.z - playerPos.z,
      };

      // Calculate the dot product to check if the entity is in front or back of the player - not necessary
      const dotFront =
        directionToEntity.x * frontVector.x +
        directionToEntity.z * frontVector.z;
      const dotBack =
        directionToEntity.x * backVector.x + directionToEntity.z * backVector.z;
      const pullStrength = 2.0;
      // Apply the impulse if the entity is in front or back of the player
      if (dotFront > 0 || dotBack > 0) {
        pullEntity(player, entity, pullStrength);
        applyEffects(entity, `wither`, 5, 1);
        applyEffects(entity, `weakness`, 5, 0);
        dealDamage(entity, 15);
      }
    });
  }, 20);
}

mc.system.runInterval(() => {
  cooldown.forEach((time, playerId) => {
    if (time > 0) {
      cooldown.set(playerId, time - 1);
    }
  });
}, 1);
