const { getRoomName } = require("../../room/info");
const { getSpawnObject } = require("../info");
const { getMaxTowerAmount, getNextTowerPosition } = require("./info");

const handleCreateTower = () => {
  const roomName = getRoomName();
  const MAX_TOWER_AMOUNT = getMaxTowerAmount();
  if (MAX_TOWER_AMOUNT <= 0) return;
  const towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_TOWER;
    },
  });
  const buildingTowers = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_TOWER;
    },
  });
  const currentTowerAmount = towers.length + buildingTowers.length;
  if (currentTowerAmount > MAX_TOWER_AMOUNT) return;

  const currentSpwan = getSpawnObject();
  const spawnPosition = {
    x: currentSpwan.pos.x,
    y: currentSpwan.pos.y,
  };
  const towerPosition = getNextTowerPosition(currentTowerAmount, spawnPosition);
  Game.rooms[roomName].createConstructionSite(
    towerPosition.x,
    towerPosition.y,
    STRUCTURE_TOWER
  );
};

module.exports = {
  handleCreateTower,
};
