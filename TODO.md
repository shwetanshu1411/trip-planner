# AI Trip Planner Fixes TODO

## Phase 1: Dependency & Core Fixes
- Update package.json with correct deps
- npm install
- Fix src/lib/gemini.ts (Gemini SDK)
- Replace motion/react → framer-motion across files

## Phase 2: Import & Type Fixes
- Update src/App.tsx (motion, types)
- Fix server.ts import
- Update LoadingItinerary.tsx & other motion files

## Phase 3: Cleanup & Polish
- Remove/replace console.logs
- Test end-to-end
- Create .env.example

## Phase 4: Completion
- npm run dev success
- Generate test trip
