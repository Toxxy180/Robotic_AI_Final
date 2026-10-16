import * as THREE from './vendor/three.module.min.js';

/* Educational, schematic models. Units and proportions are illustrative. */
const C = { green: 0x00875b, mint: 0x8ce6bd, white: 0xf8faf9, silver: 0xb8c7c4, dark: 0x172826, floor: 0xeaf0ee };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const style = document.createElement('style');
style.textContent = `
.visual-widget{position:relative;min-width:0;font-family:inherit;color:#243e36;isolation:isolate}
.visual-stage{height:330px;min-height:250px;position:relative;overflow:hidden;border-radius:20px;background:radial-gradient(ellipse at 50% 38%,#fbfdfc,#eaf0ee 78%);touch-action:none;cursor:grab}
.visual-stage:active{cursor:grabbing}.visual-stage canvas{display:block;width:100%;height:100%;outline:none}.visual-stage canvas:focus-visible{outline:3px solid #00875b;outline-offset:-5px;border-radius:20px}
.visual-tag{position:absolute;top:17px;left:18px;z-index:1;font-size:10px;letter-spacing:.15em;font-weight:700;color:#55716a;pointer-events:none;text-transform:uppercase}.visual-hint{position:absolute;bottom:15px;right:18px;font-size:10px;letter-spacing:.03em;color:#678078;pointer-events:none}
.visual-controls{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:13px 2px 0}.visual-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.visual-btn{font-family:inherit;font-size:12px;line-height:1.4;font-weight:600;border:1px solid #dce5e1;border-radius:9px;padding:8px 11px;color:#375b4d;background:#fff;cursor:pointer;transition:background .18s,color .18s,border-color .18s}.visual-btn:hover{border-color:#00875b;background:#eef8f2}.visual-btn[aria-pressed=true]{background:#00875b;border-color:#00875b;color:#fff}.visual-btn:focus-visible,.visual-rotate:focus-visible{outline:3px solid #71cda1;outline-offset:3px}.visual-reset{font-size:11px;background:transparent;border:0;color:#6a8178;cursor:pointer;padding:6px;font-family:inherit}.visual-rotation{display:flex;align-items:center;gap:8px;font-size:10px;color:#73897f}.visual-rotate{width:74px;accent-color:#00875b;cursor:pointer}.visual-note{font-size:12px;line-height:1.8;min-height:2em;color:#62766d;padding:10px 2px 0;margin:0}.visual-fallback{padding:55px 28px;font-size:14px;line-height:1.9;background:#edf4ef;border-radius:18px}.visual-widget[data-visual=robot] .visual-stage{height:460px;background:transparent}.visual-widget[data-visual=robot] .visual-controls{justify-content:center}.visual-widget[data-visual=robot] .visual-note{display:none}.visual-widget[data-visual=robot] .visual-tag{display:none}
@media(max-width:600px){.visual-stage{height:285px}.visual-widget[data-visual=robot] .visual-stage{height:340px}.visual-btn{padding:8px 10px;font-size:11px}.visual-controls{gap:8px}.visual-rotation{margin-left:auto}.visual-note{font-size:11px}}
@media(prefers-reduced-motion:reduce){.visual-btn{transition:none}}
`;
document.head.append(style);

