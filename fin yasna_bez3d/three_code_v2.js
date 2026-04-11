
// ═══════════════════════════════════════════
// ══ 3D VIEW v2 (Three.js) ════════════════
// ═══════════════════════════════════════════

let is3D = false;
let scene3d, camera3d, renderer3d, controls3d;
let nodes3d = [];
let crossLines3d = {};
let triMeshes3d = {};
let arcMeshes3d = null;
let axisMeshes3d = null;
let oppLine3d = null;
let selectedGlow3d = null;
let raycaster3d, mouse3d;
let threeInited = false;
let animFrameId = null;
let clock3d;

function toggleView() {
  is3D = !is3D;
  const btn = document.getElementById('view-toggle');
  const area = document.querySelector('.star-area');

  if (is3D) {
    btn.textContent = '2D';
    btn.classList.add('active-3d');
    area.classList.add('mode-3d');
    if (!threeInited) init3D();
    else { onResize3D(); }
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

// ── Constants ──
const R3D = 180;
const NODE_BASE_Y = 0;

// Each node gets a unique Y-height for true 3D depth
// Pattern: upper hemisphere nodes higher, lower hemisphere lower
// Creates a wave/helix effect around the ring
function nodeHeight(i) {
  // Sinusoidal height variation: nodes 5-6-7 highest, 11-0-1 lowest
  return Math.sin(((i - 6) * 30) * Math.PI / 180) * -45;
}

function nodePos3D(i) {
  const angle = ((i - 6) * 30 - 90) * Math.PI / 180;
  return new THREE.Vector3(
    Math.cos(angle) * R3D,
    nodeHeight(i),
    Math.sin(angle) * R3D
  );
}

function init3D() {
  const container = document.getElementById('three-container');
  const canvas = document.getElementById('three-canvas');
  const w = container.offsetWidth || 900;
  const h = container.offsetHeight || 650;

  clock3d = new THREE.Clock();

  // ── Scene ──
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x060a14);

  // ── Camera — angled for depth perception ──
  camera3d = new THREE.PerspectiveCamera(45, w / h, 1, 3000);
  camera3d.position.set(120, 250, 380);
  camera3d.lookAt(0, -10, 0);

  // ── Renderer with better settings ──
  renderer3d = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    logarithmicDepthBuffer: true  // Fixes z-fighting!
  });
  renderer3d.setSize(w, h);
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer3d.shadowMap.enabled = true;
  renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer3d.toneMapping = THREE.ACESFilmicToneMapping;
  renderer3d.toneMappingExposure = 1.1;

  // ── Controls ──
  controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
  controls3d.enableDamping = true;
  controls3d.dampingFactor = 0.06;
  controls3d.minDistance = 180;
  controls3d.maxDistance = 700;
  controls3d.maxPolarAngle = Math.PI * 0.75;
  controls3d.minPolarAngle = Math.PI * 0.15;
  controls3d.autoRotate = true;
  controls3d.autoRotateSpeed = 0.4;
  controls3d.target.set(0, -10, 0);

  // ── Raycaster ──
  raycaster3d = new THREE.Raycaster();
  mouse3d = new THREE.Vector2();

  // ── Lighting ──
  buildLights3D();

  // ── Build scene ──
  buildStarfield3D();
  buildFloor3D();
  buildHelixRing3D();
  buildNodes3D();
  buildCenterPillar3D();
  buildCrosses3D();
  buildTriangles3D();
  buildArcs3D();
  buildAxes3D();
  buildOppLine3D();

  // ── Events ──
  renderer3d.domElement.addEventListener('click', onClick3D);
  renderer3d.domElement.addEventListener('mousemove', onMove3D);
  window.addEventListener('resize', onResize3D);

  threeInited = true;
}

function buildLights3D() {
  // Ambient — soft fill
  scene3d.add(new THREE.AmbientLight(0x1a2244, 0.8));

  // Main key light from above-front
  const keyLight = new THREE.DirectionalLight(0xffeedd, 0.7);
  keyLight.position.set(100, 200, 150);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 50;
  keyLight.shadow.camera.far = 600;
  keyLight.shadow.camera.left = -250;
  keyLight.shadow.camera.right = 250;
  keyLight.shadow.camera.top = 250;
  keyLight.shadow.camera.bottom = -250;
  scene3d.add(keyLight);

  // Warm point light in center
  const centerLight = new THREE.PointLight(0xc8a96e, 1.5, 400, 2);
  centerLight.position.set(0, 30, 0);
  scene3d.add(centerLight);

  // Cool rim light from behind
  const rimLight = new THREE.PointLight(0x4466aa, 0.8, 500, 2);
  rimLight.position.set(-150, 80, -200);
  scene3d.add(rimLight);

  // Bottom fill (subtle)
  const bottomLight = new THREE.PointLight(0x223355, 0.4, 300, 2);
  bottomLight.position.set(0, -80, 0);
  scene3d.add(bottomLight);
}

