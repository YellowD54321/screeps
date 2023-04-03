const { getRoomName } = require("../room/info");

const showSpawningCreepName = (spawnName) => {
  if (!Game.spawns[spawnName].spawning) return;
  const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
  Game.spawns[spawnName].room.visual.text(
    "🛠️" + spawningCreep.memory.role,
    Game.spawns[spawnName].pos.x + 1,
    Game.spawns[spawnName].pos.y,
    { align: "left", opacity: 0.8 }
  );
};

const autoRebuildConstruction = () => {
  const roomName = getRoomName();
  var allStructure = Game.rooms[roomName].find(FIND_STRUCTURES);
  var allConstruction = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES);
  var allWeNeedToBuild = [];
  if (!Game.rooms[roomName].memory.constructions) {
    Game.rooms[roomName].memory.constructions = [];
  }
  for (var key in allStructure) {
    if (!allStructure[key]) {
      continue;
    }
    allWeNeedToBuild.push(allStructure[key]);
  }
  for (var key in allConstruction) {
    if (!allConstruction[key]) {
      continue;
    }
    allWeNeedToBuild.push(allConstruction[key]);
  }
  for (var key in allWeNeedToBuild) {
    if (!allWeNeedToBuild[key]) {
      continue;
    }
    var x = allWeNeedToBuild[key].pos.x;
    var y = allWeNeedToBuild[key].pos.y;
    var includeInMemory = Game.rooms[roomName].memory.constructions.find(
      (build) => !!build && build.x == x && build.y == y
    );
    if (!includeInMemory) {
      Game.rooms[roomName].memory.constructions.push({
        id: allWeNeedToBuild[key].id,
        type: allWeNeedToBuild[key].structureType,
        x: x,
        y: y,
      });
    }
  }
  for (var [key, construction] of Object.entries(
    Game.rooms[roomName].memory.constructions
  )) {
    if (!construction) {
      continue;
    }
    var buildingIsExist = allStructure.find(
      (build) =>
        !!build &&
        build.pos.x == construction.x &&
        build.pos.y == construction.y
    );
    if (!buildingIsExist) {
      var building;
      building = Game.rooms[roomName].createConstructionSite(
        construction.x,
        construction.y,
        construction.type
      );
    }
  }
};

module.exports = {
  showSpawningCreepName,
  autoRebuildConstruction,
};
