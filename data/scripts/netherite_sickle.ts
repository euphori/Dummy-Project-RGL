import * as mc from "@minecraft/server";


export const doubleJump = (player: mc.Player) => {

    player.applyKnockback(0, 0, 0, 1);
}


