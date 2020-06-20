
class Personality {

    constructor(name, soldierEagerness, preferredUpgrades) {
        this.name = name;
        this.soldierEagerness = soldierEagerness;
        this.preferredUpgrades = preferredUpgrades;
    }

    getSoldierEagerness() {
        return this.preferredUpgrades.length ? this.soldierEagerness : 1;
    }

    copy() {
        return new AiPersonality(
            this.soldierEagerness,
            this.preferredUpgrades.slice(),
        );
    }
}