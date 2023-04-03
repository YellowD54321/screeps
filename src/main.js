const {
  autoRebuildConstruction,
  showSpawningCreepName,
} = require("./utils/construction/action");
const {
  handleCreateExtensions,
} = require("./utils/construction/extension/spawn");
const {
  initialStructureHitPoint,
  getSpawnName,
  deleteAllRebuildConstructionMemory,
} = require("./utils/construction/info");
const { handleCreateTower } = require("./utils/construction/tower/spawn");
const { handleCreepMove } = require("./role/creep/action");
const { clearDeadCreepMemory, getCreepBody } = require("./utils/creep/info");
const { handleSpawnCreep } = require("./utils/creep/spawn");
const { getRoomName } = require("./utils/room/info");
const { handleTowerMove } = require("./role/construction/tower/action");

initialStructureHitPoint();

module.exports.loop = function () {
  clearDeadCreepMemory();
  const spawnName = getSpawnName();

  if (!spawnName) {
    return sonsole.log("We don't have any spawn base bro. GAME OVER.");
  }

  // Check is there some structure or construction missing.
  if (Game.time % 10 == 9) {
    autoRebuildConstruction();
  }

  // Spawn creeps.
  const creepBody = getCreepBody();
  handleSpawnCreep(spawnName, creepBody);
  showSpawningCreepName(spawnName);

  // Run every creep
  handleCreepMove();

  // Create extensions
  handleCreateExtensions();

  // Create Tower
  handleCreateTower();

  // Run every tower
  handleTowerMove();

  deleteAllRebuildConstructionMemory(getRoomName());
};