function material(color, extra = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: .35, metalness: .08, clearcoat: .35, ...extra }); }
function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function roundedBox(w, h, d, radius, mat, parent, x = 0, y = 0, z = 0) {
  const r = Math.min(radius, w / 2, h / 2, d / 2), shape = new THREE.Shape();
  const a = -w / 2 + r, b = -h / 2 + r, iw = w - 2 * r, ih = h - 2 * r;
  shape.moveTo(a, b - r); shape.lineTo(a + iw, b - r); shape.quadraticCurveTo(a + iw + r, b - r, a + iw + r, b);
  shape.lineTo(a + iw + r, b + ih); shape.quadraticCurveTo(a + iw + r, b + ih + r, a + iw, b + ih + r);
  shape.lineTo(a, b + ih + r); shape.quadraticCurveTo(a - r, b + ih + r, a - r, b + ih);
  shape.lineTo(a - r, b); shape.quadraticCurveTo(a - r, b - r, a, b - r);
  const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(.01, d - 2 * r), bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: r * .72, bevelThickness: r, curveSegments: 10 });
  g.translate(0, 0, -d / 2 + r); return mesh(g, mat, parent, x, y, z);
}
function sphere(r, mat, parent, x = 0, y = 0, z = 0, scale) { const m = mesh(new THREE.SphereGeometry(r, 28, 20), mat, parent, x, y, z); if (scale) m.scale.set(...scale); return m; }
function cylinder(rt, rb, h, mat, parent, x = 0, y = 0, z = 0, segments = 48) { return mesh(new THREE.CylinderGeometry(rt, rb, h, segments), mat, parent, x, y, z); }
function rod(a, b, r, mat, parent) {
  const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b), d = q.clone().sub(p);
  const m = cylinder(r, r, d.length(), mat, parent); m.position.copy(p.add(q).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
function torus(r, tube, mat, parent, x = 0, y = 0, z = 0) { return mesh(new THREE.TorusGeometry(r, tube, 12, 60), mat, parent, x, y, z); }
function button(text, handler, pressed = null) { const b = document.createElement('button'); b.type = 'button'; b.className = 'visual-btn'; b.textContent = text; if (pressed !== null) b.setAttribute('aria-pressed', String(pressed)); b.addEventListener('click', handler); return b; }
function setPressed(buttons, index) { buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index))); }

function addRobot(parent, mats, { wheels = false } = {}) {
  const robot = new THREE.Group(); parent.add(robot);
  const sensor = new THREE.Group(), think = new THREE.Group(), act = new THREE.Group(); robot.add(sensor, think, act);
  cylinder(1.38, 1.45, .15, mats.silver, robot, 0, .075, 0);
  torus(1.28, .014, mats.green, robot, 0, .16).rotation.x = Math.PI / 2;
  roundedBox(.91, .88, .63, .18, mats.white, robot, 0, 1.42, 0);
  roundedBox(.69, .25, .5, .1, mats.silver, robot, 0, .91, 0);
  cylinder(.2, .24, .2, mats.silver, robot, 0, 1.99, 0);
  roundedBox(1.34, 1.0, .86, .2, mats.white, robot, 0, 2.55, 0);
  roundedBox(1.12, .69, .1, .16, mats.dark, sensor, 0, 2.55, .47);
  for (const side of [-1, 1]) {
    sphere(.092, mats.glow, sensor, side * .25, 2.63, .555, [.75, 1.3, .45]);
    const ear = cylinder(.17, .17, .18, mats.silver, sensor, side * .77, 2.52); ear.rotation.z = Math.PI / 2;
    sphere(.19, mats.silver, act, side * .62, 1.74, 0);
    rod([side * .61, 1.68, 0], [side * .87, 1.3, .04], .12, mats.white, act);
    sphere(.13, mats.silver, act, side * .87, 1.3, .04);
    rod([side * .87, 1.3, .04], [side * .83, .99, .16], .105, mats.white, act);
    sphere(.16, mats.white, act, side * .83, .94, .17, [.86, 1.0, .9]);
    rod([side * .25, .85, 0], [side * .3, .46, .03], .13, mats.white, act);
    if (wheels) { const wh = cylinder(.26, .26, .15, mats.dark, act, side * .49, .41, 0); wh.rotation.z = Math.PI / 2; }
    else roundedBox(.43, .23, .56, .1, mats.white, act, side * .31, .31, .1);
  }
  const mouth = new THREE.CatmullRomCurve3([new THREE.Vector3(-.12, 2.38, .56), new THREE.Vector3(0, 2.34, .575), new THREE.Vector3(.12, 2.38, .56)]);
  mesh(new THREE.TubeGeometry(mouth, 20, .013, 6, false), mats.glow, sensor);
  rod([0, 3.06, 0], [0, 3.28, 0], .035, mats.silver, sensor); sphere(.075, mats.green, sensor, 0, 3.31, 0);
  const chest = roundedBox(.4, .32, .05, .05, mats.green, think, 0, 1.5, .365);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) sphere(.015, mats.glow, think, i * .1, 1.5 + j * .08, .409);
  const haloMat = new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: .12, side: THREE.DoubleSide, depthWrite: false });
  const halos = [torus(.43, .015, haloMat, robot, .0, 3.25), torus(.39, .018, haloMat, robot, 0, 1.49, .45), torus(1.08, .025, haloMat, robot, 0, .21, 0)];
  halos[0].rotation.x = Math.PI / 2; halos[2].rotation.x = Math.PI / 2;
  return { robot, sensor, think, act, halos, chest };
}

