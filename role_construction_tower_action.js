const { getRoomName } = require("./utils_room_info");
const roleTower = require("./role_construction_tower_tower");

const handleTowerMove = () => {
  const roomName = getRoomName();
  const towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_TOWER;
    },
  });
  for (const tower of towers) {
    roleTower.run(tower);
  }
};

module.exports = {
  handleTowerMove,
};
