const { HARVESTER, MINER } = require("./contant");

const getAllCreeps = () => {
  const creeps = Object.values(Game.creeps);
  return creeps;
};

const getMiners = () => {
  const creeps = Object.values(Game.creeps);
  const miners = creeps.filter((creep) => creep.memory.role === MINER);
  return miners;
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
  getMiners,
  getHarvesters,
  getSpawnName,
  getSpawnObject,
  getRoomName,
  getRoomObject,
  getStructureHitPoint,
  setStructureHitPoint,
};