function makeRobot(ctx, interactive) {
  const model = addRobot(ctx.group, ctx.mats, { wheels: interactive });
  ctx.focus.set(0, 1.58, 0); ctx.radius = interactive ? 7.1 : 7.35; ctx.theta = .43; ctx.phi = 1.35;
  ctx.tag.textContent = interactive ? 'SENSE → THINK → ACT' : 'ROBOTICS IN THREE DIMENSIONS';
  if (!interactive) { ctx.note.textContent = 'ลากเพื่อหมุนหุ่นยนต์ หรือใช้ปุ่มลูกศรบนคีย์บอร์ด'; return; }
  const labels = ['Sense · รับรู้', 'Think · คิด', 'Act · กระทำ'];
  const notes = ['SENSE — กล้องและเซนเซอร์รับข้อมูลจากรอบตัว เช่น ระยะทางและสิ่งกีดขวาง', 'THINK — หน่วยประมวลผลใช้ซอฟต์แวร์วิเคราะห์ข้อมูลและเลือกคำสั่งที่เหมาะสม', 'ACT — มอเตอร์ขับล้อหรือข้อต่อให้เคลื่อนไหว แล้วเซนเซอร์ตรวจผลเพื่อป้อนกลับ'];
  let selected = 0;
  const bases = new Map(); [model.sensor, model.think, model.act].forEach(g => g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); bases.set(o, { color: o.material.color.clone(), emissive: o.material.emissive?.clone() }); } }));
  function select(i) {
    selected = i; setPressed(buttons, i); ctx.note.textContent = notes[i];
    [model.sensor, model.think, model.act].forEach((g, index) => g.traverse(o => { if (!o.isMesh) return; const base = bases.get(o); o.material.color.copy(base.color); if (index === i && o.material.color.getHex() !== C.dark) o.material.color.lerp(new THREE.Color(C.green), .27); if (o.material.emissive) { o.material.emissive.copy(base.emissive || new THREE.Color(0)); o.material.emissiveIntensity = index === i ? .5 : .1; } }));
    model.halos.forEach((h, j) => { h.visible = i === j; }); ctx.draw();
  }
  const buttons = labels.map((label, i) => button(label, () => select(i), i === selected)); ctx.actions.append(...buttons); select(0);
}

