import * as mc from "@minecraft/server";


export const doubleJump = (player: mc.Player) => {

    player.applyKnockback(0, 0, 0, 1);
}

function getDirectionVectors(player: mc.Player) {
    const viewDirection = player.getViewDirection();
    const frontVector = {
        x: viewDirection.x,
        y: 0,
        z: viewDirection.z
    };
    const backVector = {
        x: -viewDirection.x,
        y: 0,
        z: -viewDirection.z
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
        z: playerPos.z - entityPos.z
    };
}

function normalizeVector(vector: { x: number, y: number, z: number }) {
    const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length
    };
}

function pullEntity(player: mc.Player, entity: mc.Entity, pullStrength) {
    const direction = getDirectionToPlayer(player, entity);
    const normalizedDirection = normalizeVector(direction);

    // Apply a velocity to the entity towards the player
    
    entity.applyImpulse({
        x: normalizedDirection.x * pullStrength,
        y: normalizedDirection.y * pullStrength,
        z: normalizedDirection.z * pullStrength
    });
}


export function pullEnemies(player: mc.Player) {
    
    const { frontVector, backVector } = getDirectionVectors(player);
    const entities = mc.world.getDimension("overworld").getEntities({
        location: player.location,
        maxDistance: 10, 
        excludeTypes: ["player"]
    });

    mc.system.runTimeout(() => {
        entities.forEach((entity) => {
            const entityPos = entity.location;
            const playerPos = player.location;
            const directionToEntity = {
                x: entityPos.x - playerPos.x,
                y: entityPos.y - playerPos.y,
                z: entityPos.z - playerPos.z
            };

              // Calculate the dot product to check if the entity is in front or back of the player
              const dotFront = directionToEntity.x * frontVector.x + directionToEntity.z * frontVector.z;
              const dotBack = directionToEntity.x * backVector.x + directionToEntity.z * backVector.z;
              const pullStrength = 2.0;
              // Apply the impulse if the entity is in front or back of the player
              if (dotFront > 0 || dotBack > 0) {
                  pullEntity(player, entity, pullStrength);
              }
        });
    }, 20);
    
}
