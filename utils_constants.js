const HARVESTER = "harvester";
const BUILDER = "builder";
const MINER = "miner";

const COLOR = {
  WORK: "#ffaa00",
  HARVEST: "#ffffff",
};

const ACTION = {
  IDLE: "IDLE",
  HARVEST: "HARVEST",
  FEED: "FEED",
  UPGRADE: "UPGRADE",
  BUILD: "BUILD",
  REPAIR: "REPAIR",
  ATTACK: "ATTACK",
};

const INIT_STATE = "HARVEST";

module.exports = { HARVESTER, BUILDER, MINER, COLOR, ACTION, INIT_STATE };
