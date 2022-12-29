const { COLOR, MOVE } = require("./contant");
const { getStructureHitPoint, setStructureHitPoint } = require("./common");
const { handleHarvest } = require("./role_regular");
const roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep, room) {
    const roomName = room;
    const creepStateMachine = {
      states: {
        [MOVE.HARVEST]: {
          run: function (allCreeps) {
            handleHarvest(this, allCreeps, roomName);
          },
          transition: function (allCreeps) {
            if (this.store.getFreeCapacity() > 0) return;
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = MOVE.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.move;
            return;
          },
        },
        [MOVE.BUILD]: {
          run: function (allCreeps) {
            const targetConstruct = Game.getObjectById(
              this.memory.targetConstruct.id
            );
            if (creep.build(targetConstruct) == ERR_NOT_IN_RANGE) {
              creep.moveTo(targetConstruct, {
                visualizePathStyle: { stroke: COLOR.WORK },
              });
            }
          },
          transition: function (allCreeps) {
            const missionComplete = isMissionComplete(this);
            if (creep.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = MOVE.HARVEST;
              return;
            }
            if (!missionComplete) {
              return;
            }
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = MOVE.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.move;
          },
        },
        [MOVE.REPAIR]: {
          run: function (allCreeps) {
            const targetConstruct = Game.getObjectById(
              this.memory.targetConstruct.id
            );
            if (creep.repair(targetConstruct) == ERR_NOT_IN_RANGE) {
              creep.moveTo(targetConstruct, {
                visualizePathStyle: { stroke: COLOR.WORK },
              });
            }
          },
          transition: function (allCreeps) {
            const missionComplete = isMissionComplete(this);
            if (creep.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = MOVE.HARVEST;
              return;
            }
            if (!missionComplete) {
              return;
            }
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = MOVE.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.move;
          },
        },
        [MOVE.UPGRADE]: {
          run: function (allCreeps) {
            if (
              this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE
            ) {
              this.moveTo(this.room.controller, {
                visualizePathStyle: { stroke: COLOR.WORK },
              });
            }
          },
          transition: function (allCreeps) {
            if (creep.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = MOVE.HARVEST;
            }
          },
        },
      },
    };
    creep.memory.stateMachine = { ...creepStateMachine };
  },
};

module.exports = roleBuilder;

/**
 *
 * sequence for builder
 * 1.unbuilding wall (build)
 * 2.unbuilding rampart (build)
 * 3.rampart under 5k hits (repair)
 * 4.wall under 5k hits (repair)
 * 5.unbuilding extension (build)
 */
function getNextTargetConstruct(creep, roomName) {
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

  // Repair ramparts
  for (const target of repairTargets) {
    if (isRpairableRampart(target)) {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.REPAIR;
      sortedTargets[sortedTargets.length - 1].missionHits =
        currentStructureHitPoint;
    }
  }

  // Build towers
  for (const target of buildTargets) {
    if (target.structureType === "tower") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Build walls
  for (const target of buildTargets) {
    if (target.structureType == "constructedWall") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Build ramparts
  for (const target of buildTargets) {
    if (target.structureType == "rampart") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
    }
  }

  // Repair walls
  for (const target of repairTargets) {
    if (isRepairedWall(target)) {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.REPAIR;
      sortedTargets[sortedTargets.length - 1].missionHits =
        currentStructureHitPoint;
    }
  }

  // Build extensions
  for (const target of buildTargets) {
    if (target.structureType == "extension") {
      sortedTargets.push(target);
      sortedTargets[sortedTargets.length - 1].move = MOVE.BUILD;
      sortedTargets[sortedTargets.length - 1].missionHits =
        target.progressTotal;
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
}

function setNextTargetConstruct(creep, roomName) {
  const sortedTargets = getNextTargetConstruct(creep, roomName);
  const nextTarget = sortedTargets[0];
  creep.memory.targetConstruct = nextTarget;
}

function getTargetConstruct(creep, roomName) {
  if (!creep.memory.targetConstruct || !creep.memory.targetConstruct.id)
    return null;
  return creep.memory.targetConstruct;
}

function isMissionComplete(creep) {
  const targetConstruct = Game.getObjectById(creep.memory.targetConstruct.id);
  if (!targetConstruct) return true;

  if (creep.memory.targetConstruct.move == MOVE.BUILD) {
    return targetConstruct.progress >= creep.memory.targetConstruct.missionHits;
  }

  if (creep.memory.targetConstruct.move == MOVE.REPAIR) {
    return targetConstruct.hits >= creep.memory.targetConstruct.missionHits;
  }

  return true;
}

function hasNoTarget(creep) {
  if (!creep.memory.targetConstruct) return true;
  return !creep.memory.targetConstruct.id;
}

function isRpairableRampart(target) {
  const currentStructureHitPoint = getStructureHitPoint();
  return (
    target.structureType === "rampart" && target.hits < currentStructureHitPoint
  );
}

function isRepairedWall(target) {
  const currentStructureHitPoint = getStructureHitPoint();
  return (
    target.structureType === "constructedWall" &&
    target.hits < currentStructureHitPoint
  );
}