function makeVacuum(ctx) {
  const { group, mats } = ctx, body = new THREE.Group(), lid = new THREE.Group(), base = new THREE.Group(); group.add(body, lid, base);
  cylinder(1.16, 1.2, .37, mats.white, body, 0, .59);
  cylinder(1.205, 1.205, .09, mats.dark, body, 0, .49);
  const front = roundedBox(.55, .13, .035, .035, mats.dark, body, 0, .62, 1.17);
  for (let i = -1; i <= 1; i++) sphere(.026, mats.green, body, i * .13, .63, 1.2);
  cylinder(1.15, 1.15, .055, mats.white, lid, 0, .81);
  torus(1.02, .007, mats.silver, lid, 0, .844).rotation.x = Math.PI / 2;
  cylinder(.28, .28, .18, mats.white, lid, 0, .93, -.31);
  cylinder(.285, .285, .045, mats.dark, lid, 0, .96, -.31);
  cylinder(.23, .23, .035, mats.green, lid, 0, 1.04, -.31);
  cylinder(.045, .045, .015, mats.green, lid, 0, .849, .35);
  const tray = roundedBox(.67, .13, .51, .06, material(0x62b58b, { transparent: true, opacity: .7 }), body, 0, .81, .27);
  for (const side of [-1, 1]) { const wheel = cylinder(.24, .24, .15, mats.dark, base, side * .91, .29, 0); wheel.rotation.z = Math.PI / 2; const hub = cylinder(.1, .1, .16, mats.silver, base, side * .91, .29, 0); hub.rotation.z = Math.PI / 2; }
  const brush = cylinder(.105, .105, 1.04, mats.green, base, 0, .27, .39); brush.rotation.z = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const bristle = cylinder(.018, .018, 1.06, mats.dark, base, 0, .27 + Math.sin(i * Math.PI / 4) * .1, .39 + Math.cos(i * Math.PI / 4) * .1); bristle.rotation.z = Math.PI / 2; }
  cylinder(.13, .13, .05, mats.dark, base, .83, .26, .72);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; rod([.83, .25, .72], [.83 + .4 * Math.cos(a), .25, .72 + .4 * Math.sin(a)], .026, mats.dark, base); }
  cylinder(.08, .08, .07, mats.silver, base, 0, .21, -.8);
  const guideMat = new THREE.LineDashedMaterial({ color: 0x77ac93, dashSize: .06, gapSize: .05, transparent: true, opacity: .6 });
  const guides = new THREE.Group(); group.add(guides); for (const x of [-.7, .7]) { const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, .3, 0), new THREE.Vector3(x, 2.25, 0)]), guideMat); line.computeLineDistances(); guides.add(line); } guides.visible = false;
  ctx.focus.set(0, 1.0, 0); ctx.radius = 5.2; ctx.theta = .62; ctx.phi = 1.0; ctx.tag.textContent = 'ROBOT VACUUM · HARDWARE';
  let exploded = false;
  const toggle = button('แยกชิ้นส่วน', () => { exploded = !exploded; toggle.setAttribute('aria-pressed', String(exploded)); toggle.textContent = exploded ? 'ประกอบกลับ' : 'แยกชิ้นส่วน'; guides.visible = exploded; ctx.note.textContent = exploded ? 'ด้านบน: ฝาครอบและ LiDAR · ตรงกลาง: ตัวเครื่องและถังฝุ่น · ด้านล่าง: ล้อและแปรง — แผนภาพย่อเพื่อการเรียนรู้' : 'LiDAR ตรวจระยะ · ซอฟต์แวร์วางเส้นทาง · มอเตอร์ขับล้อและแปรง — ลากเพื่อดูรอบตัว'; const startLid = lid.position.y, startBody = body.position.y; ctx.tween(t => { lid.position.y = THREE.MathUtils.lerp(startLid, exploded ? 1.25 : 0, t); body.position.y = THREE.MathUtils.lerp(startBody, exploded ? .4 : 0, t); }); }, false);
  ctx.actions.append(toggle); ctx.note.textContent = 'LiDAR ตรวจระยะ · ซอฟต์แวร์วางเส้นทาง · มอเตอร์ขับล้อและแปรง — กดแยกชิ้นส่วนเพื่อดูภายใน';
}

