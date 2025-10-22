# Rusty Justice - Cyber-Western Blackjack Roguelike

## 🎮 Game Overview

Rusty Justice is a fast-paced, single-player blackjack roguelike where chips are your health and every bet could be your last. Battle through 6 unique AI bosses in high-stakes card games with a custom cyber-western deck and progressive betting system.

### Current Features (Full Release Candidate)
- ✅ **Complete 6-boss campaign** with unique abilities and behaviors
- ✅ **Custom cyber-western deck** with ⚙☀⚡💀 suits and 0-10 ranks
- ✅ **Progressive betting system** (minimum bet = round number)
- ✅ **Dynamic boss mechanics** with varied stay/bust thresholds
- ✅ **Sidearm system** - One-time use bonus card per round
- ✅ **All-in mechanics** for low-chip strategic play
- ✅ **Enhanced damage system** (bust = both bets as damage)
- ✅ **Scene progression** with intermission and victory screens
- ✅ **Retro cyber-western UI** with terminal aesthetic

## 🚀 Quick Start

### Requirements
- Modern web browser (Chrome, Firefox, Safari)
- Python 3.x (for local server) or VS Code with Live Server extension

### How to Run
1. Clone or download this repository
2. Start a local server:
   ```bash
   python3 -m http.server 8001
   ```
3. Open browser to `http://localhost:8001`
4. Select character and start your run!

## 🎯 How to Play

### Basic Rules
1. **Chips = Life**: Your chips are your HP. Bet wisely!
2. **Progressive Betting**: Minimum bet equals round number (Round 5 = min 5 chips)
3. **Custom Deck**: 44 cards with ranks 0-10 in four cyber-western suits
4. **Boss Campaign**: Fight through 6 unique bosses to win

### The Deck System
**Suits & Colors:**
- ⚙ **Green (Gear)** - Tech/machinery theme
- ☀ **Orange (Sun)** - Desert wasteland theme  
- ⚡ **Purple (Lightning)** - Cyber power theme
- 💀 **Black (Skull)** - Death/wasteland theme

**Card Values:**
- **0-10**: Simple numeric values (no Aces, no face cards)
- **Zero cards**: Can't bust with them - strategic tools!
- **44 total cards** (11 per suit)

### Betting System
- **Round 1**: Bet 1-6 chips
- **Round 3**: Bet 3-6 chips  
- **Round 5**: Bet 5-6 chips
- **Low chips**: Must go all-in if chips < round number
- **Boss bets**: Always equal to round number

