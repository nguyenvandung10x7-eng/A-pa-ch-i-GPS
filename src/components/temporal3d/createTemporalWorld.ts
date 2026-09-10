import { buildTemporalEffectGeometry, buildTemporalStaticGeometry } from './sceneGeometry';

export type TemporalFocus = 'a1' | 'overlap' | 'cemetery' | 'present';

export type TemporalView = {
  yaw: number;
  pitch: number;
  focus: TemporalFocus;
};

export type TemporalWorld = {
  start: () => void;
  enterRift: () => void;
  applyDeviceOrientation: (alpha: number, beta: number) => void;
  resetDeviceOrientation: () => void;
  destroy: () => void;
};

type TemporalWorldOptions = {
  onReady: () => void;
  onViewChange: (view: TemporalView) => void;
  onUnavailable: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const radians = (degrees: number) => degrees * Math.PI / 180;

const normalizeAngle = (degrees: number) => {
  let normalized = degrees % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
};

const focusForYaw = (yaw: number): TemporalFocus => {
  if (yaw < -0.3) return 'a1';
  if (yaw < 0.12) return 'overlap';
  if (yaw < 0.45) return 'cemetery';
  return 'present';
};

const angularWeight = (yaw: number, target: number, radius: number) =>
  0.28 + 0.72 * (1 - clamp(Math.abs(yaw - target) / radius, 0, 1));

const shader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const compiled = gl.createShader(type);
  if (!compiled) throw new Error('temporal-webgl-shader-allocation');
  gl.shaderSource(compiled, source);
  gl.compileShader(compiled);
  if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
    const reason = gl.getShaderInfoLog(compiled) || 'unknown-shader-error';
    gl.deleteShader(compiled);
    throw new Error(reason);
  }
  return compiled;
};

const program = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
  const vertex = shader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const linked = gl.createProgram();
  if (!linked) throw new Error('temporal-webgl-program-allocation');
  gl.attachShader(linked, vertex);
  gl.attachShader(linked, fragment);
  gl.linkProgram(linked);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) {
    const reason = gl.getProgramInfoLog(linked) || 'unknown-program-error';
    gl.deleteProgram(linked);
    throw new Error(reason);
  }
  return linked;
};

const STATIC_VERTEX = `
  precision highp float;
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute vec3 aNormal;
  attribute float aZone;
  attribute float aMaterial;
  uniform vec3 uCameraPosition;
  uniform vec3 uCameraRight;
  uniform vec3 uCameraUp;
  uniform vec3 uCameraForward;
  uniform float uAspect;
  uniform float uFocal;
  uniform float uPast;
  uniform float uPresent;
  uniform float uMemorial;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vFog;
  varying float vMaterial;
  varying float vZone;
  varying float vBoundary;

  void main() {
    vec3 relative = aPosition - uCameraPosition;
    float depth = max(0.01, dot(relative, uCameraForward));
    vec3 view = vec3(dot(relative, uCameraRight), dot(relative, uCameraUp), depth);
    float nearPlane = 0.4;
    float farPlane = 145.0;
    float clipZ = ((farPlane + nearPlane) / (farPlane - nearPlane)) * depth
      - ((2.0 * farPlane * nearPlane) / (farPlane - nearPlane));
    gl_Position = vec4(view.x * uFocal / uAspect, view.y * uFocal, clipZ, depth);

    float neutralMask = 1.0 - step(0.5, abs(aZone));
    float pastMask = 1.0 - step(0.5, abs(aZone - 1.0));
    float presentMask = 1.0 - step(0.5, abs(aZone - 2.0));
    float memorialMask = 1.0 - step(0.5, abs(aZone - 3.0));
    float attention = neutralMask + pastMask * uPast + presentMask * uPresent + memorialMask * uMemorial;
    float boundaryWave = sin(aPosition.z * 0.12 + aPosition.y * 0.31) * 1.7
      + sin(aPosition.y * 0.61) * 0.65;
    float a1Boundary = 1.0 - smoothstep(-5.5, 2.2, aPosition.x + boundaryWave);
    vBoundary = mix(1.0, a1Boundary, pastMask);
    vColor = aColor * (0.76 + attention * 0.28);
    vNormal = aNormal;
    vWorldPosition = aPosition;
    vMaterial = aMaterial;
    vZone = aZone;
    vFog = clamp((depth - 34.0) / 76.0, 0.0, 0.78);
  }
`;

