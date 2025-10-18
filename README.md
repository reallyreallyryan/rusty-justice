# Rusty Justice - Blackjack Roguelike MVP

## 🎮 Game Overview

Rusty Justice is a fast-paced, single-player blackjack-inspired roguelike where chips are your health and every bet could be your last. Face off against AI bosses in high-stakes blackjack battles with a cyber-western twist.

### Current Features (MVP V1)
- ✅ Full blackjack mechanics (hit, stay, bust logic)
- ✅ HP system tied to betting chips
- ✅ AI boss with configurable behavior (hits on <17)
- ✅ Damage system based on winning bets
- ✅ **NEW: Sidearm mechanic** - One-time use bonus card per round
- ✅ Win/lose conditions
- ✅ Retro-futuristic UI with green terminal aesthetic

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
4. Click "DEAL" to start playing!

## 🎯 How to Play

### Basic Rules
1. **Betting = Life**: Your chips are your HP. Bet wisely!
2. **Deal**: Start each round by placing a bet (5-100 chips)
3. **Player Turn**: Choose:
   - **HIT**: Draw from deck
   - **USE SIDEARM**: Use your one-time bonus card (NEW!)
   - **STAY**: End your turn
4. **Boss Turn**: AI automatically plays (hits on <17)
5. **Damage**: Winner deals damage equal to their bet
6. **Bust Penalty**: Busting costs your bet + 10 extra damage
7. **Victory**: Reduce boss HP to 0 to win!

### Sidearm Mechanic (NEW!)
- Each round, you get a face-up "Sidearm" card
- Use it once per round instead of hitting from deck
- Strategic option when you need a specific card value
- Resets each round with a new card

## 📁 Project Structure
```
/rusty-justice/
├── index.html          # Main game file with debugging
├── test-simple.html    # Phaser CDN test file
├── main.js            # Game configuration
├── /scenes/
│   ├── BootScene.js   # Initialization scene
│   └── GameScene.js   # Main game logic
├── /objects/
│   ├── Player.js      # Player class with sidearm support
│   ├── Boss.js        # AI boss class
│   └── Deck.js        # Card deck management
└── /utils/
    └── BlackjackLogic.js  # Blackjack rules engine
```

## 📋 Today's Progress Summary

### What We Accomplished
1. **Built Complete MVP from Scratch**
   - Set up Phaser 3 game engine
   - Created full project structure
   - Implemented all core blackjack mechanics
   - Added betting and damage systems
   - Created retro-cyber UI

2. **Fixed Critical Issues**
   - Resolved blank screen bug (script loading order)
   - Added comprehensive error handling
   - Fixed Phaser initialization sequence
   - Added debug output for troubleshooting

3. **Implemented Sidearm Feature**
   - Extended Player class with sidearm properties
   - Added yellow "USE SIDEARM" button to UI
   - Created sidearm display showing card and status
   - Integrated sidearm logic with game flow

### Technical Improvements Made
- Dynamic script loading to ensure proper initialization order
- Debug panel for real-time loading feedback
- Proper button state management
- Clean separation of concerns (objects, scenes, utils)

## 🔮 Future Enhancements (Post-MVP)

From the original brief, these features are planned:
- Multiple boss encounters (6 unique bosses)
- Status effects and skill cards
- Advanced animations and effects
- Audio and music
- Mobile-responsive UI
- Save/load functionality
- Multiplayer support

## 🐛 Known Issues
- None currently! Game is fully playable.

## 🎨 Visual Style
- Cyber-western aesthetic
- Green terminal colors (#00ff41)
- Retro monospace fonts (Courier New)
- Minimal, functional UI design

---

**Version**: MVP V1  
**Engine**: Phaser 3.70.0  
**Last Updated**: Today  
**Status**: Fully Playable with Sidearm Mechanic!