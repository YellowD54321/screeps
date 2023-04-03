const { getRoomName } = require("./utils_room_info");
const { getSpawnObject } = require("./utils_construction_info");
const { getNextExtensionPosition } = require("./utils_construction_extension_info");

const handleCreateExtensions = () => {
  const roomName = getRoomName();
  const currentSpwan = getSpawnObject();
  const spawnPosition = {
    x: currentSpwan.pos.x,
    y: currentSpwan.pos.y,
  };
  const extensions = Game.rooms[roomName].find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_EXTENSION;
    },
  });
  const buildingExtensions = Game.rooms[roomName].find(
    FIND_CONSTRUCTION_SITES,
    {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_EXTENSION;
      },
    }
  );

  const extensionAmount = extensions.length + buildingExtensions.length;

  const nextPosition = getNextExtensionPosition(extensionAmount, spawnPosition);

  Game.rooms[roomName].createConstructionSite(
    nextPosition.x,
    nextPosition.y,
    STRUCTURE_EXTENSION
  );
};

module.exports = {
  handleCreateExtensions,
};
