# GAME_DESIGN.md — Initial Game Design

## Core Entities

### Player
A user who enters Bahasa World. Each player has an avatar, inventory, XP, coins, and quest progress.

### Avatar
The visual representation of a player in the 3D world. Customizable appearance. Moves, interacts, and explores.

### NPC (Non-Player Character)
Characters placed in the world who give quests, provide hints, tell stories, or present challenges. Each NPC has dialogue and a role in the world.

### Quest
A task or series of tasks assigned by an NPC. Quests guide the player through the world and introduce challenges progressively.

### Challenge
A learning activity the player must complete. Initially: answer questions about Bahasa Indonesia. Challenges are tied to quests and NPCs.

### Monster
Obstacles or enemies in the world. Encountering a monster triggers a challenge. Defeating a monster yields rewards.

## Progression Systems

### XP (Experience Points)
Earned by completing challenges and quests. XP drives level progression.

### Coins
Currency earned through gameplay. Used for cosmetic items or future premium features.

### Progression
Players unlock new areas, quests, and challenges as they level up. Progression is persistent.

## Gameplay Systems

### Exploration
Moving through the 3D world, discovering areas, finding NPCs, and locating secrets. Exploration should feel rewarding and dense (points of interest every ~15–30 seconds).

### Rewards
Completing challenges and quests grants XP, coins, and potentially cosmetic items. Rewards reinforce the learning loop.

### Multiplayer Instance
Maximum 30 concurrent players total per instance. Seeing other players explore and interact adds life to the world.

## Core Gameplay Loop (Detailed)

1. **Enter World** — Player spawns in Bahasa Village.
2. **Explore** — Walk around, discover areas, find NPCs.
3. **Meet NPC** — NPC introduces a quest or challenge.
4. **Discover Challenge** — Player enters a challenge zone or encounters a monster.
5. **Answer** — Player answers Bahasa Indonesia questions.
6. **Receive Reward** — XP, coins, or items granted.
7. **Progress** — Player levels up, unlocks new areas or quests.
8. **Explore Again** — Loop continues.

## Future Premium Mechanics

Premium features are explicitly **out of scope for Phase 0–7**. Documented here only as a placeholder:
- Cosmetic items
- Exclusive areas
- Boosted XP (conceptual only)
- Subscription tiers (conceptual only)

## MVP Scope

For the initial MVP, mechanics are intentionally minimal:
- One world (Bahasa Village)
- One avatar per player
- Basic movement and interaction
- NPC dialogue
- Simple question-based challenges
- XP and coin tracking
- Basic quest progression