function makeArms(ctx) {
  const { group, mats } = ctx, articulated = new THREE.Group(), delta = new THREE.Group(); group.add(articulated, delta);
  cylinder(.64, .75, .18, mats.silver, articulated, -.4, .09);
  cylinder(.35, .4, .34, mats.green, articulated, -.4, .34);
  const points = [[-.4, .53, 0], [-.47, 1.51, 0], [.24, 2.27, 0], [1.02, 2.02, 0], [1.18, 1.79, 0], [1.18, 1.59, 0]];
  points.forEach((p, i) => { const joint = cylinder(i < 3 ? .19 : .105, i < 3 ? .19 : .105, i < 3 ? .3 : .2, i % 2 ? mats.silver : mats.green, articulated, ...p); joint.rotation.x = Math.PI / 2; if (i < points.length - 1) rod(p, points[i + 1], i < 2 ? .12 : .09, mats.white, articulated); });
  rod([1.18, 1.59, 0], [1.18, 1.38, 0], .065, mats.silver, articulated);
  for (const side of [-1, 1]) { rod([1.18, 1.4, 0], [1.18 + side * .15, 1.32, 0], .035, mats.dark, articulated); rod([1.18 + side * .15, 1.32, 0], [1.18 + side * .15, 1.12, 0], .035, mats.dark, articulated); }
  roundedBox(.22, .21, .22, .03, mats.green, articulated, 1.18, 1.16, 0);
  cylinder(1.37, 1.37, .12, mats.silver, delta, 0, 2.7, 0, 3).rotation.y = Math.PI / 6;
  cylinder(.28, .28, .12, mats.green, delta, 0, 1.05);
  const angles = [Math.PI / 6, Math.PI * 5 / 6, Math.PI * 3 / 2];
  angles.forEach(a => {
    const u = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const top = u.clone().multiplyScalar(1.02); top.y = 2.65;
    const elbow = u.clone().multiplyScalar(1.12); elbow.y = 1.97;
    const bottom = u.clone().multiplyScalar(.24); bottom.y = 1.1;
    sphere(.115, mats.green, delta, ...top.toArray()); rod(top.toArray(), elbow.toArray(), .085, mats.white, delta); sphere(.09, mats.silver, delta, ...elbow.toArray());
    [-1, 1].forEach(side => { const offset = tangent.clone().multiplyScalar(.075 * side); rod(elbow.clone().add(offset).toArray(), bottom.clone().add(offset).toArray(), .024, mats.dark, delta); });
    const foot = u.clone().multiplyScalar(1.45); rod([foot.x, .08, foot.z], [foot.x, 2.7, foot.z], .035, mats.silver, delta);
  });
  rod([0, 1.0, 0], [0, .79, 0], .05, mats.silver, delta); cylinder(.12, .065, .08, mats.dark, delta, 0, .74);
  roundedBox(2.4, .13, .8, .05, mats.dark, delta, 0, .37, .0);
  for (let i = -1; i <= 1; i++) roundedBox(.25, .2, .25, .04, i === 0 ? mats.green : mats.white, delta, i * .7, .54, 0);
  ctx.focus.set(0, 1.45, 0); ctx.radius = 5.9; ctx.theta = .56; ctx.phi = 1.13; ctx.tag.textContent = 'INDUSTRIAL ROBOTS · SCHEMATIC';
  const texts = ['Articulated — ข้อต่อหมุนต่อกัน 6 แกน ปรับทิศทางเครื่องมือได้หลายมุม เหมาะกับงานเชื่อมและประกอบ', 'Delta — กลไกขนาน 3 ชุดและก้านคู่ช่วยคุมแท่นปลายแขน เหมาะกับการหยิบวางชิ้นงานเบาอย่างรวดเร็ว'];
  function select(i) { articulated.visible = i === 0; delta.visible = i === 1; setPressed(buttons, i); ctx.note.textContent = texts[i]; ctx.draw(); }
  const buttons = ['Articulated · 6 แกน', 'Delta · กลไกขนาน'].map((s, i) => button(s, () => select(i), i === 0)); ctx.actions.append(...buttons); select(0);
}

