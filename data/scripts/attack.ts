import * as mc from "@minecraft/server";


mc.world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
  const attacker = damageSource.damagingEntity;
  if (damageSource.cause != mc.EntityDamageCause.entityAttack || !(attacker instanceof mc.Player)){
    return;
  }
   
  hurtEntity.runCommand(`say ouch`);
  hurtEntity.addEffect(`levitation`, 40);
});