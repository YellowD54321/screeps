const { getRoomName } = require("../room/info");

const getSpawnName = () => {
  return Object.keys(Game.spawns)[0];
};

const getSpawnObject = () => {
  return Object.values(Game.spawns)[0];
};

const getStructureHitPoint = () => {
  const roomName = getRoomName();
  return Game.rooms[roomName].memory.structureHitPoint;
};

const setStructureHitPoint = (hitPoint) => {
  const roomName = getRoomName();
  Game.rooms[roomName].memory.structureHitPoint = hitPoint;
};

const deleteAllRebuildConstructionMemory = (roomName) => {
  Game.rooms[roomName].memory.constructions = [];
};

const deleteRebuildConstructionMemory = (roomName, x, y) => {
  var structureAtPositionIndex = Game.rooms[
    roomName
  ].memory.constructions.findIndex(
    (build) => !!build && build.x == x && build.y == y
  );
  if (structureAtPositionIndex < 0) {
    console.log(
      `deleteRebuildConstructionMemory fail. There is no memory at this position. x = ${x}, y = ${y}.`
    );
    return false;
  }
  Game.rooms[roomName].memory.constructions.splice(structureAtPositionIndex, 1);
  console.log("deleteRebuildConstructionMemory finish.");
};

function initialStructureHitPoint() {
  const STRUCTURE_BASIC_HIT_POINT = 50000;
  const currentStructureHitPoint = getStructureHitPoint();

  if (
    !currentStructureHitPoint ||
    currentStructureHitPoint < STRUCTURE_BASIC_HIT_POINT
  ) {
    setStructureHitPoint(STRUCTURE_BASIC_HIT_POINT);
  }
}

const isRpairableRampart = (target) => {
  const currentStructureHitPoint = getStructureHitPoint();
  return (
    target.structureType === "rampart" && target.hits < currentStructureHitPoint
  );
};

const isRepairedWall = (target) => {
  const currentStructureHitPoint = getStructureHitPoint();
  return (
    target.structureType === "constructedWall" &&
    target.hits < currentStructureHitPoint
  );
};

module.exports = {
  getSpawnName,
  getSpawnObject,
  getStructureHitPoint,
  setStructureHitPoint,
  deleteAllRebuildConstructionMemory,
  deleteRebuildConstructionMemory,
  initialStructureHitPoint,
  isRpairableRampart,
  isRepairedWall,
};
