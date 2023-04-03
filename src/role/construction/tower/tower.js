const {
  handleTowerAttack,
} = require("../../../utils/construction/tower/action");

const roleTower = {
  run: function (tower) {
    const attackTarget = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (attackTarget) {
      handleTowerAttack(tower, attackTarget);
    }
  },
};

module.exports = roleTower;
