class Deck {
    constructor() {
        this.cards = [];
        this.createDeck();
        this.shuffle();
    }

    createDeck() {
        const suits = [
            { symbol: '⚙', color: '#00ff00', name: 'gear' },    // Green - tech/machinery
            { symbol: '☀', color: '#ff8800', name: 'sun' },     // Orange - desert
            { symbol: '⚡', color: '#cc00ff', name: 'bolt' },    // Purple - cyber power
            { symbol: '💀', color: '#000000', name: 'skull' }   // Black - wasteland
        ];
        const ranks = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        
        this.cards = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push({ 
                    suit: suit.symbol, 
                    color: suit.color,
                    suitName: suit.name,
                    rank 
                });
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard() {
        if (this.cards.length === 0) {
            this.createDeck();
            this.shuffle();
        }
        return this.cards.pop();
    }
}