class BlackjackLogic {
    calculateHandValue(hand) {
        let value = 0;

        for (let card of hand) {
            // All cards are now simple numeric values 0-10
            value += parseInt(card.rank);
        }

        return value;
    }

    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }

    isBust(hand) {
        return this.calculateHandValue(hand) > 21;
    }

    compareHands(hand1, hand2) {
        const value1 = this.calculateHandValue(hand1);
        const value2 = this.calculateHandValue(hand2);
        
        const bust1 = value1 > 21;
        const bust2 = value2 > 21;
        
        if (bust1 && bust2) return 0;
        if (bust1) return -1;
        if (bust2) return 1;
        
        if (value1 > value2) return 1;
        if (value2 > value1) return -1;
        return 0;
    }
}