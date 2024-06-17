import * as mc from "@minecraft/server";



export const summonLightning = (entity: mc.Entity)=>{

    summonRandomLightning(entity)
}


function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    if(Math.floor(Math.random() * (max - min + 1)) + min == 0){
        return 1
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
    
}
  

  function summonRandomLightning(entity: mc.Entity) {
    const offsetX = getRandomInt(-10, 10);
    const offsetZ = getRandomInt(-10, 10);
    const lightningPos: mc.Vector3 = {
      x: entity.location.x + offsetX,
      y: entity.location.y,
      z: entity.location.z + offsetZ
    };
  
    entity.dimension.spawnEntity("minecraft:lightning_bolt", lightningPos);
  }
  