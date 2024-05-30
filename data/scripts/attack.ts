import * as mc from "@minecraft/server";

interface AttackData {
  d: number;
  radius: number;
  damage: number;
}

export const handleAttack = (attacker: mc.Player, message: string) => {
  const data = JSON.parse(message) as AttackData;
  attack(attacker, data.d, data.damage, data.radius);
};

const attack = (
  attacker: mc.Player,
  d: number,
  damage: number,
  radius: number
) => {
  const view = attacker.getViewDirection();
  view.y = 0;
  view.x *= d;
  view.z *= d;
  const location = {
    x: attacker.location.x + view.x,
    y: attacker.location.y + view.y,
    z: attacker.location.z + view.z,
  };
  const entities = mc.world.getDimension(attacker.dimension.id).getEntities({
    location: location,
    minDistance: 0,
    maxDistance: radius,
    families: ["mob"],
  });
  const players = mc.world
    .getDimension(attacker.dimension.id)
    .getPlayers({
      location: location,
      minDistance: 0,
      maxDistance: radius,
    })
    .filter((player) => player !== attacker);
  const targets = [...entities, ...players];

  let strengthAmp = attacker.getEffect("strength")?.amplifier;
  let weaknessAmp = attacker.getEffect("weakness")?.amplifier;
  if (strengthAmp !== undefined) strengthAmp += 1;
  if (weaknessAmp !== undefined) weaknessAmp += 1;

  const newDamage = calculateDamage(damage, strengthAmp, weaknessAmp);

  targets.forEach((target) => {
    target.applyDamage(newDamage, {
      cause: mc.EntityDamageCause.contact,
      damagingEntity: attacker,
    });
  });
};

const calculateDamageStrength = (baseDamage: number, level: number) => {
  return baseDamage * Math.pow(1.3, level) + (Math.pow(1.3, level) - 1) / 0.3;
};

const calculateDamageWeakness = (baseDamage: number, level: number) => {
  return baseDamage * Math.pow(0.8, level) + (Math.pow(0.8, level) - 1) / 0.4;
};

const calculateDamage = (
  baseDamage: number,
  strengthAmp?: number,
  weaknessAmp?: number
) => {
  let damage = baseDamage;
  if (strengthAmp) {
    damage = calculateDamageStrength(damage, strengthAmp);
  }
  if (weaknessAmp) {
    damage = calculateDamageWeakness(damage, weaknessAmp);
  }
  return damage;
};
