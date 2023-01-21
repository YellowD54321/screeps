const roleHarvester = require("./role_harvester");
const roleBuilder = require("./role_builder");
const roleTower = require("./role_tower");
const { HARVESTER, BUILDER, ACTION } = require("contant");
const {
  getAllCreeps,
  getHarvesters,
  getSpawnName,
  getSpawnObject,
  getRoomName,
  getRoomObject,
  getStructureHitPoint,
  setStructureHitPoint,
} = require("common");
const INIT_STATE = "HARVEST";

initialMemory();

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

function autoRebuildConstruction() {
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
}

function deleteAllRebuildConstructionMemory(roomName) {
  Game.rooms[roomName].memory.constructions = [];
}

function deleteRebuildConstructionMemory(roomName, x, y) {
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
}

function initialMemory() {
  initialStructureHitPoint();
}

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

//Clear memory of dead creeps
function clearDeadCreepMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }
}

//Determine creep's body size by extension amount.
function getCreepBody() {
  const roomName = getRoomName();
  const harvesters = getHarvesters();
  const MIN_AMOUNT = 1;
  if (harvesters.length <= MIN_AMOUNT) {
    return getLevelOneLaborBody();
  }
  const allExtension = Game.rooms[roomName].find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_EXTENSION;
    },
  });
  const extensionAmount = allExtension.length;
  if (extensionAmount < 5) {
    return getLevelOneLaborBody();
  }
  if (extensionAmount < 9) {
    return getLevelTwoLaborBody();
  }
  return getLevelThreeLaborBody();
}

function getLevelOneLaborBody() {
  return [WORK, CARRY, CARRY, MOVE, MOVE];
}

function getLevelTwoLaborBody() {
  return [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY];
}

function getLevelThreeLaborBody() {
  return [
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    WORK,
    WORK,
    WORK,
    CARRY,
    CARRY,
    CARRY,
  ];
}

/**
 *
 * @param {String} spawnName
 * @param {String} creepName
 * @param {Array} creepBody
 * @param {Object} initMemory other memory data
 * OK	0
 * The operation has been scheduled successfully.
 *
 * ERR_NOT_OWNER	-1
 * You are not the owner of this spawn.
 *
 * ERR_NAME_EXISTS	-3
 * There is a creep with the same name already.
 *
 * ERR_BUSY	-4
 * The spawn is already in process of spawning another creep.
 *
 * ERR_NOT_ENOUGH_ENERGY	-6
 * The spawn and its extensions contain not enough energy to create a creep with the given body.
 *
 * ERR_INVALID_ARGS	-10
 * Body is not properly described or name was not provided.
 *
 * ERR_RCL_NOT_ENOUGH	-14
 * Your Room Controller level is insufficient to use this spawn.
 */
function spawnCreep({ spawnName, creepName, creepBody, memory }) {
  const result = Game.spawns[spawnName].spawnCreep(creepBody, creepName, {
    memory,
  });
}

function spawnHarvester(spawnName, creepBody) {
  const creepName = "Harvester" + Game.time;
  const memory = {
    role: HARVESTER,
    state: INIT_STATE,
    stateMachine: null,
    sourceHarvesting: {
      sourceId: null,
      sourceNumber: null,
    },
  };
  spawnCreep({ spawnName, creepName, creepBody, memory });
}

function spawnBuilder(spawnName, creepBody) {
  const creepName = "Builder" + Game.time;
  const memory = {
    role: BUILDER,
    state: INIT_STATE,
    stateMachine: null,
    sourceHarvesting: {
      sourceId: null,
      sourceNumber: null,
    },
    targetConstruct: {
      id: null,
      buildOrRepair: null,
      missionHits: null,
    },
  };
  spawnCreep({ spawnName, creepName, creepBody, memory });
}

function handleSpawnCreep(spawnName, creepBody) {
  const harvesters = getHarvesters();
  const creeps = getAllCreeps();
  const MAX_AMOUNT = 9;
  if (creeps.length >= MAX_AMOUNT) return;
  if (harvesters.length < 5) {
    return spawnHarvester(spawnName, creepBody);
  }
  return spawnBuilder(spawnName, creepBody);
}