function buildStarfield3D() {
  const geo = new THREE.BufferGeometry();
  const count = 800;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000 + 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    sizes[i] = Math.random() * 2 + 0.5;
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  scene3d.add(new THREE.Points(geo, mat));
}

function buildFloor3D() {
  // Circular gradient floor
  const floorGeo = new THREE.CircleGeometry(350, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e1e,
    transparent: true,
    opacity: 0.6,
    metalness: 0.8,
    roughness: 0.6
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -55;
  floor.receiveShadow = true;
  scene3d.add(floor);

  // Subtle concentric rings on floor
  for (let r = 60; r <= 300; r += 60) {
    const ringGeo = new THREE.TorusGeometry(r, 0.3, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc8a96e,
      transparent: true,
      opacity: 0.04
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -54;
    scene3d.add(ring);
  }
}

function buildHelixRing3D() {
  // Create a 3D helix-like ring that follows node heights
  const points = [];
  for (let i = 0; i <= 360; i += 2) {
    const nodeIdx = ((i / 30) + 6) % 12;
    const floorIdx = Math.floor(nodeIdx);
    const ceilIdx = Math.ceil(nodeIdx) % 12;
    const frac = nodeIdx - floorIdx;
    const y = nodeHeight(floorIdx) * (1 - frac) + nodeHeight(ceilIdx) * frac;
    const angle = (i - 90) * Math.PI / 180;
    points.push(new THREE.Vector3(
      Math.cos(angle) * R3D,
      y,
      Math.sin(angle) * R3D
    ));
  }

  const curve = new THREE.CatmullRomCurve3(points, true);

  // Main ring tube
  const tubeGeo = new THREE.TubeGeometry(curve, 200, 2.0, 12, true);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xc8a96e,
    emissive: 0xc8a96e,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.7,
    metalness: 0.7,
    roughness: 0.2
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.castShadow = true;
  scene3d.add(tube);

  // Outer glow tube
  const glowGeo = new THREE.TubeGeometry(curve, 200, 5, 8, true);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  scene3d.add(new THREE.Mesh(glowGeo, glowMat));
}

function buildNodes3D() {
  const elColors = { 'ШЭ': 0xc8a96e, 'ФО': 0x4a9eff, 'ЦИ': 0xc8e6ff, 'ХА': 0xff7b54 };

  for (let i = 0; i < 12; i++) {
    const pos = nodePos3D(i);
    const col = elColors[nodeEl[i]];

    // ── Main sphere (icosahedron for faceted look) ──
    const geo = new THREE.IcosahedronGeometry(7, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.25
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(pos);
    sphere.castShadow = true;
    sphere.userData = { nodeIndex: i };
    scene3d.add(sphere);

    // ── Inner glow sphere ──
    const glowGeo = new THREE.SphereGeometry(11, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.position.copy(pos);
    scene3d.add(glowSphere);

    // ── Outer halo ring ──
    const haloGeo = new THREE.TorusGeometry(10, 0.4, 8, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(pos);
    halo.lookAt(0, pos.y + 100, 0); // face upward
    scene3d.add(halo);

    // ── Vertical pillar from node down to floor ──
    const pillarHeight = pos.y + 54;
    if (pillarHeight > 1) {
      const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, pillarHeight, 8);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pos.x, pos.y - pillarHeight / 2, pos.z);
      scene3d.add(pillar);
    }

    // ── Number label (sprite) ──
    const numSprite = makeTextSprite3D(String(i), {
      fontSize: 32, fontWeight: 'bold',
      color: '#' + col.toString(16).padStart(6, '0'),
      bgColor: 'rgba(6,10,20,0.9)',
      borderColor: '#' + col.toString(16).padStart(6, '0'),
      padding: 8,
      borderRadius: 8
    });
    numSprite.position.set(pos.x, pos.y + 16, pos.z);
    numSprite.scale.set(18, 9, 1);
    scene3d.add(numSprite);

    // ── Name label ──
    const name = modeLabels[curMode][i];
    const nameSprite = makeTextSprite3D(name, {
      fontSize: 24,
      color: 'rgba(232,224,208,0.85)',
      bgColor: 'transparent'
    });
    const labelDir = new THREE.Vector3(pos.x, 0, pos.z).normalize();
    nameSprite.position.set(
      pos.x + labelDir.x * 28,
      pos.y - 14,
      pos.z + labelDir.z * 28
    );
    nameSprite.scale.set(32, 10, 1);
    nameSprite.userData = { isLabel: true, nodeIndex: i };
    scene3d.add(nameSprite);

    nodes3d.push({ sphere, glowSphere, halo, numSprite, nameSprite, index: i });
  }
}

function makeTextSprite3D(text, opts = {}) {
  const fontSize = opts.fontSize || 24;
  const fontWeight = opts.fontWeight || 'normal';
  const color = opts.color || '#e8e0d0';
  const bgColor = opts.bgColor || 'transparent';
  const borderColor = opts.borderColor || 'transparent';
  const padding = opts.padding || 6;
  const borderRadius = opts.borderRadius || 6;

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
    ctx.roundRect(0, 0, tw, th, borderRadius);
    ctx.fill();
  }
  if (borderColor !== 'transparent') {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(1, 1, tw - 2, th - 2, borderRadius - 1);
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
    depthTest: false,
    depthWrite: false
  });
  return new THREE.Sprite(spriteMat);
}

function buildCenterPillar3D() {
  // Central glowing column
  const pillarGeo = new THREE.CylinderGeometry(3, 3, 100, 16);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = -5;
  scene3d.add(pillar);

  // Central orb
  const orbGeo = new THREE.SphereGeometry(12, 32, 32);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xc8a96e,
    emissive: 0xc8a96e,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.15,
    metalness: 0.8,
    roughness: 0.1
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 0;
  scene3d.add(orb);

  // Outer glow
  const glowGeo = new THREE.SphereGeometry(25, 24, 24);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.03,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  scene3d.add(new THREE.Mesh(glowGeo, glowMat));

  // Text label
  const sprite = makeTextSprite3D('ВСТРЕЧА\nЯСНА', {
    fontSize: 18,
    color: 'rgba(200,169,110,0.35)',
    bgColor: 'transparent'
  });
  sprite.position.set(0, 25, 0);
  sprite.scale.set(40, 20, 1);
  scene3d.add(sprite);
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

      // Create curved path through center (slightly above)
      const mid = new THREE.Vector3(
        (pa.x + pb.x) * 0.5,
        Math.max(pa.y, pb.y) + 15,
        (pa.z + pb.z) * 0.5
      );
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);

      // Glowing tube
      const tubeGeo = new THREE.TubeGeometry(curve, 40, 1.2, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.55,
        metalness: 0.5,
        roughness: 0.3
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.castShadow = true;
      group.add(tube);

      // Outer glow
      const glowGeo = new THREE.TubeGeometry(curve, 40, 3, 6, false);
      const glowMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      group.add(new THREE.Mesh(glowGeo, glowMat));
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

    // Triangle edges as curved tubes
    for (let i = 0; i < 3; i++) {
      const a = positions[i];
      const b = positions[(i + 1) % 3];
      const mid = new THREE.Vector3(
        (a.x + b.x) * 0.5,
        Math.max(a.y, b.y) + 10,
        (a.z + b.z) * 0.5
      );
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const tubeGeo = new THREE.TubeGeometry(curve, 30, 0.9, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.6,
        metalness: 0.4,
        roughness: 0.3
      });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));

      // Glow
      const glowGeo = new THREE.TubeGeometry(curve, 30, 2.5, 6, false);
      const glowMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      group.add(new THREE.Mesh(glowGeo, glowMat));
    }

    // Semi-transparent triangle fill
    const triGeo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      positions[0].x, positions[0].y + 1, positions[0].z,
      positions[1].x, positions[1].y + 1, positions[1].z,
      positions[2].x, positions[2].y + 1, positions[2].z
    ]);
    triGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    triGeo.setIndex([0, 1, 2]);
    triGeo.computeVertexNormals();
    const triMat = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.Mesh(triGeo, triMat));

    scene3d.add(group);
    triMeshes3d[key] = group;
  }
}

