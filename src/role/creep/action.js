const { getRoomName } = require("../../utils/room/info");
const {
  INIT_STATE,
  MINER,
  HARVESTER,
  BUILDER,
} = require("../../utils/constants");
const roleBuilder = require("./builder");
const roleHarvester = require("./harvester");
const roleMiner = require("./miner");

const handleCreepMove = () => {
  const roomName = getRoomName();
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (!creep.memory.state) {
      creep.memory.state = INIT_STATE;
    }

    if (creep.memory.role == MINER) {
      roleMiner.run(creep, roomName);
    }
    if (creep.memory.role == HARVESTER) {
      roleHarvester.run(creep, roomName);
    }
    if (creep.memory.role == BUILDER) {
      roleBuilder.run(creep, roomName);
    }
    const currentState = creep.memory.state;
    creep.memory.stateMachine.states[currentState].run.call(creep, Game.creeps);
    creep.memory.stateMachine.states[currentState].transition.call(
      creep,
      Game.creeps
    );
  }
};

module.exports = { handleCreepMove };
