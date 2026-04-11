#!/usr/bin/env python3
"""Inject 3D mode (Three.js) into the existing star.html with a 2D/3D toggle."""

import re

with open('/home/ubuntu/yasna_3d/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Three.js CDN + OrbitControls before </head>
three_imports = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
'''
html = html.replace('</head>', three_imports + '</head>')

# 2. Add 2D/3D toggle button in the header (before "Звезда Ясны")
toggle_btn = '''<button id="view-toggle" onclick="toggleView()" style="background:rgba(120,180,255,.1);border:1px solid rgba(120,180,255,.35);color:rgba(120,180,255,.85);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:Georgia,serif;transition:all .2s" onmouseenter="this.style.borderColor='rgba(120,180,255,.7)';this.style.color='#78b4f7'" onmouseleave="this.style.borderColor='rgba(120,180,255,.35)';this.style.color='rgba(120,180,255,.85)'">3D</button>'''
html = html.replace('<span>Звезда Ясны</span>', toggle_btn + '\n    <span>Звезда Ясны</span>')

# 3. Add 3D canvas container right after the SVG closing tag (inside star-area)
canvas_container = '''
    <!-- 3D Canvas (hidden by default) -->
    <div id="three-container" style="display:none;width:100%;height:100%;position:absolute;top:0;left:0;right:0;bottom:0;">
      <canvas id="three-canvas"></canvas>
    </div>
'''
html = html.replace('</svg><!-- /svg -->', '</svg><!-- /svg -->' + canvas_container)

# 4. Add CSS for the 3D container
css_3d = '''
/* ── 3D View ── */
#three-container {
  border-radius: 12px;
  overflow: hidden;
}
#three-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.star-area.mode-3d {
  min-height: calc(100vh - 220px);
}
.star-area.mode-3d .star-svg {
  display: none !important;
}
.star-area.mode-3d #three-container {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  height: calc(100vh - 220px) !important;
}
#view-toggle.active-3d {
  background: rgba(120,180,255,.25) !important;
  border-color: rgba(120,180,255,.7) !important;
  color: #78b4f7 !important;
  box-shadow: 0 0 12px rgba(120,180,255,.2);
}
'''
html = html.replace('/* ── Starfield ── */', css_3d + '\n/* ── Starfield ── */')

# 5. Add the massive 3D JavaScript before </script>
three_js_code = r'''

// ═══════════════════════════════════════════
// ══ 3D VIEW (Three.js) ═══════════════════
// ═══════════════════════════════════════════

let is3D = false;
let scene3d, camera3d, renderer3d, controls3d;
let nodes3d = [];
let rings3d = [];
let labels3d = [];
let crossLines3d = {};
let triMeshes3d = {};
let arcMeshes3d = [];
let axisMeshes3d = [];
let oppLine3d = null;
let selectedGlow3d = null;
let raycaster3d, mouse3d;
let threeInited = false;
let animFrameId = null;