function buildArcs3D() {
  const arcDefs = [
    { from: 1, to: 5, color: 0x4a9eff, label: 'Рождение', heightMult: 1.0 },
    { from: 5, to: 9, color: 0x9b59b6, label: 'Решение', heightMult: 1.2 },
    { from: 9, to: 1, color: 0xc8a96e, label: 'Осмысление', heightMult: 1.1 }
  ];

  const group = new THREE.Group();
  group.visible = false;

  for (const arc of arcDefs) {
    const points = [];
    const startAngle = ((arc.from - 6) * 30 - 90) * Math.PI / 180;
    let endAngle = ((arc.to - 6) * 30 - 90) * Math.PI / 180;
    if (endAngle >= startAngle) endAngle -= Math.PI * 2;

    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + (endAngle - startAngle) * t;
      // Arc rises above the ring with a smooth curve
      const rise = Math.sin(t * Math.PI) * 55 * arc.heightMult;
      // Follow the node height pattern
      const nodeIdx = ((angle * 180 / Math.PI + 90) / 30 + 6) % 12;
      const floorIdx = Math.floor(nodeIdx) % 12;
      const ceilIdx = (floorIdx + 1) % 12;
      const frac = nodeIdx - Math.floor(nodeIdx);
      const baseY = nodeHeight(floorIdx) * (1 - frac) + nodeHeight(ceilIdx) * frac;

      points.push(new THREE.Vector3(
        Math.cos(angle) * (R3D + 12),
        baseY + rise + 10,
        Math.sin(angle) * (R3D + 12)
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 80, 2.0, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: arc.color,
      emissive: arc.color,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.65,
      metalness: 0.5,
      roughness: 0.3
    });
    group.add(new THREE.Mesh(tubeGeo, tubeMat));

    // Glow
    const glowGeo = new THREE.TubeGeometry(curve, 80, 5, 6, false);
    const glowMat = new THREE.MeshBasicMaterial({
      color: arc.color,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Label at midpoint
    const midPt = curve.getPoint(0.5);
    const labelSprite = makeTextSprite3D(arc.label, {
      fontSize: 20,
      color: '#' + arc.color.toString(16).padStart(6, '0'),
      bgColor: 'rgba(6,10,20,0.85)',
      borderColor: '#' + arc.color.toString(16).padStart(6, '0') + '66',
      padding: 6,
      borderRadius: 8
    });
    labelSprite.position.set(midPt.x, midPt.y + 15, midPt.z);
    labelSprite.scale.set(30, 10, 1);
    group.add(labelSprite);
  }

  scene3d.add(group);
  arcMeshes3d = group;
}

function buildAxes3D() {
  const group = new THREE.Group();
  group.visible = false;

  const axisDefs = [
    { a: 0, b: 6, color: 0xe8d5a3, label1: 'Тайный', label2: 'Явный' },
    { a: 3, b: 9, color: 0xe8d5a3, label1: 'Война', label2: 'Мир' }
  ];

  for (const ax of axisDefs) {
    const pa = nodePos3D(ax.a);
    const pb = nodePos3D(ax.b);

    // Axis as a thin glowing cylinder
    const dir = new THREE.Vector3().subVectors(pb, pa);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(pa, pb).multiplyScalar(0.5);

    const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, len, 8);
    const cylMat = new THREE.MeshBasicMaterial({
      color: ax.color,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.copy(mid);
    // Orient cylinder along the axis
    cyl.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    group.add(cyl);

    // Labels
    const l1 = makeTextSprite3D(ax.label1, {
      fontSize: 18, color: '#e8d5a3', bgColor: 'rgba(6,10,20,0.8)', padding: 4
    });
    l1.position.set(pa.x, pa.y + 20, pa.z);
    l1.scale.set(24, 8, 1);
    group.add(l1);

    const l2 = makeTextSprite3D(ax.label2, {
      fontSize: 18, color: '#e8d5a3', bgColor: 'rgba(6,10,20,0.8)', padding: 4
    });
    l2.position.set(pb.x, pb.y + 20, pb.z);
    l2.scale.set(24, 8, 1);
    group.add(l2);
  }

  scene3d.add(group);
  axisMeshes3d = group;
}

function buildOppLine3D() {
  const curve = new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  );
  const tubeGeo = new THREE.TubeGeometry(curve, 1, 0.8, 6, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0x98d8c8,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  oppLine3d = new THREE.Mesh(tubeGeo, tubeMat);
  oppLine3d.visible = false;
  scene3d.add(oppLine3d);
}

function update3DLayers() {
  if (!threeInited) return;
  for (const key of ['cs', 'cl', 'cf']) {
    if (crossLines3d[key]) crossLines3d[key].visible = active.has(key);
  }
  for (const key of ['tf', 'tw', 'ta', 'te']) {
    if (triMeshes3d[key]) triMeshes3d[key].visible = active.has(key);
  }
  if (arcMeshes3d) arcMeshes3d.visible = active.has('ar');
  if (axisMeshes3d) axisMeshes3d.visible = active.has('ax');

  if (active.has('op') && curNode !== null) {
    showOppLine3D(curNode);
  } else if (oppLine3d) {
    oppLine3d.visible = false;
  }
  updateLabels3D();
}

function updateLabels3D() {
  if (!threeInited) return;
  for (const nd of nodes3d) {
    const name = modeLabels[curMode][nd.index];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Georgia';
    const tw = ctx.measureText(name).width + 12;
    const th = 34;
    canvas.width = Math.ceil(tw) * 2;
    canvas.height = Math.ceil(th) * 2;
    ctx.scale(2, 2);
    ctx.font = '24px Georgia';
    ctx.fillStyle = 'rgba(232,224,208,0.85)';
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
  if (selectedGlow3d) {
    scene3d.remove(selectedGlow3d);
    if (selectedGlow3d.geometry) selectedGlow3d.geometry.dispose();
    if (selectedGlow3d.material) selectedGlow3d.material.dispose();
    selectedGlow3d = null;
  }

  const pos = nodePos3D(n);
  const col = { 'ШЭ': 0xc8a96e, 'ФО': 0x4a9eff, 'ЦИ': 0xc8e6ff, 'ХА': 0xff7b54 }[nodeEl[n]];

  // Selection ring
  const ringGeo = new THREE.TorusGeometry(14, 1.2, 16, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: col,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  selectedGlow3d = new THREE.Mesh(ringGeo, ringMat);
  selectedGlow3d.position.copy(pos);
  selectedGlow3d.rotation.x = Math.PI / 2;
  scene3d.add(selectedGlow3d);

  if (active.has('op')) showOppLine3D(n);
}

function showOppLine3D(n) {
  if (!oppLine3d) return;
  const pa = nodePos3D(n);
  const pb = nodePos3D(oppOf(n));

  // Rebuild tube geometry for the opp line
  scene3d.remove(oppLine3d);
  if (oppLine3d.geometry) oppLine3d.geometry.dispose();

  const mid = new THREE.Vector3(
    (pa.x + pb.x) * 0.5,
    Math.max(pa.y, pb.y) + 20,
    (pa.z + pb.z) * 0.5
  );
  const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
  oppLine3d.geometry = new THREE.TubeGeometry(curve, 30, 0.8, 6, false);
  oppLine3d.visible = true;
  scene3d.add(oppLine3d);
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
    // Brief stop of auto-rotate on click
    controls3d.autoRotate = false;
    setTimeout(() => { controls3d.autoRotate = true; }, 3000);
  }
}

function onMove3D(event) {
  const rect = renderer3d.domElement.getBoundingClientRect();
  mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster3d.setFromCamera(mouse3d, camera3d);
  const spheres = nodes3d.map(n => n.sphere);
  const intersects = raycaster3d.intersectObjects(spheres);

  nodes3d.forEach(nd => {
    nd.sphere.scale.setScalar(1);
    nd.glowSphere.material.opacity = 0.08;
    nd.halo.material.opacity = 0.15;
  });

  if (intersects.length > 0) {
    const idx = intersects[0].object.userData.nodeIndex;
    nodes3d[idx].sphere.scale.setScalar(1.4);
    nodes3d[idx].glowSphere.material.opacity = 0.2;
    nodes3d[idx].halo.material.opacity = 0.35;
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
  const delta = clock3d.getDelta();
  time3d += delta;

  controls3d.update();

  // Pulse selected node
  if (selectedGlow3d) {
    selectedGlow3d.material.opacity = 0.25 + Math.sin(time3d * 4) * 0.2;
    selectedGlow3d.scale.setScalar(1 + Math.sin(time3d * 3) * 0.08);
    selectedGlow3d.rotation.z += delta * 0.5;
  }

  // Subtle node breathing
  nodes3d.forEach((nd, i) => {
    const phase = time3d * 1.2 + i * 0.52;
    const breathe = 1 + Math.sin(phase) * 0.04;
    if (nd.sphere.scale.x < 1.2) {
      nd.glowSphere.scale.setScalar(breathe * 1.1);
    }
    // Halo rotation
    nd.halo.rotation.z += delta * (0.2 + i * 0.02);
  });

  renderer3d.render(scene3d, camera3d);
}

// ── Hook into existing functions to sync 3D ──
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