const STATIC_FRAGMENT = `
  precision mediump float;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vFog;
  varying float vMaterial;
  varying float vZone;
  varying float vBoundary;

  float materialMask(float value) {
    return 1.0 - step(0.45, abs(vMaterial - value));
  }

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) normal = -normal;
    vec3 sunDirection = normalize(vec3(-0.46, 0.79, 0.34));
    float direct = max(dot(normal, sunDirection), 0.0);
    float sky = 0.42 + max(normal.y, 0.0) * 0.2;
    float bounce = max(dot(normal, normalize(vec3(0.25, 0.25, -0.92))), 0.0) * 0.12;

    float earth = materialMask(1.0);
    float trench = materialMask(2.0);
    float vegetation = materialMask(3.0);
    float metal = materialMask(5.0);
    float memorial = materialMask(6.0);
    float cell = hash21(floor(vWorldPosition.xz * mix(0.85, 1.65, earth + trench)));
    float strata = sin(vWorldPosition.x * 2.7 + vWorldPosition.z * 1.9) * 0.5 + 0.5;
    float surface = 0.92 + (cell - 0.5) * (0.14 * earth + 0.1 * vegetation + 0.04 * memorial);
    surface *= 0.94 + strata * (0.07 * earth + 0.035 * trench);

    float light = sky + direct * 0.72 + bounce;
    vec3 warmSun = vec3(1.06, 1.0, 0.86);
    vec3 color = vColor * surface * mix(vec3(light), warmSun * light, direct * 0.38);
    color *= 1.0 - trench * 0.16;
    color += metal * direct * 0.035;
    color = mix(color, color * vec3(0.92, 0.97, 0.93), memorial * 0.3);

    vec3 fog = vec3(0.31, 0.35, 0.32);
    color = mix(color, fog, vFog);
    color = color / (color + vec3(0.72));
    color = pow(color, vec3(0.92));

    float memorialZone = 1.0 - step(0.5, abs(vZone - 3.0));
    float alpha = mix(vBoundary, 0.72, memorialZone) * (1.0 - vFog * 0.22);
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const EFFECT_VERTEX = `
  precision highp float;
  attribute vec3 aPosition;
  attribute vec4 aColor;
  attribute float aKind;
  uniform vec3 uCameraPosition;
  uniform vec3 uCameraRight;
  uniform vec3 uCameraUp;
  uniform vec3 uCameraForward;
  uniform float uAspect;
  uniform float uFocal;
  uniform float uTime;
  uniform float uPast;
  uniform float uMemorial;
  uniform float uMotion;
  uniform float uTransition;
  varying vec4 vColor;

  void main() {
    vec3 position = aPosition;
    if (aKind < 0.5) {
      position.x += sin(position.y * 0.23 + uTime * 0.11) * (1.05 + uTransition * 1.8) * uMotion;
      position.y += sin(position.x * 0.12 + uTime * 0.08) * (0.72 + uTransition) * uMotion;
      vColor = vec4(aColor.rgb, aColor.a * (0.22 + uPast * 1.25) * (1.0 + uTransition * 1.8));
    } else {
      position.x += sin(position.z * 0.09 + uTime * 0.045) * 2.4 * uMotion;
      position.z += cos(position.x * 0.07 + uTime * 0.04) * 1.2 * uMotion;
      vColor = vec4(aColor.rgb, aColor.a * (0.7 + uMemorial * 0.45));
    }

    vec3 relative = position - uCameraPosition;
    float depth = max(0.01, dot(relative, uCameraForward));
    vec3 view = vec3(dot(relative, uCameraRight), dot(relative, uCameraUp), depth);
    float nearPlane = 0.4;
    float farPlane = 145.0;
    float clipZ = ((farPlane + nearPlane) / (farPlane - nearPlane)) * depth
      - ((2.0 * farPlane * nearPlane) / (farPlane - nearPlane));
    gl_Position = vec4(view.x * uFocal / uAspect, view.y * uFocal, clipZ, depth);
  }
