import * as mc from "@minecraft/server";

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

export function handleEntityHitEvent() {
  mc.world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const entityHurt = event.hitEntity;

    if (attacker && attacker.typeId === "dummy:abyssal_anarchnid") {
      try {
        applyEffects(entityHurt, `wither`, 5, 1);
      } catch (error) {
        console.error(`Failed to deal damage: ${error}`);
      }
    }
  });
}
