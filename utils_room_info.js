const getRoomName = () => {
  return Object.keys(Game.rooms)[0];
};

const getRoomObject = () => {
  return Object.values(Game.rooms)[0];
};

const isValidPosition = (targetX, targetY) => {
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
};

module.exports = {
  getRoomName,
  getRoomObject,
  isValidPosition,
};
