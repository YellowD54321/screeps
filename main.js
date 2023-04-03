const {
  autoRebuildConstruction,
  showSpawningCreepName,
} = require("./utils_construction_action");
const {
  handleCreateExtensions,
} = require("./utils_construction_extension_spawn");
const {
  initialStructureHitPoint,
  getSpawnName,
  deleteAllRebuildConstructionMemory,
} = require("./utils_construction_info");
const { handleCreateTower } = require("./utils_construction_tower_spawn");
const { handleCreepMove } = require("./role_creep_action");
const { clearDeadCreepMemory, getCreepBody } = require("./utils_creep_info");
const { handleSpawnCreep } = require("./utils_creep_spawn");
const { getRoomName } = require("./utils_room_info");
const { handleTowerMove } = require("./role_construction_tower_action");

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
