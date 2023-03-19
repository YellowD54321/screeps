const { COLOR } = require("./contant");
function handleHarvest(creep, allCreeps, room) {
  const sources = creep.room.find(FIND_SOURCES);
  if (!!creep.memory.sourceHarvesting.sourceId) {
    sourceHarvestTarget = sources.find(
      (source) => source.id == creep.memory.sourceHarvesting.sourceId
    );
  } else {
    const terrain = new Room.Terrain(room);
    var arraySources = [];
    var sourceHarvestTarget = {};
    for (const key in sources) {
      arraySources.push(sources[key]);
    }
    arraySources.sort();
    //check how many wall around the source.
    for (const [key, sourceBody] of Object.entries(arraySources)) {
      sourceBody.wallAmountAroundSources = 0;
      sourceBody.spaceAroundSources = 0;
      for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
          if (x === 0 && y === 0) {
            continue;
          }
          //if resault equels 1, it is a wall.
          if (terrain.get(sourceBody.pos.x + x, sourceBody.pos.y + y) === 1) {
            sourceBody.wallAmountAroundSources++;
          }
        }
      }
      sourceBody.spaceAroundSources = 8 - sourceBody.wallAmountAroundSources;
      sourceBody.creepsWorkAroundSource = 0;
    }
    for (const [creepKey, creepBody] of Object.entries(allCreeps)) {
      for (const [sourceKey, sourceBody] of Object.entries(arraySources)) {
        if (creepBody.memory.sourceHarvesting.sourceNumber === sourceKey) {
          sourceBody.creepsWorkAroundSource++;
        }
      }
    }

    for (const [sourceKey, sourceBody] of Object.entries(arraySources)) {
      if (sourceBody.creepsWorkAroundSource < sourceBody.spaceAroundSources) {
        sourceHarvestTarget = sourceBody;
        creep.memory.sourceHarvesting.sourceId = sourceBody.id;
        creep.memory.sourceHarvesting.sourceNumber = sourceKey;
        break;
      }
    }
    //check if some creep lost and doesn't have source target.
    if (
      !sourceHarvestTarget ||
      !creep.memory.sourceHarvesting.sourceId ||
      !creep.memory.sourceHarvesting.sourceNumber
    ) {
      sourceHarvestTarget = arraySources[arraySources.length - 1];
      creep.memory.sourceHarvesting.sourceId =
        arraySources[arraySources.length - 1].id;
      creep.memory.sourceHarvesting.sourceNumber = arraySources.length - 1;
    }
  }
  if (creep.harvest(sourceHarvestTarget) == ERR_NOT_IN_RANGE) {
    creep.moveTo(sourceHarvestTarget, {
      visualizePathStyle: { stroke: COLOR.HARVEST },
    });
  }
}

module.exports = { handleHarvest };
