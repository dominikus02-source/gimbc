# IMPLEMENTATION_PLAN.md — Phased Development

## Phase 0 — Foundation and Governance
**Status:** Current phase

**Objective:** Establish repository structure, documentation, team workflow, and governance so two engineers can work independently without conflicts.

**Dependencies:** None.

**Exit Criteria:**
- [x] Repository created
- [ ] All Phase 0 documentation complete (CONTEXT, GAME_DESIGN, ARCHITECTURE, WORLD_DESIGN, IMPLEMENTATION_PLAN, AGENTS, TEAM_WORKFLOW, README)
- [ ] Team workflow agreed upon
- [ ] No application code yet

---

## Phase 1 — 3D Technical Prototype

**Objective:** Prove the 3D stack works. Render a basic scene with a controllable avatar.

**Dependencies:** Phase 0 complete.

**Exit Criteria:**
- Next.js app with React Three Fiber renders a 3D scene
- Basic camera follows player
- One avatar model loads (GLB/GLTF)
- WASD / touch movement works
- Basic collision with ground plane

---

## Phase 2 — Bahasa Village Blockout

**Objective:** Build a rough 3D blockout of Bahasa Village with placeholder geometry.

**Dependencies:** Phase 1 complete.

**Exit Criteria:**
- All conceptual zones represented with blockout geometry
- Player can walk between zones
- Zone boundaries are clear
- Performance is acceptable on mobile web

---

## Phase 3 — Avatar + NPC + Interaction

**Objective:** Add NPCs to the world with dialogue and interaction systems.

**Dependencies:** Phase 2 complete.

**Exit Criteria:**
- Multiple NPC models placed in world
- Player can approach and interact with NPCs
- NPC dialogue system works
- Basic animation (idle, walk) on avatar and NPCs

---

## Phase 4 — Quest + Challenge + Rewards

**Objective:** Implement the core gameplay loop: quests, challenges, rewards.

**Dependencies:** Phase 3 complete.

**Exit Criteria:**
- Quest system tracks active/completed quests
- Challenge system presents Bahasa Indonesia questions
- XP and coins awarded on completion
- Basic progression gates work

---

## Phase 5 — Persistence

**Objective:** Save player progress to Supabase.

**Dependencies:** Phase 4 complete.

**Exit Criteria:**
- Player profile stored in Supabase
- Quest progress persists across sessions
- Inventory persists
- Authentication works (even if basic)

---

## Phase 6 — Multiplayer Instances

**Objective:** Multiple players share a world instance.

**Dependencies:** Phase 5 complete.

**Exit Criteria:**
- Maximum 30 concurrent players total in one instance
- Player positions sync via Supabase Realtime
- Basic instance management (join/leave)
- No major desync issues

---

## Phase 7 — Learning Integration

**Objective:** Deep integration with Bahasa Indonesia curriculum.

**Dependencies:** Phase 6 complete.

**Exit Criteria:**
- Question bank connected to curriculum
- Adaptive difficulty
- Learning analytics (basic)
- NPC dialogue reflects player progress

---

## Phase 8 — Premium Beta

**Objective:** Introduce premium features for beta testing.

**Dependencies:** Phase 7 complete.

**Exit Criteria:**
- Premium cosmetic items available
- Premium area access (World Gate opens)
- Billing integration (conceptual, not production)
- Beta feedback collection
