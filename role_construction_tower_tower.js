const {
  handleTowerAttack,
} = require("./utils_construction_tower_action");

const roleTower = {
  run: function (tower) {
    const attackTarget = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (attackTarget) {
      handleTowerAttack(tower, attackTarget);
    }
  },
};

module.exports = roleTower;
