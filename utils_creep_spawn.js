const { MINER, INIT_STATE, HARVESTER, BUILDER } = require("./utils_constants");
const { getHarvesters, getMiners, getAllCreeps } = require("./utils_creep_info");

/**
 *
 * @param {String} spawnName
 * @param {String} creepName
 * @param {Array} creepBody
 * @param {Object} initMemory other memory data
 * OK	0
 * The operation has been scheduled successfully.
 *
 * ERR_NOT_OWNER	-1
 * You are not the owner of this spawn.
 *
 * ERR_NAME_EXISTS	-3
 * There is a creep with the same name already.
 *
 * ERR_BUSY	-4
 * The spawn is already in process of spawning another creep.
 *
 * ERR_NOT_ENOUGH_ENERGY	-6
 * The spawn and its extensions contain not enough energy to create a creep with the given body.
 *
 * ERR_INVALID_ARGS	-10
 * Body is not properly described or name was not provided.
 *
 * ERR_RCL_NOT_ENOUGH	-14
 * Your Room Controller level is insufficient to use this spawn.
 */
function spawnCreep({ spawnName, creepName, creepBody, memory }) {
  const result = Game.spawns[spawnName].spawnCreep(creepBody, creepName, {
    memory,
  });
}

function spawnMiner(spawnName, creepBody) {
  const creepName = "Miner" + Game.time;
  const memory = {
    role: MINER,
    state: INIT_STATE,
    stateMachine: null,
    sourceHarvesting: {
      sourceId: null,
      sourceNumber: null,
    },
  };
  spawnCreep({ spawnName, creepName, creepBody, memory });
}

function spawnHarvester(spawnName, creepBody) {
  const creepName = "Harvester" + Game.time;
  const memory = {
    role: HARVESTER,
    state: INIT_STATE,
    stateMachine: null,
    sourceHarvesting: {
      sourceId: null,
      sourceNumber: null,
    },
  };
  spawnCreep({ spawnName, creepName, creepBody, memory });
}

function spawnBuilder(spawnName, creepBody) {
  const creepName = "Builder" + Game.time;
  const memory = {
    role: BUILDER,
    state: INIT_STATE,
    stateMachine: null,
    sourceHarvesting: {
      sourceId: null,
      sourceNumber: null,
    },
    targetConstruct: {
      id: null,
      buildOrRepair: null,
      missionHits: null,
    },
  };
  spawnCreep({ spawnName, creepName, creepBody, memory });
}

function handleSpawnCreep(spawnName, creepBody) {
  const harvesters = getHarvesters();
  const miners = getMiners();
  const creeps = getAllCreeps();
  const MAX_AMOUNT = 9;
  if (miners.length < 1) {
    return spawnMiner(spawnName, creepBody);
  }
  if (creeps.length >= MAX_AMOUNT) return;
  if (harvesters.length < 5) {
    return spawnHarvester(spawnName, creepBody);
  }
  return spawnBuilder(spawnName, creepBody);
}

module.exports = {
  spawnCreep,
  spawnMiner,
  spawnHarvester,
  spawnBuilder,
  handleSpawnCreep,
};
