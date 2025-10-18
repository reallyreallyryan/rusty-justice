class BlackjackLogic {
    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else if (['J', 'Q', 'K'].includes(card.rank)) {
                value += 10;
            } else {
                value += parseInt(card.rank);
            }
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
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