function toggleView() {
  is3D = !is3D;
  const btn = document.getElementById('view-toggle');
  const area = document.querySelector('.star-area');
  
  if (is3D) {
    btn.textContent = '2D';
    btn.classList.add('active-3d');
    area.classList.add('mode-3d');
    if (!threeInited) init3D();
    else {
      renderer3d.setSize(area.offsetWidth, area.offsetHeight);
      camera3d.aspect = area.offsetWidth / area.offsetHeight;
      camera3d.updateProjectionMatrix();
    }
    animate3d();
    update3DLayers();
    if (curNode !== null) highlight3DNode(curNode);
  } else {
    btn.textContent = '3D';
    btn.classList.remove('active-3d');
    area.classList.remove('mode-3d');
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function init3D() {
  const container = document.getElementById('three-container');
  const canvas = document.getElementById('three-canvas');
  const w = container.offsetWidth || 800;
  const h = container.offsetHeight || 600;
  
  // Scene
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x080c18);
  scene3d.fog = new THREE.FogExp2(0x080c18, 0.0008);
  
  // Camera
  camera3d = new THREE.PerspectiveCamera(50, w / h, 0.1, 2000);
  camera3d.position.set(0, 180, 420);
  camera3d.lookAt(0, 0, 0);
  
  // Renderer
  renderer3d = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer3d.setSize(w, h);
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Controls
  controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
  controls3d.enableDamping = true;
  controls3d.dampingFactor = 0.08;
  controls3d.minDistance = 200;
  controls3d.maxDistance = 800;
  controls3d.maxPolarAngle = Math.PI * 0.85;
  controls3d.autoRotate = true;
  controls3d.autoRotateSpeed = 0.3;
  
  // Raycaster for interaction
  raycaster3d = new THREE.Raycaster();
  mouse3d = new THREE.Vector2();
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
  scene3d.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xc8a96e, 1.2, 600);
  pointLight.position.set(0, 100, 0);
  scene3d.add(pointLight);
  
  const rimLight = new THREE.DirectionalLight(0x4a9eff, 0.3);
  rimLight.position.set(-200, 100, -200);
  scene3d.add(rimLight);
  
  // ── Build the star ──
  buildStarRing3D();
  buildNodes3D();
  buildCenterGlow3D();
  buildStarfield3D();
  buildCrosses3D();
  buildTriangles3D();
  buildArcs3D();
  buildAxes3D();
  buildOppLine3D();
  buildFloor3D();
  
  // Events
  renderer3d.domElement.addEventListener('click', onClick3D);
  renderer3d.domElement.addEventListener('mousemove', onMove3D);
  window.addEventListener('resize', onResize3D);
  
  threeInited = true;
}

const R3D = 160; // radius for nodes in 3D
const NODE_Y = 0; // y-plane for the star

function nodePos3D(i) {
  // Same angle logic as 2D: node 6 at top (angle -90°), going clockwise
  const angle = ((i - 6) * 30 - 90) * Math.PI / 180;
  // In 3D: x = right, z = forward, y = up
  // Map 2D circle to xz-plane
  return new THREE.Vector3(
    Math.cos(angle) * R3D,
    NODE_Y,
    Math.sin(angle) * R3D
  );
}

function buildStarRing3D() {
  // Main ring (torus)
  const ringGeo = new THREE.TorusGeometry(R3D, 1.2, 16, 120);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xc8a96e,
    emissive: 0xc8a96e,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.5,
    metalness: 0.6,
    roughness: 0.3
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = NODE_Y;
  scene3d.add(ring);
  
  // Outer glow ring
  const glowGeo = new THREE.TorusGeometry(R3D, 4, 16, 120);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = Math.PI / 2;
  glow.position.y = NODE_Y;
  scene3d.add(glow);
}