`;

const EFFECT_FRAGMENT = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

const bufferData = (gl: WebGLRenderingContext, data: Float32Array | Uint16Array, target: number = gl.ARRAY_BUFFER) => {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('temporal-webgl-buffer-allocation');
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data as unknown as BufferSource, gl.STATIC_DRAW);
  return buffer;
};

const bindAttribute = (
  gl: WebGLRenderingContext,
  targetProgram: WebGLProgram,
  name: string,
  buffer: WebGLBuffer,
  size: number,
) => {
  const location = gl.getAttribLocation(targetProgram, name);
  if (location < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
};

const uniform1f = (gl: WebGLRenderingContext, targetProgram: WebGLProgram, name: string, value: number) => {
  const location = gl.getUniformLocation(targetProgram, name);
  if (location) gl.uniform1f(location, value);
};

const uniform3f = (gl: WebGLRenderingContext, targetProgram: WebGLProgram, name: string, value: readonly number[]) => {
  const location = gl.getUniformLocation(targetProgram, name);
  if (location) gl.uniform3f(location, value[0], value[1], value[2]);
};

export const createTemporalWorld = (canvas: HTMLCanvasElement, options: TemporalWorldOptions): TemporalWorld => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const deviceMemory = 'deviceMemory' in navigator
    ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory)
    : undefined;
  const lowEndDevice = coarsePointer && typeof deviceMemory === 'number' && deviceMemory <= 4;
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: !lowEndDevice,
    depth: true,
    powerPreference: lowEndDevice ? 'low-power' : 'high-performance',
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) throw new Error('temporal-webgl-unavailable');

  const staticProgram = program(gl, STATIC_VERTEX, STATIC_FRAGMENT);
  const effectProgram = program(gl, EFFECT_VERTEX, EFFECT_FRAGMENT);
  const staticGeometry = buildTemporalStaticGeometry();
  const effectGeometry = buildTemporalEffectGeometry();
  const buffers = [
    bufferData(gl, staticGeometry.positions),
    bufferData(gl, staticGeometry.colors),
    bufferData(gl, staticGeometry.normals),
    bufferData(gl, staticGeometry.zones),
    bufferData(gl, staticGeometry.materials),
    bufferData(gl, staticGeometry.indices, gl.ELEMENT_ARRAY_BUFFER),
    bufferData(gl, effectGeometry.positions),
    bufferData(gl, effectGeometry.colors),
    bufferData(gl, effectGeometry.kinds),
    bufferData(gl, effectGeometry.indices, gl.ELEMENT_ARRAY_BUFFER),
  ];

  let destroyed = false;
  let started = false;
  let frame = 0;
  let currentYaw = -0.04;
  let targetYaw = -0.04;
  let currentPitch = -0.18;
  let targetPitch = -0.18;
  let pointerId: number | null = null;
  let pointerX = 0;
  let pointerY = 0;
  let deviceAlphaOrigin: number | null = null;
  let lastReportedAt = 0;
  let lastFocus: TemporalFocus | null = null;
  let startedAt = 0;
  let transitionStartedAt = 0;
  let lastDrawAt = 0;
  const targetFrameDuration = lowEndDevice ? 1000 / 32 : coarsePointer ? 1000 / 42 : 1000 / 60;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const maxRatio = lowEndDevice ? 1.15 : coarsePointer ? 1.4 : 1.75;
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const onPointerDown = (event: PointerEvent) => {
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  };
  const onPointerMove = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - pointerX;
    const dy = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    targetYaw = clamp(targetYaw - dx * 0.0037, -0.78, 0.78);
    targetPitch = clamp(targetPitch + dy * 0.0032, -0.34, 0.08);
  };
  const releasePointer = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    canvas.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') targetYaw = clamp(targetYaw - 0.12, -0.78, 0.78);
    else if (event.key === 'ArrowRight') targetYaw = clamp(targetYaw + 0.12, -0.78, 0.78);
    else if (event.key === 'ArrowUp') targetPitch = clamp(targetPitch - 0.08, -0.34, 0.08);
    else if (event.key === 'ArrowDown') targetPitch = clamp(targetPitch + 0.08, -0.34, 0.08);
    else return;
    event.preventDefault();
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (!destroyed) options.onUnavailable();
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('webglcontextlost', onContextLost);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const applyCameraUniforms = (
    targetProgram: WebGLProgram,
    camera: readonly number[],
    right: readonly number[],
    up: readonly number[],
    forward: readonly number[],
    fieldOfView: number,
  ) => {
    uniform3f(gl, targetProgram, 'uCameraPosition', camera);
    uniform3f(gl, targetProgram, 'uCameraRight', right);
    uniform3f(gl, targetProgram, 'uCameraUp', up);
    uniform3f(gl, targetProgram, 'uCameraForward', forward);
    uniform1f(gl, targetProgram, 'uAspect', canvas.width / canvas.height);
    uniform1f(gl, targetProgram, 'uFocal', 1 / Math.tan(radians(fieldOfView) / 2));
  };

  const render = (now: number) => {
    if (destroyed) return;
    frame = window.requestAnimationFrame(render);
    if (document.hidden || now - lastDrawAt < targetFrameDuration) return;
    lastDrawAt = now;

    const easing = reducedMotion ? 1 : 0.075;
    currentYaw += (targetYaw - currentYaw) * easing;
    currentPitch += (targetPitch - currentPitch) * easing;
    const revealSeconds = started && startedAt ? (now - startedAt) / 1000 : 0;
    const descent = started && !reducedMotion ? clamp(revealSeconds / 8, 0, 1) * 1.15 : 0;
    const transition = transitionStartedAt ? clamp((now - transitionStartedAt) / 1250, 0, 1) : 0;
    const transitionEase = transition * transition * (3 - 2 * transition);
    const camera = [-transitionEase * 3.1, 20 - descent - transitionEase * 3.8, 34 - transitionEase * 18.5] as const;
    const cosPitch = Math.cos(currentPitch);
    const forward = [
      Math.sin(currentYaw) * cosPitch,
      Math.sin(currentPitch),
      -Math.cos(currentYaw) * cosPitch,
    ] as const;
    const rightLength = Math.hypot(-forward[2], forward[0]) || 1;
    const right = [-forward[2] / rightLength, 0, forward[0] / rightLength] as const;
    const up = [
      -right[2] * forward[1],
      right[2] * forward[0] - right[0] * forward[2],
      right[0] * forward[1],
    ] as const;
    const past = angularWeight(currentYaw, -0.56, 0.92);
    const present = angularWeight(currentYaw, 0.68, 0.95);
    const memorial = angularWeight(currentYaw, 0.27, 0.58);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(staticProgram);
    bindAttribute(gl, staticProgram, 'aPosition', buffers[0], 3);
    bindAttribute(gl, staticProgram, 'aColor', buffers[1], 3);
    bindAttribute(gl, staticProgram, 'aNormal', buffers[2], 3);
    bindAttribute(gl, staticProgram, 'aZone', buffers[3], 1);
    bindAttribute(gl, staticProgram, 'aMaterial', buffers[4], 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[5]);
    applyCameraUniforms(staticProgram, camera, right, up, forward, 68 - transitionEase * 11);
    uniform1f(gl, staticProgram, 'uPast', past);
    uniform1f(gl, staticProgram, 'uPresent', present);
    uniform1f(gl, staticProgram, 'uMemorial', memorial);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);
    gl.drawElements(gl.TRIANGLES, staticGeometry.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(effectProgram);
    bindAttribute(gl, effectProgram, 'aPosition', buffers[6], 3);
    bindAttribute(gl, effectProgram, 'aColor', buffers[7], 4);
    bindAttribute(gl, effectProgram, 'aKind', buffers[8], 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[9]);
    applyCameraUniforms(effectProgram, camera, right, up, forward, 68 - transitionEase * 11);
    uniform1f(gl, effectProgram, 'uTime', now / 1000);
    uniform1f(gl, effectProgram, 'uPast', past);
    uniform1f(gl, effectProgram, 'uMemorial', memorial);
    uniform1f(gl, effectProgram, 'uMotion', reducedMotion ? 0 : 1);
    uniform1f(gl, effectProgram, 'uTransition', transitionEase);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.drawElements(gl.TRIANGLES, effectGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.depthMask(true);

    const focus = focusForYaw(currentYaw);
    if (focus !== lastFocus || now - lastReportedAt > 90) {
      lastFocus = focus;
      lastReportedAt = now;
      options.onViewChange({ yaw: currentYaw, pitch: currentPitch, focus });
    }
  };

  frame = window.requestAnimationFrame(render);
  window.requestAnimationFrame(() => options.onReady());

  return {
    start() {
      if (started) return;
      started = true;
      startedAt = performance.now();
      if (!reducedMotion) targetPitch = -0.13;
    },
    enterRift() {
      if (!started || transitionStartedAt) return;
      transitionStartedAt = performance.now();
      targetYaw = -0.14;
      targetPitch = -0.13;
    },
    applyDeviceOrientation(alpha, beta) {
      if (deviceAlphaOrigin === null) deviceAlphaOrigin = alpha;
      const delta = normalizeAngle(alpha - deviceAlphaOrigin);
      targetYaw = clamp(-radians(delta) * 0.55, -0.78, 0.78);
      targetPitch = clamp(-0.17 + radians(beta - 45) * 0.18, -0.34, 0.08);
    },
    resetDeviceOrientation() {
      deviceAlphaOrigin = null;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', releasePointer);
      canvas.removeEventListener('pointercancel', releasePointer);
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      gl.deleteProgram(staticProgram);
      gl.deleteProgram(effectProgram);
    },
  };
};
