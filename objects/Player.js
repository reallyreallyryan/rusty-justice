class Player {
    constructor(scene, startingHP) {
        this.scene = scene;
        this.hp = startingHP;
        this.maxHP = startingHP;
        this.hand = [];
        this.sidearm = null;
        this.sidearmUsed = false;
    }

    addCard(card) {
        this.hand.push(card);
    }

    clearHand() {
        this.hand = [];
    }

    setSidearm(card) {
        this.sidearm = card;
        this.sidearmUsed = false;
    }

    useSidearm() {
        if (this.sidearm && !this.sidearmUsed) {
            this.hand.push(this.sidearm);
            this.sidearmUsed = true;
            return this.sidearm;
        }
        return null;
    }

    clearSidearm() {
        this.sidearm = null;
        this.sidearmUsed = false;
    }

    hasSidearmAvailable() {
        return this.sidearm && !this.sidearmUsed;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    heal(amount) {
        this.hp = Math.min(this.maxHP, this.hp + amount);
    }
}