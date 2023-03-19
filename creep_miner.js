const { ACTION } = require("contant");
const { handleHarvest } = require("role_regular");

const roleMiner = {
  /**
   * @param {Creep} creep
   */
  run: function (creep, room) {
    const roomName = room;

    const creepStateMachine = {
      states: {
        [ACTION.HARVEST]: {
          run: function (allCreeps) {
            handleHarvest(this, allCreeps, roomName);
          },
          transition: function (allCreeps) {
            return;
          },
        },
      },
    };

    creep.memory.stateMachine = { ...creepStateMachine };
  },
};

module.exports = roleMiner;
