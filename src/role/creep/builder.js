const { ACTION } = require("../../utils/constants");
const {
  hasNoTarget,
  setNextTargetConstruct,
} = require("../../utils/creep/info");
const { handleHarvest } = require("./regular");

const roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep, room) {
    const roomName = room;
    const creepStateMachine = {
      states: {
        [ACTION.HARVEST]: {
          run: function (allCreeps) {
            handleHarvest(this, allCreeps, roomName);
          },
          transition: function (allCreeps) {
            if (this.store.getFreeCapacity() > 0) return;
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = ACTION.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.action;
            return;
          },
        },
        [ACTION.BUILD]: {
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
              this.memory.state = ACTION.HARVEST;
              return;
            }
            if (!missionComplete) {
              return;
            }
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = ACTION.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.action;
          },
        },
        [ACTION.REPAIR]: {
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
              this.memory.state = ACTION.HARVEST;
              return;
            }
            if (!missionComplete) {
              return;
            }
            setNextTargetConstruct(this, roomName);
            if (hasNoTarget(this)) {
              this.memory.state = ACTION.UPGRADE;
              return;
            }
            this.memory.state = this.memory.targetConstruct.action;
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
            if (creep.store[RESOURCE_ENERGY] == 0) {
              this.memory.state = ACTION.HARVEST;
            }
          },
        },
      },
    };
    creep.memory.stateMachine = { ...creepStateMachine };
  },
};

module.exports = roleBuilder;
