class Boss {
    constructor(scene, startingHP, bustNumber = 21, stayNumber = 17) {
        this.scene = scene;
        this.hp = startingHP;
        this.maxHP = startingHP;
        this.hand = [];
        this.currentBet = 15;
        this.name = "Boss";
        this.bustNumber = bustNumber; // Custom bust threshold!
        this.stayNumber = stayNumber; // When boss stops hitting
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
        return handValue < this.stayNumber; // Use stay number instead!
    }
    
    isBust() {
        const handValue = this.blackjackLogic.calculateHandValue(this.hand);
        return handValue > this.bustNumber; // Custom bust check!
    }
}