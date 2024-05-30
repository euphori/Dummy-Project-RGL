import * as mc from "@minecraft/server";

mc.system.runInterval(() => {
  mc.world.getAllPlayers().forEach((player) => {
  player.runCommandAsync(`say ${player.getProperty("dummy:atk_state")}`);
  });
}, mc.TicksPerSecond);