const { isValidPosition } = require("../../room/info");

const getNextExtensionPosition = (existAmount, originPosition) => {
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
};

module.exports = {
  getNextExtensionPosition,
};
