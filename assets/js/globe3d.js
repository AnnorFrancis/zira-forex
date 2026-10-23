/* Zira Forex: the tour globe.
   A dark glass globe with champagne land dots, a rose candle on Accra and arcs to every tour city.
   Land comes from Natural Earth 110m (public domain), packed as a 240x120 bitmask so it works offline. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI || {}, THREE = window.THREE;
  var canvas = document.querySelector('.globe-gl');
  var api = window.KFGlobe = { focus: function () {}, ok: false };
  if (!canvas || !THREE || !KF) return;
  var LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF//gD//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////8AAAAAAAAAAAMAAAAAAAAAAAAAAAAAAf////////wAA//gB+AAAA/gAAAAAAAAAAAAAAAOf/////////AAAf8AAAAAAAP+AAAAAAAAAAAAAAHvB+/4//////AAAH+AAAAMAAA/4AAAAAAAAAAAAAP/3//gf////+AAAAAAAAf8AD//+AAf+AAAAAAAAA/ux//wAH////AAAAAAAB4AB////zgPsAAAAAAAAA/////8AB///+AAAAAAADwD//////4P8AAAwAfoAA//5+//4D///8AAAADgAD4P/////////8ABAB//9///////8B///8AAAA//gAD///////////9/wP/////////P+A///AAAAH//7////////////////P/////////P/g//wNYAAH////////////////////////////+f/Af/Af4AAP7/////////////////Dz/////////v+Af4AP4AB///////////////////An////////D/+APwAAAAH/P/////////////////AP///////8APyAHwAAAAH/v//////////////7/gAP/8v////8Af/AAAAAAMH/H//////////////z5AAAfgD/////AP/gAAAAAOD+P////////////4APgAAA/AAf////4P/wAAAAAeB+P////////////wAfgAADgAAf///////8AAAAA/B///////////////AfgAAAAAAX/////f/+AAAAB/3///////////////AeAAAAAAAL////////AAAAB/////////////////AMAAAAAAAD///////3AAAAAP////////////////AAAAAAAAAA///////vgAAAAP////////////////gAAAAAAAAAf//////fgAAAAH///////////////7AAAAAAAAAAf//////4AAAAAB///////////////7AAAAAAAAAAf//////AAAAAA5///zf//////////jgAAAAAAAAA//////wAAAAAB//9/jP//////////HwAAAAAAAAAf/////wAAAAAB/5v////////////4HAAAAAAAAAAf////+AAAAAAB/hn////////////4GAAAAAAAAAAf////+AAAAAAB/hPf//////////5wMAAAAAAAAAAP////8AAAAAAA//2M//////////84cAAAAAAAAAAH////8AAAAAAAf/wHH/////////w/8AAAAAAAAAAH////wAAAAAAA//wAB/////////4vgAAAAAAAAAAB////gAAAAAAB//+fL/////////8OAAAAAAAAAAAA////AAAAAAAB//////////////8MAAAAAAAAAAAA///ngAAAAAAD//////////////8AAAAAAAAAAAAAf/wDoAAAAAAH//////7///////8AAAAAAAAAAAAAP/wB4AAAAAAP////+/////////wAAAAAAAAAAAAAH/gB4AAAAAAf///////3//////8AAAAAAAAAAAAAD/gH4AAAAAAf/////f/8P/////oAAAAAAAAcAAAAAfw/8AAAAAA//////v/8D////+IAAAAAAAAGAAAAAfx4fwAAAAA//////v/4D/+f/4AAAAAAAAACAAAAAP/wf+AAAAAf/////3/4A/4P+wMAAAAAAAAAAAAAAH/wMmAAAAA//////3/wA/wH/AMAAAAAAAAAAAAAAA/+AAAAAAA//////7+AAfgP/gcAAAAAAAAAAAAAAAD+AAAAAAA///////8AAfAB/gOAAAAAAAAAAAAAAAA+AwAAAAA///////2AAfAB/gPAAAAAAAAAAAAAAAAOH9wAAAAf//////+AAPABvgXAAAAAAAAAAAAAAAAP3/wAAAAP//////8AAPABnA3gAAAAAAAAAAAAAAAD//4AAAAH//////8AAHgBiAngAAAAAAAAAAAAAAAAv/9AAAAH//////4AABgA4BngAAAAAAAAAAAAAAAAP//wAAAB/n////4AABAG4DxAAAAAAAAAAAAAAAAAP//wAAAAgH////wAAAAD4HwAAAAAAAAAAAAAAAAAf//4AAAAAA////wAAAAB8fhQAAAAAAAAAAAAAAAA///4AAAAAA////AAAAAB8//wAAAAAAAAAAAAAAAA///+AAAAAB///+AAAAAA8/+XAAAAAAAAAAAAAAAA////8AAAAA///8AAAAAAefcf+DAAAAAAAAAAAAAB////+AAAAAf//4AAAAAAOPd//jgAAAAAAAAAAAAB/////gAAAAf//4AAAAAAHAeB//QAAAAAAAAAAAAB/////gAAAAP//4AAAAAAD8ABP+cAAAAAAAAAAAAAf////gAAAAP//4AAAAAAA/9gf4HAAAAAAAAAAAAAf////gAAAAP//4AAAAAAAB7ADODgAAAAAAAAAAAAP////AAAAAH//4AAAAAAAAAHjCBgAAAAAAAAAAAAP///+AAAAAP//8MAAAAAAAAPzAAAAAAAAAAAAAAAH///+AAAAAP//8cAAAAAAAB/jgAEAgAAAAAAAAAAH///+AAAAAf//58AAAAAAAD/zgAEBgAAAAAAAAAAA///8AAAAAf//58AAAAAAAH//wAEDAAAAAAAAAAAAf//8AAAAAf//h4AAAAAAAP//4AADAAAAAAAAAAAAf//8AAAAAP//B4AAAAAAB///8AYAAAAAAAAAAAAAf//4AAAAAH//DwAAAAAAH///+AcAAAAAAAAAAAAAf//4AAAAAH//DwAAAAAAH///+AAAAAAAAAAAAAAAf//AAAAAAH//BwAAAAAAH////AAAAAAAAAAAAAAA//8AAAAAAH/8AgAAAAAAH////gAAAAAAAAAAAAAA//8AAAAAAD/8AAAAAAAAD////gAAAAAAAAAAAAAA//8AAAAAAD/8AAAAAAAAD////gAAAAAAAAAAAAAA//4AAAAAAB/4AAAAAAAAD////gAAAAAAAAAAAAAA//wAAAAAAB/wAAAAAAAAB/7//AAAAAAAAAAAAAAA//gAAAAAAA/gAAAAAAAAD+B//AAQAAAAAAAAAAAB//AAAAAAAAQAAAAAAAAABwA/+AAYAAAAAAAAAAAD/+AAAAAAAAAAAAAAAAAAAAAH+AAcAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAH8AAPAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAQAAeAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAA4AA8AAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAA4ABwAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAQADwAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAH+AAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAH4cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAABwAAAAMEAAgAAAAAAAAAAAAAAAAPgAAAAAAAAAAAP8gA///////wAAAAAAAAAAAAAAAfAAAAAAAAAADH//+D////////wAAAAAAAAAAAAAA/gAAAAAADv7////+//////////AAAAAAAAAAHwAH/gAAAAD////////////////////gAAAAABqAP/8r/wAAAAf////////////////////gAAAAH///P////wAAAA////////////////////+AAAAD/////////AAAB/////////////////////wAAAP/////////gACAf/////////////////////wAAD/////////+AAPw//////////////////////8AAAgH////////n5/wf/////////////////////AAAAH//////////4////////////////////////wAAgB///////////////////////////////////+A////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false }); } catch (e) { canvas.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x062a20, 1);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  // soft environment for the glass
  (function () {
    var room = new THREE.Scene(); room.background = new THREE.Color(0x0b2a22);
    function p(w, h, c, k, pos, rot) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); room.add(m); }
    p(10, 3, '#ffffff', 3.5, [0, 6, 0], [Math.PI / 2, 0, 0]); p(2, 8, '#f3d9a6', 3.5, [7, 0, 0], [0, -Math.PI / 2, 0]); p(3, 8, '#ffd9d0', 1.8, [-7, 0, 0], [0, Math.PI / 2, 0]);
    var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(room, 0.04).texture; pm.dispose();
  })();

  var R = 2.2;
  var world = new THREE.Group(); scene.add(world);
  var core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 96, 64), new THREE.MeshStandardMaterial({ color: 0x04201a, roughness: 0.85, metalness: 0, envMapIntensity: 0.12 }));
  world.add(core);
  // a thin rim of light instead of a full glass shell, so the land stays legible
  var shell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 96, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: { c1: { value: new THREE.Color('#e8b9b0') }, c2: { value: new THREE.Color('#dcc391') } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c1; uniform vec3 c2; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.2); vec3 c = mix(c2, c1, smoothstep(0.2, 0.9, vN.y * 0.5 + 0.5)); gl_FragColor = vec4(c * f * 0.9, f * 0.9); }'
  }));
  scene.add(shell);

  function v3(lat, lng, r) {
    var phi = (90 - lat) * Math.PI / 180, th = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  }

  // land dots
  var raw = atob(LAND), W = 240, H = 120;
  function land(x, y) { var i = y * (W / 8) + (x >> 3); return (raw.charCodeAt(i) >> (7 - (x & 7))) & 1; }
  var pts = [];
  for (var lat = -84; lat <= 84; lat += 1.55) {
    var ring = Math.max(8, Math.round(232 * Math.cos(lat * Math.PI / 180)));
    for (var k = 0; k < ring; k++) {
      var lng = -180 + k * 360 / ring;
      var x = Math.min(W - 1, Math.floor((lng + 180) / 360 * W)), y = Math.min(H - 1, Math.floor((90 - lat) / 180 * H));
      if (land(x, y)) { var p = v3(lat, lng, R * 1.002); pts.push(p.x, p.y, p.z); }
    }
  }
  var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  var spr = document.createElement('canvas'); spr.width = spr.height = 32; var c2 = spr.getContext('2d');
  c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(16, 16, 13, 0, Math.PI * 2); c2.fill();
  var dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.04, map: new THREE.CanvasTexture(spr), color: 0xf2dcae, transparent: true, alphaTest: 0.4, sizeAttenuation: true }));
  world.add(dots);

  // the candles on the cities, and the arcs from Accra
  var accra = KF.tour.filter(function (t) { return t.id === 'accra'; })[0];
  var home = v3(accra.lat, accra.lng, R);
  var arcs = [], markers = {};
  var bullMat = new THREE.MeshPhysicalMaterial({ color: 0xd6f5e8, roughness: 0.05, transmission: 1, thickness: 0.2, attenuationColor: new THREE.Color('#2f9e74'), attenuationDistance: 0.3, envMapIntensity: 2, clearcoat: 1 });
  var roseMat = new THREE.MeshStandardMaterial({ color: 0xe8b9b0, roughness: 0.3, metalness: 0.1, emissive: 0x8e3e36, emissiveIntensity: 0.25 });
  var wickMat = new THREE.MeshStandardMaterial({ color: 0xe8cc94, metalness: 1, roughness: 0.25 });
  KF.tour.forEach(function (t) {
    var pos = v3(t.lat, t.lng, R);
    var g = new THREE.Group(); g.position.copy(pos); g.lookAt(pos.clone().multiplyScalar(2));
    var isHome = t.id === 'accra';
    var bh = isHome ? 0.34 : 0.22;
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, bh), isHome ? roseMat : bullMat); body.position.z = bh / 2 + 0.04;
    var wick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, bh + 0.16, 6), wickMat); wick.rotation.x = Math.PI / 2; wick.position.z = bh / 2 + 0.04;
    g.add(wick); g.add(body); world.add(g);
    markers[t.id] = { g: g, body: body, t: t };
    if (isHome) return;
    var mid = home.clone().add(pos).multiplyScalar(0.5); var lift = 1 + home.distanceTo(pos) * 0.32; mid.normalize().multiplyScalar(R * lift);
    var curve = new THREE.QuadraticBezierCurve3(home.clone(), mid, pos.clone());
    var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.0075, 6, false), new THREE.MeshBasicMaterial({ color: 0xdcc391, transparent: true, opacity: 0.55 }));
    world.add(tube);
    var spark = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff1d6 }));
    world.add(spark);
    arcs.push({ curve: curve, spark: spark, off: Math.random(), id: t.id, tube: tube });
  });

  var key = new THREE.DirectionalLight(0xfff1df, 0.7); key.position.set(4, 3, 6); scene.add(key);
  scene.add(new THREE.AmbientLight(0x406a5c, 0.35));

  function size() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    var narrow = w / h < 1;
    var sx = narrow ? 0 : 2.15, sy = narrow ? -2.1 : -0.2;
    world.position.set(sx, sy, 0); shell.position.copy(world.position);
    camera.position.z = narrow ? 13 : 11;
  }
  size(); window.addEventListener('resize', size);

  // rotation: idle spin, drag, and focus on a city
  var rotY = -accra.lng * Math.PI / 180 - Math.PI / 2 + 0.6, rotX = 0.18, tRotY = rotY, tRotX = rotX, dragging = false, lx = 0, ly = 0, idle = true;
  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('pointerdown', function (e) { dragging = true; idle = false; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', function (e) { if (!dragging) return; tRotY += (e.clientX - lx) * 0.006; tRotX = Math.max(-0.6, Math.min(0.8, tRotX + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY; });
  canvas.addEventListener('pointerup', function () { dragging = false; setTimeout(function () { idle = true; }, 2500); });
  var focusId = null;
  api.focus = function (id) {
    var m = markers[id]; if (!m) return; focusId = id; idle = false;
    var t = m.t; var target = -t.lng * Math.PI / 180 - Math.PI / 2;
    while (target - tRotY > Math.PI) target -= Math.PI * 2; while (target - tRotY < -Math.PI) target += Math.PI * 2;
    tRotY = target; tRotX = t.lat * Math.PI / 180 * 0.8;
    clearTimeout(api._t); api._t = setTimeout(function () { idle = true; }, 6000);
  };

  var vis = true, last = performance.now(), time = 0;
  new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) loop(); }, { threshold: 0 }).observe(canvas);
  function frame(dt) {
    time += dt;
    if (idle && !UI.reduced) tRotY += dt * 0.06;
    rotY += (tRotY - rotY) * 0.05; rotX += (tRotX - rotX) * 0.05;
    world.rotation.set(rotX, rotY, 0);
    arcs.forEach(function (a) {
      var u = (time * 0.22 + a.off) % 1; a.spark.position.copy(a.curve.getPoint(u));
      var on = a.id === focusId; a.tube.material.opacity += ((on ? 0.95 : 0.45) - a.tube.material.opacity) * 0.08;
    });
    Object.keys(markers).forEach(function (id) { var m = markers[id]; var s = id === focusId ? 1.5 : 1; m.g.scale.x += (s - m.g.scale.x) * 0.1; m.g.scale.y = m.g.scale.x; m.g.scale.z += (s - m.g.scale.z) * 0.1; });
    renderer.render(scene, camera);
  }
  var running = false;
  function loop() {
    if (running) return; running = true;
    (function tick() {
      if (!vis || document.hidden) { running = false; return; }
      var n = performance.now(); var dt = Math.min(0.05, (n - last) / 1000); last = n;
      frame(dt); requestAnimationFrame(tick);
    })();
  }
  document.addEventListener('visibilitychange', function () { last = performance.now(); loop(); });
  api.ok = true;
  if (UI.reduced) frame(0.016); else loop();
})();
