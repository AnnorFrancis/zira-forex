/* Zira Forex: the hero scene.
   The last 64 real gold sessions as glass candles (emerald up, rose quartz down) with
   champagne wicks, standing in front of a slowly moving malachite stone. three.js r149. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI || {};
  var THREE = window.THREE;
  var api = window.KFHero = { ok: false, rise: function () {}, still: function () {} };
  var canvas = document.querySelector('.hero__gl');
  if (!canvas || !THREE || !KF) return fallback();

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { return fallback(); }
  if (!renderer || !renderer.getContext()) return fallback();

  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x062a20, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x062a20, 0.028);
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.2, 16);

  /* ---------- environment: a small room of soft panels, baked to PMREM ---------- */
  (function env() {
    var room = new THREE.Scene();
    function panel(w, h, color, intensity, pos, rot) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); room.add(m);
    }
    room.background = new THREE.Color(0x0b2a22);
    panel(12, 3, '#ffffff', 4.2, [0, 6, 0], [Math.PI / 2, 0, 0]);
    panel(3, 8, '#ffd9d0', 2.2, [-7, 1, 0], [0, Math.PI / 2, 0]);
    panel(1.2, 8, '#f3d9a6', 4.6, [7, 1, -1], [0, -Math.PI / 2, 0]);
    panel(0.5, 9, '#ffffff', 5.0, [-4, 1, 6], [0, Math.PI * 0.8, 0]);
    panel(10, 4, '#1f6b50', 1.2, [0, -1, -7], null);
    panel(6, 2, '#ffffff', 1.4, [0, 2, 7], [0, Math.PI, 0]);
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(room, 0.035).texture;
    pm.dispose();
  })();

  /* ---------- malachite stone backdrop (procedural bands, drawn behind everything) ---------- */
  var bgMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAspect: { value: 1.6 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: [
      'precision highp float; varying vec2 vUv; uniform float uTime; uniform float uAspect;',
      'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }',
      'float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }',
      'float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.03; a*=0.5; } return v; }',
      'void main(){',
      '  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.2;',
      '  float t = uTime * 0.018;',
      '  float w = fbm(p * 0.9 + vec2(t, -t * 0.6));',
      '  float d1 = length(p - vec2(-1.6, -1.1)) + 0.55 * w;',
      '  float d2 = length(p - vec2(2.1, 1.3)) + 0.45 * fbm(p * 1.3 - t);',
      '  float d = min(d1, d2 * 1.08);',
      '  float b = sin(d * 8.5 + w * 3.2);',
      '  float fine = sin(d * 47.0 + w * 7.0) * 0.5 + 0.5;',
      '  vec3 deep = vec3(0.012, 0.082, 0.058);',
      '  vec3 mid = vec3(0.020, 0.112, 0.081);',
      '  vec3 hi = vec3(0.034, 0.150, 0.108);',
      '  vec3 col = mix(deep, mid, smoothstep(-0.9, 0.9, b));',
      '  col = mix(col, hi, smoothstep(0.9, 1.0, b) * 0.35);',
      '  col *= 0.965 + 0.05 * fine;',
      '  float v = smoothstep(1.55, 0.25, length((vUv - 0.5) * vec2(1.25, 1.0)));',
      '  col *= mix(0.55, 1.0, v);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n'),
    depthWrite: false, fog: false
  });
  var bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bg.position.z = -9; bg.renderOrder = -1;
  scene.add(bg);

  /* ---------- candles from the real data ---------- */
  var data = KF.gold;
  var lo = Infinity, hi = -Infinity;
  data.forEach(function (r) { lo = Math.min(lo, r[3]); hi = Math.max(hi, r[2]); });
  var N = data.length;
  var Y0 = -3.35, Y1 = 1.95;
  function py(p) { return Y0 + (p - lo) / (hi - lo) * (Y1 - Y0); }

  var bull = new THREE.MeshPhysicalMaterial({ color: 0xd6f5e8, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.6, ior: 1.5, attenuationColor: new THREE.Color('#2f9e74'), attenuationDistance: 0.55, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 2.2, iridescence: 0.22, iridescenceIOR: 1.3, transparent: false });
  var bear = new THREE.MeshPhysicalMaterial({ color: 0xffece6, metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.6, ior: 1.5, attenuationColor: new THREE.Color('#e8a196'), attenuationDistance: 0.6, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 2.2, iridescence: 0.22, iridescenceIOR: 1.3 });
  var wickMat = new THREE.MeshStandardMaterial({ color: 0xe8cc94, metalness: 1, roughness: 0.22, envMapIntensity: 1.8 });

  function bodyGeo(w, h) {
    var r = Math.min(0.03, w * 0.22), s = new THREE.Shape();
    var x = -w / 2, y = -w / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + w - r); s.quadraticCurveTo(x + w, y + w, x + w - r, y + w);
    s.lineTo(x + r, y + w); s.quadraticCurveTo(x, y + w, x, y + w - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    var bev = Math.min(0.014, h * 0.25);
    var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, h - bev * 2), bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 2, curveSegments: 3 });
    g.rotateX(-Math.PI / 2);
    g.computeBoundingBox();
    var bb = g.boundingBox; g.translate(0, -(bb.min.y + bb.max.y) / 2, 0);
    return g;
  }
  var wickGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 1, 6, 1);

  var group = new THREE.Group();
  scene.add(group);
  var candles = [];
  var spanX = 18.5, step = spanX / (N - 1), bw = Math.min(0.24, step * 0.7);
  for (var i = 0; i < N; i++) {
    var r = data[i], o = r[1], hgh = r[2], l = r[3], c = r[4];
    var up = c >= o;
    var top = py(Math.max(o, c)), bot = py(Math.min(o, c));
    var hBody = Math.max(0.035, top - bot);
    var xn = i / (N - 1) * 2 - 1;
    var x = -spanX / 2 + i * step;
    var z = 0.9 - 5.2 * xn * xn + 0.25 * Math.sin(i * 0.37);
    var cg = new THREE.Group();
    cg.position.set(x, 0, z);
    var body = new THREE.Mesh(bodyGeo(bw, hBody), up ? bull : bear);
    body.position.y = (top + bot) / 2;
    var wick = new THREE.Mesh(wickGeo, wickMat);
    wick.scale.y = Math.max(0.05, py(hgh) - py(l));
    wick.position.y = (py(hgh) + py(l)) / 2;
    cg.add(wick); cg.add(body);
    group.add(cg);
    candles.push({ g: cg, body: body, wick: wick, baseY: (top + bot) / 2, wickY: wick.position.y, wickS: wick.scale.y, grow: 0, phase: Math.random() * Math.PI * 2, i: i, up: up });
  }

  /* ---------- gold dust ---------- */
  var dustN = small ? 220 : 520;
  var dustPos = new Float32Array(dustN * 3), dustSpd = new Float32Array(dustN);
  for (var d = 0; d < dustN; d++) {
    dustPos[d * 3] = (Math.random() - 0.5) * 20;
    dustPos[d * 3 + 1] = (Math.random() - 0.5) * 11;
    dustPos[d * 3 + 2] = -6 + Math.random() * 9;
    dustSpd[d] = 0.08 + Math.random() * 0.22;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var spr = document.createElement('canvas'); spr.width = spr.height = 64;
  var sx = spr.getContext('2d'); var grd = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,240,210,1)'); grd.addColorStop(0.35, 'rgba(240,210,150,.55)'); grd.addColorStop(1, 'rgba(240,210,150,0)');
  sx.fillStyle = grd; sx.fillRect(0, 0, 64, 64);
  var dustMat = new THREE.PointsMaterial({ size: 0.075, map: new THREE.CanvasTexture(spr), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xf0d6a0, sizeAttenuation: true });
  var dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  var key = new THREE.DirectionalLight(0xfff1df, 0.8); key.position.set(3, 6, 8); scene.add(key);

  /* ---------- sizing ---------- */
  function size() {
    var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the chart readable on tall phones: pull the camera back when narrow
    camera.position.z = w / h < 0.8 ? 19 : (w / h < 1.2 ? 18 : 16);
    camera.updateProjectionMatrix();
    var vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z + 9);
    bg.scale.set(vh * camera.aspect * 1.25, vh * 1.25, 1);
    bgMat.uniforms.uAspect.value = camera.aspect;
  }
  size();
  window.addEventListener('resize', size);

  /* ---------- interaction ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0, scrollP = 0;
  window.addEventListener('pointermove', function (e) { tx = e.clientX / window.innerWidth * 2 - 1; ty = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
  var hero = canvas.closest('.hero');
  function onScroll() { var r = hero.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -r.top / (r.height || 1))); }
  if (UI.onScroll) UI.onScroll(onScroll); else window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- the rise: candles grow in market order ---------- */
  var riseT0 = null, riseOn = false;
  api.rise = function (delay) { riseT0 = performance.now() + (delay || 0) * 1000; riseOn = true; wake(); };
  api.still = function () { riseOn = true; riseT0 = -1e9; candles.forEach(function (c) { c.grow = 1; }); dustMat.opacity = 0.75; draw(0); };

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  var visible = true, running = false, last = performance.now(), time = 0;
  function draw(dt) {
    time += dt;
    mx += (tx - mx) * 0.045; my += (ty - my) * 0.045;
    bgMat.uniforms.uTime.value = time;
    var now = performance.now();
    for (var k = 0; k < candles.length; k++) {
      var c = candles[k];
      if (riseOn) {
        var t = (now - riseT0) / 1000 - k * 0.028;
        c.grow = Math.min(1, Math.max(0, t / 0.95));
      }
      var e = easeOut(c.grow);
      c.body.scale.y = Math.max(0.0001, e);
      c.body.position.y = c.baseY - (1 - e) * 1.2;
      c.wick.scale.y = Math.max(0.0001, c.wickS * e);
      c.wick.position.y = c.wickY - (1 - e) * 1.2;
      c.g.visible = e > 0.001;
      c.g.position.y = Math.sin(time * 0.6 + c.phase) * 0.035;
    }
    if (riseOn && dustMat.opacity < 0.75) dustMat.opacity = Math.min(0.75, dustMat.opacity + dt * 0.4);
    var p = dustGeo.attributes.position.array;
    for (var j = 0; j < dustN; j++) {
      p[j * 3 + 1] += dustSpd[j] * dt;
      p[j * 3] += Math.sin(time * 0.3 + j) * 0.0015;
      if (p[j * 3 + 1] > 5.6) p[j * 3 + 1] = -5.6;
    }
    dustGeo.attributes.position.needsUpdate = true;
    group.rotation.y = mx * 0.09;
    group.rotation.x = my * 0.035;
    group.position.y = scrollP * 2.2;
    camera.position.x = mx * 0.45;
    camera.position.y = 0.2 - my * 0.25 + scrollP * 0.6;
    camera.lookAt(0, scrollP * 0.9, 0);
    renderer.render(scene, camera);
  }
  function loop() {
    if (!visible || document.hidden || UI.reduced) { running = false; return; }
    var n = performance.now(); var dt = Math.min(0.05, (n - last) / 1000); last = n;
    draw(dt);
    requestAnimationFrame(loop);
  }
  function wake() { if (!running && visible && !document.hidden && !UI.reduced) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', wake);
  api.ok = true;
  api.renderOnce = function () { draw(0.016); };
  if (UI.reduced) { api.still(); } else { wake(); }

  /* ---------- no WebGL: the same 64 sessions drawn flat in SVG ---------- */
  function fallback() {
    var host = document.querySelector('.hero__fallback');
    if (!host || !KF) return;
    var dd = KF.gold, L = Infinity, H = -Infinity;
    dd.forEach(function (r) { L = Math.min(L, r[3]); H = Math.max(H, r[2]); });
    var W = 1600, Hh = 900, s = W / dd.length;
    function Y(v) { return Hh * 0.86 - (v - L) / (H - L) * Hh * 0.6; }
    var out = dd.map(function (r, i) {
      var x = i * s + s / 2, up = r[4] >= r[1];
      var t = Y(Math.max(r[1], r[4])), b = Y(Math.min(r[1], r[4]));
      return '<line x1="' + x + '" x2="' + x + '" y1="' + Y(r[2]) + '" y2="' + Y(r[3]) + '" stroke="#dcc391" stroke-width="1.2" opacity=".7"/>' +
        '<rect x="' + (x - s * 0.28) + '" y="' + t + '" width="' + (s * 0.56) + '" height="' + Math.max(2, b - t) + '" rx="2" fill="' + (up ? '#2f9e74' : '#e8b9b0') + '" opacity=".55"/>';
    }).join('');
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + out + '</svg>';
    var cv = document.querySelector('.hero__gl'); if (cv) cv.style.display = 'none';
  }
})();
