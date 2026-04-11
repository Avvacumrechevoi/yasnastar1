# 3D Mode Test Findings

## Working:
- Three.js scene renders correctly
- 12 node spheres visible with correct element colors
- Star ring (torus) visible
- Cross lines (Крест Опоры) visible as blue lines
- Triangle (Огонь ХА) visible with red lines
- Arc curves visible (Рождение, Решение, Осмысление) with labels
- Starfield particles in background
- Grid floor visible
- Camera auto-rotates slowly
- 2D/3D toggle button works (shows "2D" when in 3D mode)
- Layer toggles sync with 3D view
- Node labels visible (Тишина, Исток, Русло, etc.)
- Number labels visible on nodes

## Issues to fix:
- Need to verify node click → pick() → card display works
- Need to test switching back to 2D mode
- Camera angle could be slightly higher for better overview