function makeSAE(ctx) {
  const { group, mats } = ctx, roadMat = material(0x71857c, { roughness: .9 }), car = new THREE.Group(); group.add(car);
  roundedBox(4.5, .1, 2.6, .08, roadMat, group, 0, .06);
  const stripe = material(0xe5eee7); for (let i = -2; i <= 2; i++) roundedBox(.45, .012, .035, .004, stripe, group, i * .84, .12, .0);
  for (let side of [-1, 1]) roundedBox(4.32, .01, .035, .004, stripe, group, 0, .12, side * 1.08);
  car.position.set(.05, .12, .48);
  roundedBox(1.85, .32, .78, .13, mats.white, car, 0, .35);
  const glass = material(0x263c36, { roughness: .15, metalness: .25, clearcoat: .8 });
  roundedBox(1.08, .39, .65, .14, glass, car, -.1, .66);
  roundedBox(.7, .07, .68, .04, mats.white, car, -.12, .88);
  for (const x of [-.58, .58]) for (const z of [-.41, .41]) { const wheel = cylinder(.21, .21, .12, mats.dark, car, x, .24, z); wheel.rotation.x = Math.PI / 2; const hub = cylinder(.105, .105, .125, mats.silver, car, x, .24, z); hub.rotation.x = Math.PI / 2; }
  for (const z of [-.24, .24]) sphere(.07, mats.glow, car, .91, .43, z, [.4, .65, 1]);
  const sensor = cylinder(.1, .1, .06, mats.green, car, -.1, .95);
  const driver = sphere(.095, material(0xeac8a0), car, .08, .69, .34); // role marker, not a sensor
  const ringMat = new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: .22, depthWrite: false });
  const rings = [1.2, 1.6, 2.0].map(r => { const ring = torus(r, .012, ringMat.clone(), group, .05, .14, .48); ring.rotation.x = Math.PI / 2; return ring; });
  ctx.focus.set(0, .4, 0); ctx.radius = 6.4; ctx.theta = .9; ctx.phi = .85; ctx.tag.textContent = 'SAE LEVELS · ILLUSTRATIVE';
  const explanations = [
    'ระดับ 0 — มนุษย์ควบคุมและเฝ้าระวังทั้งหมด อาจมีระบบเตือนหรือช่วยชั่วขณะ',
    'ระดับ 1 — ระบบช่วยพวงมาลัยหรือความเร็วอย่างใดอย่างหนึ่ง มนุษย์เฝ้าระวังและควบคุมส่วนที่เหลือ',
    'ระดับ 2 — ระบบช่วยทั้งพวงมาลัยและความเร็ว มนุษย์ยังต้องเฝ้าระวังตลอดเวลา',
    'ระดับ 3 — ระบบขับและเฝ้าระวังในเงื่อนไขที่กำหนด มนุษย์ต้องพร้อมรับช่วงเมื่อระบบร้องขอ',
    'ระดับ 4 — ระบบขับและจัดการการยุติการขับเองภายในขอบเขตที่กำหนด โดยไม่ต้องให้มนุษย์รับช่วง',
    'ระดับ 5 — ระบบขับได้ทุกสภาพถนนและสภาพแวดล้อมที่ผู้ขับมนุษย์สามารถขับได้ ไม่ต้องมีผู้ขับ'
  ];
  function select(i) { setPressed(buttons, i); ctx.note.textContent = explanations[i]; sensor.visible = i > 0; driver.visible = i < 4; rings.forEach((r, n) => { r.visible = i > n; r.material.opacity = .1 + i * .027; }); ctx.draw(); }
  const buttons = explanations.map((_, i) => button(String(i), () => select(i), i === 0)); buttons.forEach((b, i) => b.setAttribute('aria-label', `SAE ระดับ ${i}`)); ctx.actions.append(...buttons); select(0);
}

