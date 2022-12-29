const HARVESTER = require("contant").HARVESTER;

const getAllCreeps = () => {
  const creeps = Object.values(Game.creeps);
  return creeps;
};

const getHarvesters = () => {
  const creeps = Object.values(Game.creeps);
  const harvesters = creeps.filter((creep) => creep.memory.role === HARVESTER);
  return harvesters;
};

const getSpawnName = () => {
  return Object.keys(Game.spawns)[0];
};

const getSpawnObject = () => {
  return Object.values(Game.spawns)[0];
};

const getRoomName = () => {
  return Object.keys(Game.rooms)[0];
};

const getRoomObject = () => {
  return Object.values(Game.rooms)[0];
};

const getStructureHitPoint = () => {
  const roomName = getRoomName();
  return Game.rooms[roomName].memory.structureHitPoint;
};

const setStructureHitPoint = (hitPoint) => {
  const roomName = getRoomName();
  Game.rooms[roomName].memory.structureHitPoint = hitPoint;
};

module.exports = {
  getAllCreeps,
  getHarvesters,
  getSpawnName,
  getSpawnObject,
  getRoomName,
  getRoomObject,
  getStructureHitPoint,
  setStructureHitPoint,
};
