import * as mc from "@minecraft/server";

let stunwaveCooldown = new Map<string, number>();
let groundStrikeCooldown = new Map<string, number>();
let thunderwaveCooldown = new Map<string, number>();

mc.system.runInterval(() => {
  stunwaveCooldown.forEach((time, entityId) => {
    if (time > 0) {
      stunwaveCooldown.set(entityId, time - 1);
    }
  });
  groundStrikeCooldown.forEach((time, entityId) => {
    if (time > 0) {
      stunwaveCooldown.set(entityId, time - 1);
    }
  });
  thunderwaveCooldown.forEach((time, entityId) => {
    if (time > 0) {
      stunwaveCooldown.set(entityId, time - 1);
    }
  });
}, 1);

function isPlayerNearby(entity: mc.Entity, maxDistance: number): boolean {
  const players = mc.world.getDimension("overworld").getPlayers({
    location: entity.location,
    maxDistance: maxDistance,
  });
  return players.length > 0;
}

// stronger tnt simulation - check json minecraft:explosion
// function explode(entity: mc.Entity, radius: number) {
//   const dimension = mc.world.getDimension("overworld");
//   const location = entity.location;
//   for (let x = -radius; x <= radius; x++) {
//     for (let y = -radius; y <= radius; y++) {
//       for (let z = -radius; z <= radius; z++) {
//         const blockLocation = {
//           x: location.x + x,
//           y: location.y + y,
//           z: location.z + z,
//         };
//         const distance = Math.sqrt(x * x + y * y + z * z);
//         if (distance <= radius) {
//           const block = dimension.getBlock(blockLocation);
//           if (block) {
//             dimension.runCommandAsync(
//               `setblock ${blockLocation.x} ${blockLocation.y} ${blockLocation.z} air`
//             );
//           }
//         }
//       }
//     }
//   }
//   dimension.runCommandAsync(
//     `playsound random.explode ${location.x} ${location.y} ${location.z}`
//   );
// }
function applyEffectsAndDamage(
  entities: mc.Entity[],
  effects: { name: string; duration: number; amplifier: number }[],
  damage: number
) {
  entities.forEach((entity) => {
    effects.forEach((effect) => {
      const effectType = mc.EffectTypes.get(effect.name);
      if (effectType) {
        entity.addEffect(effectType, effect.duration * 20, {
          amplifier: effect.amplifier,
          showParticles: false,
        });
      }
    });
    if (damage > 0) {
      entity.runCommandAsync(`damage @s ${damage}`);
    }
  });
}

export function updateCooldown(entity: mc.Entity) {
  const currentStunwaveCooldown = stunwaveCooldown.get(entity.id) || 0;
  const currentGroundStrikeCooldown = groundStrikeCooldown.get(entity.id) || 0;
  const currentThunderwaveCooldown = thunderwaveCooldown.get(entity.id) || 0;
  entity.runCommandAsync(`/say cooldown checked`);
  if (currentStunwaveCooldown <= 0) {
    entity.setProperty("dummy:stunwave_on_cooldown", false);
  } else {
    entity.setProperty("dummy:stunwave_on_cooldown", true);
  }
  if (currentGroundStrikeCooldown <= 0) {
    entity.setProperty("dummy:ground_strike_on_cooldown", false);
  } else {
    entity.setProperty("dummy:ground_strike_on_cooldown", true);
  }
  if (currentThunderwaveCooldown <= 0) {
    entity.setProperty("dummy:thunderwave_on_cooldown", false);
  } else {
    entity.setProperty("dummy:thunderwave_on_cooldown", true);
  }
}
export function groundStrike(entity: mc.Entity) {
  if (!isPlayerNearby(entity, 30)) return;
  const entityId = entity.id;
  const currentCooldown = groundStrikeCooldown.get(entityId) || 0;
  if (currentCooldown <= 0) {
    const entities = mc.world.getDimension("overworld").getEntities({
      location: entity.location,
      maxDistance: 6,
      excludeTypes: ["electrizard", "boss"],
    });
    applyEffectsAndDamage(
      entities,
      [{ name: "weakness", duration: 5, amplifier: 255 }],
      18
    );
    applyEffectsAndDamage(
      entities,
      [{ name: "slowness", duration: 5, amplifier: 255 }],
      0
    );
    entity.runCommandAsync("/summon dummy:electrizard_ground_strike");
    groundStrikeCooldown.set(entityId, 30 * 20);
    entity.setProperty("dummy:ground_strike_on_cooldown", true);
  }
}

export function stunWave(entity: mc.Entity) {
  if (!isPlayerNearby(entity, 20)) return;
  const forwardDirection = entity.getViewDirection();
  const entityId = entity.id;
  const currentCooldown = stunwaveCooldown.get(entityId) || 0;
  entity.runCommandAsync(`/say stunwave cooldown: ${currentCooldown}`);
  if (currentCooldown <= 0) {
    entity.runCommandAsync("/say casted stunwave");
    const entities = mc.world.getDimension("overworld").getEntities({
      location: {
        x: entity.location.x + forwardDirection.x * 20,
        y: entity.location.y + forwardDirection.y * 20,
        z: entity.location.z + forwardDirection.z * 20,
      },
      maxDistance: 20,
      excludeTypes: ["electrizard", "boss"],
    });
    applyEffectsAndDamage(
      entities,
      [{ name: "weakness", duration: 12, amplifier: 255 }],
      0
    );
    applyEffectsAndDamage(
      entities,
      [{ name: "slowness", duration: 5, amplifier: 255 }],
      0
    );
    stunwaveCooldown.set(entityId, 40 * 20);
    entity.setProperty("dummy:stunwave_on_cooldown", true);
  }
}

export function thunderWave(entity: mc.Entity) {
  if (!isPlayerNearby(entity, 30)) return;
  const entityId = entity.id;
  const currentCooldown = thunderwaveCooldown.get(entityId) || 0;
  if (currentCooldown <= 0) {
    entity.runCommandAsync("/say casted thunderwave");
    mc.system.runTimeout(() => {
      const entities = mc.world.getDimension("overworld").getEntities({
        location: entity.location,
        maxDistance: 30,
        excludeTypes: ["electrizard", "boss"],
      });
      applyEffectsAndDamage(
        entities,
        [{ name: "weakness", duration: 5, amplifier: 1 }],
        18
      );
      applyEffectsAndDamage(
        entities,
        [{ name: "slowness", duration: 5, amplifier: 255 }],
        0
      );
      entity.runCommandAsync("/summon dummy:electrizard_thunderwave");
      thunderwaveCooldown.set(entityId, 50 * 20);
      entity.setProperty("dummy:thunderwave_on_cooldown", true);
    }, 60); // 3 seconds (60 ticks)
  }
}