function showSpawningCreepName(spawnName) {
  if (!Game.spawns[spawnName].spawning) return;
  const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
  Game.spawns[spawnName].room.visual.text(
    "🛠️" + spawningCreep.memory.role,
    Game.spawns[spawnName].pos.x + 1,
    Game.spawns[spawnName].pos.y,
    { align: "left", opacity: 0.8 }
  );
}

function handleCreepMove() {
  const roomName = getRoomName();
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    console.log("creep", creep);
    console.log("creep.memory.state", creep.memory.state);
    if (!creep.memory.state) {
      console.log("initialize creep state.");
      creep.memory.state = INIT_STATE;
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
}

function handleTowerMove() {
  const roomName = getRoomName();
  const towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_TOWER;
    },
  });
  for (const tower of towers) {
    roleTower.run(tower);
  }
}

function isValidPosition(targetX, targetY) {
  const roomName = getRoomName();
  const targetPositionItems = Game.rooms[roomName].lookAt(targetX, targetY);

  const isTerrainAvailable = targetPositionItems.some(
    (item) =>
      item.type === "terrain" &&
      (item.terrain === "plain" || item.terrain === "swamp")
  );
  const hasConstructure = targetPositionItems.some(
    (item) => item.type === "constructionSite" || item.type === "structure"
  );
  const isValid = hasConstructure || !isTerrainAvailable;

  if (isValid) {
    return false;
  }
  return true;
}

function getNextExtensionPosition(existAmount, originPosition) {
  const floorNumber = Math.floor(existAmount / 4);
  let extensionX = floorNumber + 1;
  let extensionY = floorNumber + 1;

  if (floorNumber % 2 === 0) {
    if (existAmount % 2 === 0) {
      extensionX = 0;
    }
    if (existAmount % 2 === 1) {
      extensionY = 0;
    }
  }

  switch (existAmount % 4) {
    case 0:
      extensionX *= -1;
      break;
    case 1:
      // both number are positive
      break;
    case 2:
      extensionY *= -1;
      break;
    case 3:
      extensionX *= -1;
      extensionY *= -1;
      break;
    default:
    // both number are positive
  }

  let targetX = originPosition.x + extensionX;
  let targetY = originPosition.y + extensionY;

  if (!isValidPosition(targetX, targetY)) {
    const validPosition = getNextExtensionPosition(
      existAmount + 1,
      originPosition
    );
    targetX = validPosition.x;
    targetY = validPosition.y;
  }

  return {
    x: targetX,
    y: targetY,
  };
}

function handleCreateExtensions() {
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
}

function getMaxTowerAmount() {
  const roomName = getRoomName();
  const RCL = Game.rooms[roomName].controller.level;
  if (RCL >= 8) {
    return 6;
  }
  if (RCL >= 7) {
    return 3;
  }
  if (RCL >= 5) {
    return 2;
  }
  if (RCL >= 3) {
    return 1;
  }
  return 0;
}

function getNextTowerPosition(towerAmount, originPosition) {
  const ONE_ROUND_NUMBER = 4;
  const currentRoundNumber = Math.ceil(towerAmount / ONE_ROUND_NUMBER);
  let dx = currentRoundNumber;
  let dy = currentRoundNumber;

  switch (towerAmount % 4) {
    case 0:
      // both number are positive
      break;
    case 1:
      dx *= -1;
      break;
    case 2:
      dx *= -1;
      dy *= -1;
      break;
    case 3:
      dy *= -1;
      break;
    default:
    // both number are positive
  }

  let targetX = originPosition.x + dx;
  let targetY = originPosition.y + dy;

  if (!isValidPosition(targetX, targetY)) {
    const validPosition = getNextTowerPosition(towerAmount + 1, originPosition);
    targetX = validPosition.x;
    targetY = validPosition.y;
  }

  return {
    x: targetX,
    y: targetY,
  };
}

function handleCreateTower() {
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
}