### Combat Mechanics
1. **Player Turn**: Hit, Stay, or Use Sidearm
2. **Boss Turn**: AI plays based on unique stay numbers
3. **Damage**: Winner deals damage equal to their bet
4. **Bust Penalty**: Take damage from BOTH bets (yours + opponent's)
5. **Victory**: Reduce boss HP to 0

### Sidearm System
- Each round you get a face-up "Sidearm" card
- Use once per round instead of hitting from deck
- Strategic option when you need specific values
- Resets each round with new card

## 👾 Boss Campaign

Fight through 6 unique bosses, each with different abilities:

1. **Slugjaw** (21 HP)
   - *Desert Mirage*: Force player to discard highest card
   - Stays at 17, busts at 21

2. **Circuit Saint** (21 HP)  
   - *Surge*: Can reach 22 without busting
   - Stays at 18, busts at 22

3. **Pit King** (21 HP)
   - *Gladiator's Gambit*: Double damage on natural 21
   - Stays at 19, busts at 23

4. **Queen Scylla** (21 HP)
   - *Swarm*: Draws 2 cards at start  
   - Stays at 17, busts at 22

5. **The Proxy** (21 HP)
   - *Mirror*: Copies player's last action
   - Stays at 16, busts at 21

6. **SLUG PRIME** (21 HP)
   - *Override*: Can change one card value by ±1
   - Stays at 20, busts at 24

## 📁 Project Structure
```
/rusty-justice/
├── index.html              # Main game entry point
├── main.js                 # Phaser game configuration
├── /scenes/
│   ├── BootScene.js        # Game initialization
│   ├── StartScene.js       # Main menu
│   ├── CharacterSelectScene.js # Character selection
│   ├── GameScene.js        # Core blackjack gameplay
│   ├── IntermissionScene.js # Between-boss progression
│   ├── RunCompleteScene.js # Victory celebration
│   └── GameOverScene.js    # Defeat screen
├── /managers/
│   ├── GameManager.js      # Boss progression & game state
│   └── BattleManager.js    # Battle mechanics & round logic
├── /objects/
│   ├── Player.js           # Player with sidearm system
│   ├── Boss.js             # AI boss with custom behaviors
│   └── Deck.js             # Custom cyber-western deck
└── /utils/
    └── BlackjackLogic.js   # Core card game rules
```

## 🎨 Visual Style & Future Enhancements

### Current Aesthetic
- Cyber-western terminal theme
- Green matrix colors (#00ff41)
- Retro monospace fonts (Courier New)
- Functional button-based UI

### Sprite Implementation Roadmap
To upgrade to professional card game visuals:

1. **Card Sprites**: Create 44 individual card images with cyber-western designs
2. **Animation System**: Card dealing, flipping, and effect animations  
3. **Table Layout**: Green felt background with defined card areas
4. **UI Polish**: Replace text buttons with styled graphics
5. **Boss Themes**: Unique visual styles per boss encounter

**Technical Approach for Sprites:**
```javascript
// Load card assets
this.load.image('card_5_gear', 'assets/cards/card_5_gear.png');

// Create card sprite instead of text
const cardSprite = this.add.image(x, y, 'card_5_gear');
cardSprite.setScale(0.8);

// Add animations
this.tweens.add({
    targets: cardSprite,
    x: finalX,
    y: finalY,
    duration: 500,
    ease: 'Power2'
});
```

## 🎨 Card Sprite System (Implemented!)

### Current Implementation
- ✅ **Hybrid card display**: Cards show as sprites when available, text fallback otherwise
- ✅ **Smart positioning**: Player cards at bottom, boss cards at top, centered spread
- ✅ **Automatic detection**: System checks for sprite availability per card
- ✅ **Proper scaling**: Cards sized appropriately for gameplay (0.25 scale)

### Cards Currently Available as Sprites
- **💀 Black/Skull suit**: Complete set (0-10) - 11 cards
- **⚙ Green/Gear suit**: Partial set (0, 1, 10) - 3 cards  
- **☀ Orange/Sun suit**: Coming soon
- **⚡ Purple/Lightning suit**: Coming soon

### Adding New Card Sprites
1. Create PNG files following naming convention: `black5.png`, `green7.png`, etc.
2. Place in `/assets/cards/` directory
3. Add to preload function in `scenes/GameScene.js`
4. Cards automatically appear as sprites when dealt

### Technical Implementation
- **Preload system**: Hardcoded loading of existing cards
- **Fallback system**: Text display for cards without sprites
- **Position calculation**: Dynamic centering and spreading
- **Memory management**: Sprites destroyed and recreated each hand

## 🔮 Completed Features

### Major Systems Implemented
- ✅ Complete boss progression campaign (6 bosses)
- ✅ Custom deck with cyber-western themes  
- ✅ Progressive betting with all-in mechanics
- ✅ Enhanced damage system for strategic depth
- ✅ Scene flow with intermissions and victory
- ✅ Boss abilities framework (ready for implementation)
- ✅ Round-based progression tracking
- ✅ Card sprite system with hybrid display

### Technical Achievements  
- ✅ Modular architecture with clean separation
- ✅ Dynamic script loading with error handling
- ✅ Comprehensive game state management
- ✅ Extensible boss and card systems
- ✅ Professional code organization

## 🐛 Known Issues
- Debug logging active in betting system (for tuning)
- 33 cards still need sprite artwork (14 implemented, 30 remaining)

## 🎯 Current Status

**Version**: Release Candidate 1.1  
**Engine**: Phaser 3.70.0  
**Completeness**: Fully playable campaign with partial sprite system  
**Next Phase**: Complete card sprite artwork (30 cards remaining)  
**Sprite System**: ✅ Implemented and working

Rusty Justice has evolved from MVP to a complete cyber-western blackjack roguelike with unique mechanics, progressive difficulty, and a full boss campaign. The foundation is solid for visual enhancements and additional content!