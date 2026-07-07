# greenbotz-task-two NPM Vulnerability Fix Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Eliminate 176 npm security vulnerabilities (15 critical, 55 high) in a CRA v4 ejected project by migrating from the deprecated Create React App toolchain to Vite.

**Architecture:** Migrate from CRA v4 (webpack 4, babel 7.12.x) to Vite + modern React. The root cause is the entire CRA build toolchain being 4+ years outdated. Patching individual deps won't work — the toolchain itself is the vulnerability source.

**Tech Stack:** React 17 → React 18, Webpack 4 → Vite 5, Babel 7.12 → esbuild (built into Vite)

---

## Root Cause Analysis (fault-diagnosis)

| Phase | Finding |
|-------|---------|
| **Symptom** | 176 npm vulnerabilities across build toolchain |
| **Immediate Cause** | Outdated dependencies: webpack 4.44.2, @babel/core 7.12.3, postcss 7.x, etc. |
| **Root Cause** | CRA v4 ejected project with frozen 2020-era toolchain. CRA itself is deprecated. |
| **Why patching won't work** | Vulnerabilities are in transitive deps of webpack 4, babel 7.12, postcss 7. Updating one dep breaks others. The whole toolchain must go. |
| **Fix** | Migrate to Vite (replaces webpack + babel + CRA scripts entirely) |

---

## Task 1: Backup & Baseline

**Files:**
- Create: `BACKUP.md` (snapshot of current state)
- Modify: none

**Step 1: Record current state**

```bash
cd /tmp/greenbotz-task-two
npm audit 2>&1 | tail -5
# Record: "176 vulnerabilities (7 low, 99 moderate, 55 high, 15 critical)"
```

**Step 2: Create a branch**

```bash
git checkout -b fix/npm-vulnerabilities
```

**Step 3: Commit baseline**

```bash
git add -A
git commit -m "chore: snapshot before vulnerability fix migration"
```

---

## Task 2: Migrate from CRA to Vite

**Files:**
- Modify: `package.json` (replace entire dependency set)
- Delete: `config/` directory, `scripts/` directory
- Create: `vite.config.js`
- Create: `index.html` (Vite requires root-level HTML)
- Modify: `src/index.jsx` (update entry point)

**Step 1: Create Vite config**

```bash
# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
  build: { outDir: 'build' }
})
EOF
```

**Step 2: Create root index.html for Vite**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Broken React Todo App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

**Step 3: Update src/index.jsx**

Remove CRA-specific imports:
```jsx
// REMOVE these lines:
import reportWebVitals from './reportWebVitals';
// ...
reportWebVitals();
```

Add Vite-compatible mount:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import App from './app'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 4: Replace package.json dependencies**

```json
{
  "name": "broken-react-todo-application-context-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0"
  }
}
```

**Step 5: Remove old CRA files**

```bash
rm -rf config/ scripts/ node_modules/
```

**Step 6: Install fresh dependencies**

```bash
npm install
```

**Step 7: Verify dev server starts**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```

**Step 8: Verify build works**

```bash
npm run build
```

**Step 9: Run npm audit**

```bash
npm audit
# Expected: 0 vulnerabilities
```

**Step 10: Commit**

```bash
git add -A
git commit -m "fix: migrate from CRA v4 to Vite - eliminates 176 vulnerabilities

- Replaced webpack 4 + babel 7.12 + CRA scripts with Vite 6
- Upgraded React 17 to React 18
- Removed config/, scripts/ directories (CRA ejected toolchain)
- All 176 npm vulnerabilities resolved (0 remaining)"
```

---

## Task 3: Verify Application Works

**Files:**
- None (verification only)

**Step 1: Start dev server and test manually**

```bash
npm run dev
# Open http://localhost:3000
# Verify: todo list renders, add/delete/complete work
```

**Step 2: Verify production build**

```bash
npm run build
ls -la build/
# Should contain index.html, assets/
```

**Step 3: Final audit**

```bash
npm audit --audit-level=moderate
# Expected: found 0 vulnerabilities
```

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: verify app works after Vite migration"
```

---

## Task 4: Update ESLint Config (Optional Cleanup)

**Files:**
- Create: `eslint.config.js` (flat config for ESLint 9+)
- Remove: `.eslintrc` if present

**Step 1: Add minimal ESLint**

```bash
npm install -D eslint @eslint/js
```

**Step 2: Create eslint.config.js**

```js
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
]
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: update ESLint to flat config format"
```

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Vulnerabilities | 176 (15 critical, 55 high) | **0** |
| Build tool | Webpack 4 + CRA 4 | Vite 6 |
| Babel | 7.12.3 | Removed (esbuild) |
| React | 17.x | 18.x |
| Node tooling age | 2020-era | 2025-era |

---

## Anti-Rationalization (fault-diagnosis)

| Thought | Truth |
|---------|-------|
| "Just run npm audit fix" | Won't work — CRA's webpack 4 deps are fundamentally incompatible with patched versions |
| "Upgrade individual packages" | Patching 55 transitive deps across webpack 4 is whack-a-mole. Migrate the toolchain. |
| "CRA still works fine" | CRA is deprecated. Staying on it guarantees accumulating more vulnerabilities. |
| "Vite migration is too risky" | The app has 5 source files. Migration takes 15 minutes. The risk is staying on vulnerable deps. |