export function mountVisual(type, container) {
  const names = { robot: 'หุ่นยนต์สามมิติ', sense: 'องค์ประกอบ Sense Think Act', vacuum: 'ส่วนประกอบหุ่นยนต์ดูดฝุ่น', arms: 'เปรียบเทียบแขนกลอุตสาหกรรม', sae: 'ระดับความเป็นอัตโนมัติของยานยนต์' };
  const root = document.createElement('div'); root.className = 'visual-widget'; root.dataset.visual = type;
  const stage = document.createElement('div'); stage.className = 'visual-stage';
  const tag = document.createElement('span'); tag.className = 'visual-tag';
  const hint = document.createElement('span'); hint.className = 'visual-hint'; hint.textContent = 'ลากเพื่อหมุน · 3D';
  stage.append(tag, hint);
  const controls = document.createElement('div'); controls.className = 'visual-controls';
  const actions = document.createElement('div'); actions.className = 'visual-actions'; controls.append(actions);
  const rotation = document.createElement('label'); rotation.className = 'visual-rotation'; rotation.textContent = 'หมุน';
  const range = document.createElement('input'); range.className = 'visual-rotate'; range.type = 'range'; range.min = '-180'; range.max = '180'; range.step = '1'; range.value = '0'; range.setAttribute('aria-label', `หมุน${names[type] || 'โมเดล'}ในแนวนอน`); rotation.append(range);
  const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'visual-reset'; reset.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M3 9a9 9 0 1 1 1 9M3 3v6h6"/></svg><span>รีเซ็ตมุมมอง</span>'; rotation.append(reset); controls.append(rotation);
  const note = document.createElement('p'); note.className = 'visual-note'; note.setAttribute('aria-live', 'polite');
  root.append(stage, controls, note); container.append(root);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (_) { root.innerHTML = `<div class="visual-fallback"><strong>${names[type] || 'แบบจำลองสามมิติ'}</strong><br>เบราว์เซอร์นี้ไม่รองรับการแสดงผล WebGL อ่านคำอธิบายและคำตอบประกอบด้านข้างได้ครบถ้วน</div>`; return { dispose() { root.remove(); } }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.13;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', `${names[type] || 'โมเดลสามมิติ'} หมุนได้ด้วยการลากหรือปุ่มลูกศร`); renderer.domElement.tabIndex = 0; stage.prepend(renderer.domElement);
  const scene = new THREE.Scene(), group = new THREE.Group(), camera = new THREE.PerspectiveCamera(35, 1, .1, 80); scene.add(group);
  scene.add(new THREE.HemisphereLight(0xf5fff9, 0x8c9a95, 2.7));
  const key = new THREE.DirectionalLight(0xffffff, 4.1); key.position.set(-3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 6; key.shadow.camera.bottom = -5; key.shadow.normalBias = .03; scene.add(key);
  const rim = new THREE.DirectionalLight(0xb5e8cd, 1.5); rim.position.set(4, 3, -4); scene.add(rim);
  const floor = mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: .11 }), scene, 0, -.015); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const grid = new THREE.GridHelper(8, 16, 0xc8d8ce, 0xd6e2db); grid.material.transparent = true; grid.material.opacity = type === 'robot' ? .18 : .34; grid.position.y = -.012; scene.add(grid);
  const mats = { white: material(C.white), silver: material(C.silver, { metalness: .6, roughness: .28 }), dark: material(C.dark, { roughness: .23 }), green: material(C.green, { roughness: .3 }), glow: material(C.mint, { emissive: 0x26bd7e, emissiveIntensity: .65, roughness: .2 }) };
  let disposed = false, raf = 0, tweenId = 0, width = 1, height = 1;
  const ctx = { scene, group, mats, actions, note, tag, focus: new THREE.Vector3(0, 1, 0), theta: .5, phi: 1.15, radius: 6,
    draw() { if (disposed || raf) return; raf = requestAnimationFrame(() => { raf = 0; if (disposed) return; camera.position.set(ctx.focus.x + ctx.radius * Math.sin(ctx.phi) * Math.sin(ctx.theta), ctx.focus.y + ctx.radius * Math.cos(ctx.phi), ctx.focus.z + ctx.radius * Math.sin(ctx.phi) * Math.cos(ctx.theta)); camera.lookAt(ctx.focus); renderer.render(scene, camera); }); },
    tween(update) { const id = ++tweenId; if (reducedMotion()) { update(1); ctx.draw(); return; } const start = performance.now(); function step(now) { if (disposed || id !== tweenId) return; const t = Math.min(1, (now - start) / 450); update(1 - Math.pow(1 - t, 3)); ctx.draw(); if (t < 1) requestAnimationFrame(step); } requestAnimationFrame(step); }
  };
  if (type === 'sense') makeRobot(ctx, true); else if (type === 'vacuum') makeVacuum(ctx); else if (type === 'arms') makeArms(ctx); else if (type === 'sae') makeSAE(ctx); else makeRobot(ctx, false);
  const initial = { theta: ctx.theta, phi: ctx.phi, radius: ctx.radius };
  function syncRange() { const angle = ((ctx.theta - initial.theta) * 180 / Math.PI + 540) % 360 - 180; range.value = String(Math.round(angle)); }
  range.addEventListener('input', () => { ctx.theta = initial.theta + Number(range.value) * Math.PI / 180; ctx.draw(); });
  reset.addEventListener('click', () => { Object.assign(ctx, initial); range.value = '0'; ctx.draw(); });
  let pointer = null;
  const onDown = e => { if (e.button !== 0) return; pointer = { x: e.clientX, y: e.clientY, id: e.pointerId }; stage.setPointerCapture(e.pointerId); };
  const onMove = e => { if (!pointer || pointer.id !== e.pointerId) return; ctx.theta -= (e.clientX - pointer.x) * .009; ctx.phi = THREE.MathUtils.clamp(ctx.phi - (e.clientY - pointer.y) * .006, .35, 1.5); pointer.x = e.clientX; pointer.y = e.clientY; syncRange(); ctx.draw(); };
  const onUp = e => { if (pointer?.id === e.pointerId) { pointer = null; if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId); } };
  const onKey = e => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return; e.preventDefault(); if (e.key === 'Home') Object.assign(ctx, initial); else if (e.key === 'ArrowLeft') ctx.theta -= .15; else if (e.key === 'ArrowRight') ctx.theta += .15; else ctx.phi = THREE.MathUtils.clamp(ctx.phi + (e.key === 'ArrowUp' ? -.1 : .1), .35, 1.5); syncRange(); ctx.draw(); };
  stage.addEventListener('pointerdown', onDown); stage.addEventListener('pointermove', onMove); stage.addEventListener('pointerup', onUp); stage.addEventListener('pointercancel', onUp); renderer.domElement.addEventListener('keydown', onKey);
  const observer = new ResizeObserver(entries => { const rect = entries[0].contentRect; if (rect.width < 1 || rect.height < 1) return; width = rect.width; height = rect.height; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); ctx.draw(); }); observer.observe(stage); ctx.draw();
  const onContextLost = e => { e.preventDefault(); if (!disposed) { hint.textContent = 'กำลังพักภาพ 3D · เลื่อนออกแล้วกลับมาเพื่อโหลดใหม่'; } }; renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  return { dispose() { if (disposed) return; disposed = true; tweenId++; cancelAnimationFrame(raf); observer.disconnect(); stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp); renderer.domElement.removeEventListener('keydown', onKey); renderer.domElement.removeEventListener('webglcontextlost', onContextLost); const geometries = new Set(), materials = new Set(); scene.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m)); }); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.forceContextLoss(); root.remove(); } };
}

window.mountVisual = mountVisual;
window.dispatchEvent(new CustomEvent('visuals-ready'));
