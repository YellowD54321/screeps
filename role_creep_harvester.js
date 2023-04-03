const { COLOR, ACTION } = require("./utils_constants");
const { handleHarvest } = require("./role_creep_regular");

const roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep, room) {
    const roomName = room;
    const feedTarget = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType === STRUCTURE_TOWER ||
            structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });

    const creepStateMachine = {
      states: {
        [ACTION.HARVEST]: {
          run: function (allCreeps) {
            handleHarvest(this, allCreeps, roomName);
          },
          transition: function (allCreeps) {
            if (this.store.getFreeCapacity() == 0) {
              this.memory.state = ACTION.FEED;
            }
          },
        },
        [ACTION.FEED]: {
          run: function (allCreeps) {
            if (
              this.transfer(feedTarget[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
            ) {
              this.moveTo(feedTarget[0], {
                visualizePathStyle: { stroke: COLOR.WORK },
              });
            }
          },
          transition: function (allCreeps) {
            if (this.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = ACTION.HARVEST;
              return ACTION.HARVEST;
            }
            if (feedTarget.length <= 0) {
              this.memory.state = ACTION.UPGRADE;
              return ACTION.UPGRADE;
            }
          },
        },
        [ACTION.UPGRADE]: {
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
            if (this.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = ACTION.HARVEST;
            }
          },
        },
      },
    };
    creep.memory.stateMachine = { ...creepStateMachine };
  },
};

module.exports = roleHarvester;
