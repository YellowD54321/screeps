const { getRoomName, isValidPosition } = require("../../room/info");

const getMaxTowerAmount = () => {
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
};

const getNextTowerPosition = (towerAmount, originPosition) => {
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
};

module.exports = {
  getMaxTowerAmount,
  getNextTowerPosition,
};
