/**
 *
 * OK	0
 * The operation has been scheduled successfully.
 *
 * ERR_NOT_OWNER	-1
 * You are not the owner of this structure.
 *
 * ERR_NOT_ENOUGH_ENERGY	-6
 * The tower does not have enough energy.
 *
 * ERR_INVALID_TARGET	-7
 * The target is not a valid attackable object.
 *
 * ERR_RCL_NOT_ENOUGH	-14
 * Room Controller Level insufficient to use this structure.
 *
 */

const ATTACK_RESULT_TEXT = {
  0: "OK",
  "-1": "ERR_NOT_OWNER",
  "-6": "ERR_NOT_ENOUGH_ENERGY",
  "-7": "ERR_INVALID_TARGET",
  "-14": "ERR_RCL_NOT_ENOUGH",
};

const handleTowerAttack = (tower, target) => {
  console.log(`tower ${tower} is attacking`);
  console.log(`target is ${target}`);
  const attackResult = tower.attack(target);
  if (attackResult !== 0) {
    console.log("attackResult" + ATTACK_RESULT_TEXT[attackResult]);
  }
};

const roleTower = {
  run: function (tower) {
    const attackTarget = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (attackTarget) {
      handleTowerAttack(tower, attackTarget);
    }
  },
};

module.exports = roleTower;