function buildNodes3D() {
  const elColors = { 'ШЭ': 0xc8a96e, 'ФО': 0x4a9eff, 'ЦИ': 0xc8e6ff, 'ХА': 0xff7b54 };
  
  for (let i = 0; i < 12; i++) {
    const pos = nodePos3D(i);
    const col = elColors[nodeEl[i]];
    
    // Sphere node
    const geo = new THREE.SphereGeometry(6, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.3
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(pos);
    sphere.userData = { nodeIndex: i };
    scene3d.add(sphere);
    
    // Glow around node
    const glowGeo = new THREE.SphereGeometry(9, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.08
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.position.copy(pos);
    scene3d.add(glowSphere);
    
    // Number label (sprite)
    const numSprite = makeTextSprite(String(i), {
      fontSize: 28, fontWeight: 'bold',
      color: '#' + col.toString(16).padStart(6, '0'),
      bgColor: 'rgba(8,12,24,0.85)',
      borderColor: '#' + col.toString(16).padStart(6, '0'),
      padding: 6
    });
    numSprite.position.set(pos.x, pos.y + 14, pos.z);
    numSprite.scale.set(16, 8, 1);
    scene3d.add(numSprite);
    
    // Name label
    const name = modeLabels[curMode][i];
    const nameSprite = makeTextSprite(name, {
      fontSize: 22,
      color: 'rgba(232,224,208,0.8)',
      bgColor: 'transparent'
    });
    // Position label outside the ring
    const labelDir = pos.clone().normalize();
    const labelPos = pos.clone().add(labelDir.multiplyScalar(22));
    nameSprite.position.set(labelPos.x, pos.y - 10, labelPos.z);
    nameSprite.scale.set(28, 10, 1);
    nameSprite.userData = { isLabel: true, nodeIndex: i };
    scene3d.add(nameSprite);
    
    nodes3d.push({ sphere, glowSphere, numSprite, nameSprite, index: i });
  }
}

function makeTextSprite(text, opts = {}) {
  const fontSize = opts.fontSize || 24;
  const fontWeight = opts.fontWeight || 'normal';
  const color = opts.color || '#e8e0d0';
  const bgColor = opts.bgColor || 'transparent';
  const borderColor = opts.borderColor || 'transparent';
  const padding = opts.padding || 4;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontWeight} ${fontSize}px Georgia`;
  const metrics = ctx.measureText(text);
  const tw = metrics.width + padding * 2;
  const th = fontSize * 1.4 + padding * 2;
  
  canvas.width = Math.ceil(tw) * 2;
  canvas.height = Math.ceil(th) * 2;
  ctx.scale(2, 2);
  
  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, tw, th, 6);
    ctx.fill();
  }
  if (borderColor !== 'transparent') {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(1, 1, tw - 2, th - 2, 5);
    ctx.stroke();
  }
  
  ctx.font = `${fontWeight} ${fontSize}px Georgia`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tw / 2, th / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  return new THREE.Sprite(spriteMat);
}

function buildCenterGlow3D() {
  // Center text "ВСТРЕЧА ЯСНА"
  const sprite = makeTextSprite('ВСТРЕЧА\nЯСНА', {
    fontSize: 16,
    color: 'rgba(200,169,110,0.25)',
    bgColor: 'transparent'
  });
  sprite.position.set(0, 2, 0);
  sprite.scale.set(40, 20, 1);
  scene3d.add(sprite);
  
  // Center glow
  const glowGeo = new THREE.SphereGeometry(25, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.03
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = NODE_Y;
  scene3d.add(glow);
}

function buildStarfield3D() {
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 500; i++) {
    positions.push(
      (Math.random() - 0.5) * 1200,
      (Math.random() - 0.5) * 600 + 100,
      (Math.random() - 0.5) * 1200
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  });
  scene3d.add(new THREE.Points(starGeo, starMat));
}

function buildFloor3D() {
  // Subtle grid floor
  const gridHelper = new THREE.GridHelper(400, 20, 0x1a2040, 0x0d1225);
  gridHelper.position.y = -40;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.15;
  scene3d.add(gridHelper);
}

function buildCrosses3D() {
  const crossDefs = {
    cs: { nodes: [[0,6],[3,9]], color: 0x7eb8f7 },
    cl: { nodes: [[1,7],[4,10]], color: 0xf7c97e },
    cf: { nodes: [[2,8],[5,11]], color: 0xa8e6cf }
  };
  
  for (const [key, def] of Object.entries(crossDefs)) {
    const group = new THREE.Group();
    group.visible = false;
    
    for (const [a, b] of def.nodes) {
      const pa = nodePos3D(a);
      const pb = nodePos3D(b);
      
      // Elevated line (slightly above the plane)
      const points = [
        new THREE.Vector3(pa.x, NODE_Y + 2, pa.z),
        new THREE.Vector3(pb.x, NODE_Y + 2, pb.z)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      group.add(new THREE.Line(lineGeo, lineMat));
      
      // Glowing tube for thickness
      const path = new THREE.LineCurve3(points[0], points[1]);
      const tubeGeo = new THREE.TubeGeometry(path, 1, 0.8, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.2
      });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));
    }
    
    scene3d.add(group);
    crossLines3d[key] = group;
  }
}

function buildTriangles3D() {
  const triDefs = {
    tf: { nodes: [3, 7, 11], color: 0xff7b54 },
    tw: { nodes: [1, 5, 9],  color: 0x4a9eff },
    ta: { nodes: [2, 6, 10], color: 0xc8e6ff },
    te: { nodes: [4, 8, 0],  color: 0xc8a96e }
  };
  
  for (const [key, def] of Object.entries(triDefs)) {
    const group = new THREE.Group();
    group.visible = false;
    
    const positions = def.nodes.map(n => nodePos3D(n));
    
    // Triangle edges
    for (let i = 0; i < 3; i++) {
      const a = positions[i];
      const b = positions[(i + 1) % 3];
      const pts = [
        new THREE.Vector3(a.x, NODE_Y + 3, a.z),
        new THREE.Vector3(b.x, NODE_Y + 3, b.z)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.7
      });
      group.add(new THREE.Line(lineGeo, lineMat));
      
      // Tube
      const path = new THREE.LineCurve3(pts[0], pts[1]);
      const tubeGeo = new THREE.TubeGeometry(path, 1, 0.6, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.15
      });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));
    }
    
    // Semi-transparent fill
    const triGeo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      positions[0].x, NODE_Y + 1, positions[0].z,
      positions[1].x, NODE_Y + 1, positions[1].z,
      positions[2].x, NODE_Y + 1, positions[2].z
    ]);
    triGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    triGeo.setIndex([0, 1, 2]);
    triGeo.computeVertexNormals();
    const triMat = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide
    });
    group.add(new THREE.Mesh(triGeo, triMat));
    
    scene3d.add(group);
    triMeshes3d[key] = group;
  }
}

function buildArcs3D() {
  // 3 arcs as colored curves above the ring
  const arcDefs = [
    { from: 1, to: 5, color: 0x4a9eff, label: 'Рождение', height: 30 },
    { from: 5, to: 9, color: 0x9b59b6, label: 'Решение', height: 40 },
    { from: 9, to: 1, color: 0xc8a96e, label: 'Осмысление', height: 35 }
  ];
  
  const group = new THREE.Group();
  group.visible = false;
  
  for (const arc of arcDefs) {
    const points = [];
    const startAngle = ((arc.from - 6) * 30 - 90) * Math.PI / 180;
    let endAngle = ((arc.to - 6) * 30 - 90) * Math.PI / 180;
    
    // Ensure we go clockwise
    if (endAngle >= startAngle) endAngle -= Math.PI * 2;
    
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + (endAngle - startAngle) * t;
      const heightCurve = Math.sin(t * Math.PI) * arc.height;
      points.push(new THREE.Vector3(
        Math.cos(angle) * (R3D + 8),
        NODE_Y + 5 + heightCurve,
        Math.sin(angle) * (R3D + 8)
      ));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 60, 1.5, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: arc.color,
      emissive: arc.color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6,
      metalness: 0.4,
      roughness: 0.4
    });
    group.add(new THREE.Mesh(tubeGeo, tubeMat));
    
    // Arc label
    const midT = 0.5;
    const midAngle = startAngle + (endAngle - startAngle) * midT;
    const midHeight = Math.sin(midT * Math.PI) * arc.height;
    const labelSprite = makeTextSprite(arc.label, {
      fontSize: 18,
      color: '#' + arc.color.toString(16).padStart(6, '0'),
      bgColor: 'rgba(8,12,24,0.8)',
      padding: 4
    });
    labelSprite.position.set(
      Math.cos(midAngle) * (R3D + 25),
      NODE_Y + 10 + midHeight + 10,
      Math.sin(midAngle) * (R3D + 25)
    );
    labelSprite.scale.set(30, 10, 1);
    group.add(labelSprite);
  }
  
  scene3d.add(group);
  arcMeshes3d = group;
}

function buildAxes3D() {
  const group = new THREE.Group();
  group.visible = false;
  
  // Vertical axis: 0 ↔ 6
  const p0 = nodePos3D(0);
  const p6 = nodePos3D(6);
  // Horizontal axis: 3 ↔ 9
  const p3 = nodePos3D(3);
  const p9 = nodePos3D(9);
  
  const axisDefs = [
    { a: p0, b: p6, color: 0xe8d5a3, label1: 'Тайный', label2: 'Явный' },
    { a: p3, b: p9, color: 0xe8d5a3, label1: 'Война', label2: 'Мир' }
  ];
  
  for (const ax of axisDefs) {
    // Dashed line
    const pts = [
      new THREE.Vector3(ax.a.x, NODE_Y + 4, ax.a.z),
      new THREE.Vector3(ax.b.x, NODE_Y + 4, ax.b.z)
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineDashedMaterial({
      color: ax.color,
      transparent: true,
      opacity: 0.5,
      dashSize: 6,
      gapSize: 4
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    group.add(line);
  }
  
  scene3d.add(group);
  axisMeshes3d = group;
}

function buildOppLine3D() {
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ]);
  const lineMat = new THREE.LineDashedMaterial({
    color: 0x98d8c8,
    transparent: true,
    opacity: 0.5,
    dashSize: 4,
    gapSize: 3
  });
  oppLine3d = new THREE.Line(lineGeo, lineMat);
  oppLine3d.visible = false;
  scene3d.add(oppLine3d);
}

function update3DLayers() {
  if (!threeInited) return;
  
  // Crosses
  for (const key of ['cs', 'cl', 'cf']) {
    if (crossLines3d[key]) crossLines3d[key].visible = active.has(key);
  }
  // Triangles
  for (const key of ['tf', 'tw', 'ta', 'te']) {
    if (triMeshes3d[key]) triMeshes3d[key].visible = active.has(key);
  }
  // Arcs
  if (arcMeshes3d) arcMeshes3d.visible = active.has('ar');
  // Axes
  if (axisMeshes3d) axisMeshes3d.visible = active.has('ax');
  
  // Opposite line
  if (oppLine3d && active.has('op') && curNode !== null) {
    showOppLine3D(curNode);
  } else if (oppLine3d) {
    oppLine3d.visible = false;
  }
  
  // Update node labels
  updateLabels3D();
}

function updateLabels3D() {
  if (!threeInited) return;
  for (const nd of nodes3d) {
    const name = modeLabels[curMode][nd.index];
    // Recreate name sprite texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '22px Georgia';
    const tw = ctx.measureText(name).width + 8;
    const th = 30;
    canvas.width = Math.ceil(tw) * 2;
    canvas.height = Math.ceil(th) * 2;
    ctx.scale(2, 2);
    ctx.font = '22px Georgia';
    ctx.fillStyle = 'rgba(232,224,208,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, tw / 2, th / 2);
    
    if (nd.nameSprite.material.map) nd.nameSprite.material.map.dispose();
    nd.nameSprite.material.map = new THREE.CanvasTexture(canvas);
    nd.nameSprite.material.map.minFilter = THREE.LinearFilter;
    nd.nameSprite.material.needsUpdate = true;
  }
}

function highlight3DNode(n) {
  if (!threeInited) return;
  
  // Remove previous highlight
  if (selectedGlow3d) {
    scene3d.remove(selectedGlow3d);
    selectedGlow3d.geometry.dispose();
    selectedGlow3d.material.dispose();
    selectedGlow3d = null;
  }
  
  const pos = nodePos3D(n);
  const col = { 'ШЭ': 0xc8a96e, 'ФО': 0x4a9eff, 'ЦИ': 0xc8e6ff, 'ХА': 0xff7b54 }[nodeEl[n]];
  
  // Pulsing ring around selected node
  const ringGeo = new THREE.TorusGeometry(12, 1, 16, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: col,
    transparent: true,
    opacity: 0.4
  });
  selectedGlow3d = new THREE.Mesh(ringGeo, ringMat);
  selectedGlow3d.position.copy(pos);
  selectedGlow3d.rotation.x = Math.PI / 2;
  scene3d.add(selectedGlow3d);
  
  // Show opp line if op layer active
  if (active.has('op')) {
    showOppLine3D(n);
  }
}

function showOppLine3D(n) {
  if (!oppLine3d) return;
  const pa = nodePos3D(n);
  const pb = nodePos3D(oppOf(n));
  const positions = oppLine3d.geometry.attributes.position;
  positions.setXYZ(0, pa.x, NODE_Y + 3, pa.z);
  positions.setXYZ(1, pb.x, NODE_Y + 3, pb.z);
  positions.needsUpdate = true;
  oppLine3d.computeLineDistances();
  oppLine3d.visible = true;
}

function onClick3D(event) {
  const rect = renderer3d.domElement.getBoundingClientRect();
  mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster3d.setFromCamera(mouse3d, camera3d);
  const spheres = nodes3d.map(n => n.sphere);
  const intersects = raycaster3d.intersectObjects(spheres);
  
  if (intersects.length > 0) {
    const idx = intersects[0].object.userData.nodeIndex;
    pick(idx);
    highlight3DNode(idx);
  }
}

function onMove3D(event) {
  const rect = renderer3d.domElement.getBoundingClientRect();
  mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster3d.setFromCamera(mouse3d, camera3d);
  const spheres = nodes3d.map(n => n.sphere);
  const intersects = raycaster3d.intersectObjects(spheres);
  
  // Reset all node scales
  nodes3d.forEach(nd => {
    nd.sphere.scale.setScalar(1);
    nd.glowSphere.material.opacity = 0.08;
  });
  
  if (intersects.length > 0) {
    const idx = intersects[0].object.userData.nodeIndex;
    nodes3d[idx].sphere.scale.setScalar(1.3);
    nodes3d[idx].glowSphere.material.opacity = 0.2;
    renderer3d.domElement.style.cursor = 'pointer';
  } else {
    renderer3d.domElement.style.cursor = 'grab';
  }
}

function onResize3D() {
  if (!is3D || !threeInited) return;
  const container = document.getElementById('three-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  camera3d.aspect = w / h;
  camera3d.updateProjectionMatrix();
  renderer3d.setSize(w, h);
}

let time3d = 0;
function animate3d() {
  if (!is3D) return;
  animFrameId = requestAnimationFrame(animate3d);
  time3d += 0.01;
  
  controls3d.update();
  
  // Pulse selected node glow
  if (selectedGlow3d) {
    selectedGlow3d.material.opacity = 0.2 + Math.sin(time3d * 3) * 0.15;
    selectedGlow3d.scale.setScalar(1 + Math.sin(time3d * 2) * 0.1);
  }
  
  // Subtle node breathing
  nodes3d.forEach((nd, i) => {
    const breathe = 1 + Math.sin(time3d * 1.5 + i * 0.5) * 0.03;
    if (nd.sphere.scale.x < 1.2) { // don't override hover
      nd.glowSphere.scale.setScalar(breathe);
    }
  });
  
  renderer3d.render(scene3d, camera3d);
}

// ── Hook into existing tog() and setMode() to sync 3D ──
const origTog = window.tog;
window.tog = function(layer) {
  origTog(layer);
  if (is3D) update3DLayers();
};

const origSetMode = window.setMode;
window.setMode = function(m) {
  origSetMode(m);
  if (is3D) updateLabels3D();
};

const origPick = window.pick;
window.pick = function(n) {
  origPick(n);
  if (is3D) highlight3DNode(n);
};

const origResetAll = window.resetAll;
window.resetAll = function() {
  origResetAll();
  if (is3D) update3DLayers();
};
'''

# Find the closing </script> and inject before it
html = html.replace('</script>\n</body>', three_js_code + '\n</script>\n</body>')

with open('/home/ubuntu/yasna_3d/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Done! File size: {len(html)} bytes, {html.count(chr(10))} lines")
