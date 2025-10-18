class Boss {
    constructor(scene, startingHP) {
        this.scene = scene;
        this.hp = startingHP;
        this.maxHP = startingHP;
        this.hand = [];
        this.currentBet = 15;
        this.name = "Iron Mike";
        // Create blackjack logic instance for this boss
        this.blackjackLogic = new BlackjackLogic();
    }

    addCard(card) {
        this.hand.push(card);
    }

    clearHand() {
        this.hand = [];
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    shouldHit() {
        const handValue = this.blackjackLogic.calculateHandValue(this.hand);
        return handValue < 17;
    }
}