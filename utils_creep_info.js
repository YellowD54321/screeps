const { MINER, HARVESTER } = require("./utils_constants");
const {
  isRpairableRampart,
  getStructureHitPoint,
  setStructureHitPoint,
  isRepairedWall,
} = require("./utils_construction_info");
const { getRoomName } = require("./utils_room_info");

const getAllCreeps = () => {
  const creeps = Object.values(Game.creeps);
  return creeps;
};

const getMiners = () => {
  const creeps = Object.values(Game.creeps);
  const miners = creeps.filter((creep) => creep.memory.role === MINER);
  return miners;
};

const getHarvesters = () => {
  const creeps = Object.values(Game.creeps);
  const harvesters = creeps.filter((creep) => creep.memory.role === HARVESTER);
  return harvesters;
};

//Clear memory of dead creeps
const clearDeadCreepMemory = () => {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }
};

const getLevelOneLaborBody = () => {
  return [WORK, CARRY, CARRY, MOVE, MOVE];
};

const getLevelTwoLaborBody = () => {
  return [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY];
};

const getLevelThreeLaborBody = () => {
  return [
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    WORK,
    WORK,
    WORK,
    CARRY,
    CARRY,
    CARRY,
  ];
};

//Determine creep's body size by extension amount.
const getCreepBody = () => {
  const roomName = getRoomName();
  const harvesters = getHarvesters();
  const MIN_AMOUNT = 1;
  if (harvesters.length <= MIN_AMOUNT) {
    return getLevelOneLaborBody();
  }
  const allExtension = Game.rooms[roomName].find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_EXTENSION;
    },
  });
  const extensionAmount = allExtension.length;
  if (extensionAmount < 5) {
    return getLevelOneLaborBody();
  }
  if (extensionAmount < 9) {
    return getLevelTwoLaborBody();
  }
  return getLevelThreeLaborBody();
};
/**
 *
 * sequence for builder
 * 1.unbuilding wall (build)
 * 2.unbuilding rampart (build)
 * 3.rampart under 5k hits (repair)
 * 4.wall under 5k hits (repair)
 * 5.unbuilding extension (build)
 */
const getNextTargetConstruct = (creep, roomName) => {
  const currentStructureHitPoint = getStructureHitPoint();
  const repairTargets = creep.room.find(FIND_STRUCTURES, {
    filter: (object) => object.hits < object.hitsMax,
  });
  const buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);
  let sortedTargets = [];

  const isAllTargetRepaired = repairTargets.every(
    (building) => building.hits >= currentStructureHitPoint
  );

  // All target's hit point is more than basic hit point.
  if (Game.time % 10 == 9) {
    if (isAllTargetRepaired) {
      setStructureHitPoint(currentStructureHitPoint + 10000);
      console.log(
        `Defence is now upgrading.\nNext HitPoint is ${Game.rooms[roomName].memory.structureHitPoint}`
      );
    }
  }

  // Build extensions
  for (const target of buildTargets) {
    if (target.structureType == "extension") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Build towers
  for (const target of buildTargets) {
    if (target.structureType === "tower") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Repair ramparts
  for (const target of repairTargets) {
    if (isRpairableRampart(target)) {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.REPAIR;
      sortedTargets[sortedTargets.length - 1].missionHits =
        currentStructureHitPoint;
    }
  }

  // Build walls
  for (const target of buildTargets) {
    if (target.structureType == "constructedWall") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Build ramparts
  for (const target of buildTargets) {
    if (target.structureType == "rampart") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Repair walls
  for (const target of repairTargets) {
    if (isRepairedWall(target)) {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].action = ACTION.REPAIR;
      sortedTargets[sortedTargets.length - 1].missionHits =
        currentStructureHitPoint;
    }
  }

  if (!sortedTargets || sortedTargets.length <= 0) {
    sortedTargets = [
      {
        id: null,
        move: null,
        missionHits: null,
      },
    ];
  }

  return sortedTargets;
};

const getTargetConstruct = (creep, roomName) => {
  if (!creep.memory.targetConstruct || !creep.memory.targetConstruct.id)
    return null;
  return creep.memory.targetConstruct;
};

const isMissionComplete = (creep) => {
  const targetConstruct = Game.getObjectById(creep.memory.targetConstruct.id);
  if (!targetConstruct) return true;

  if (creep.memory.targetConstruct.action == ACTION.BUILD) {
    return targetConstruct.progress >= creep.memory.targetConstruct.missionHits;
  }

  if (creep.memory.targetConstruct.action == ACTION.REPAIR) {
    return targetConstruct.hits >= creep.memory.targetConstruct.missionHits;
  }

  return true;
};

const hasNoTarget = (creep) => {
  if (!creep.memory.targetConstruct) return true;
  return !creep.memory.targetConstruct.id;
};

const setNextTargetConstruct = (creep, roomName) => {
  const sortedTargets = getNextTargetConstruct(creep, roomName);
  const nextTarget = sortedTargets[0];
  creep.memory.targetConstruct = nextTarget;
};

module.exports = {
  getAllCreeps,
  getMiners,
  getHarvesters,
  clearDeadCreepMemory,
  getCreepBody,
  getLevelOneLaborBody,
  getLevelTwoLaborBody,
  getLevelThreeLaborBody,
  getNextTargetConstruct,
  getTargetConstruct,
  isMissionComplete,
  hasNoTarget,
  setNextTargetConstruct,
};
