import { buildTemporalEffectGeometry, buildTemporalStaticGeometry } from './sceneGeometry';

export type TemporalFocus = 'a1' | 'overlap' | 'cemetery' | 'present';

export type TemporalView = {
  yaw: number;
  pitch: number;
  focus: TemporalFocus;
};

export type TemporalWorld = {
  start: () => void;
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
  attribute float aZone;
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
  varying float vFog;

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
    vColor = aColor * (0.56 + attention * 0.58);
    vFog = clamp((depth - 35.0) / 72.0, 0.0, 0.72);
  }
`;

const STATIC_FRAGMENT = `
  precision mediump float;
  varying vec3 vColor;
  varying float vFog;
  void main() {
    vec3 fog = vec3(0.135, 0.175, 0.155);
    gl_FragColor = vec4(mix(vColor, fog, vFog), 1.0);
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
  varying vec4 vColor;

  void main() {
    vec3 position = aPosition;
    if (aKind < 0.5) {
      position.x += sin(position.y * 0.23 + uTime * 0.11) * 1.05 * uMotion;
      position.y += sin(position.x * 0.12 + uTime * 0.08) * 0.72 * uMotion;
      vColor = vec4(aColor.rgb, aColor.a * (0.22 + uPast * 1.25));
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
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    depth: true,
    powerPreference: 'high-performance',
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
    bufferData(gl, staticGeometry.zones),
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
  let lastDrawAt = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const targetFrameDuration = coarsePointer ? 1000 / 40 : 1000 / 60;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const maxRatio = coarsePointer ? 1.45 : 1.8;
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
    targetYaw = clamp(targetYaw - dx * 0.0046, -1.02, 1.02);
    targetPitch = clamp(targetPitch + dy * 0.0032, -0.34, 0.08);
  };
  const releasePointer = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    canvas.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') targetYaw = clamp(targetYaw - 0.14, -1.02, 1.02);
    else if (event.key === 'ArrowRight') targetYaw = clamp(targetYaw + 0.14, -1.02, 1.02);
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
  gl.clearColor(0.07, 0.105, 0.09, 1);

  const applyCameraUniforms = (
    targetProgram: WebGLProgram,
    camera: readonly number[],
    right: readonly number[],
    up: readonly number[],
    forward: readonly number[],
  ) => {
    uniform3f(gl, targetProgram, 'uCameraPosition', camera);
    uniform3f(gl, targetProgram, 'uCameraRight', right);
    uniform3f(gl, targetProgram, 'uCameraUp', up);
    uniform3f(gl, targetProgram, 'uCameraForward', forward);
    uniform1f(gl, targetProgram, 'uAspect', canvas.width / canvas.height);
    uniform1f(gl, targetProgram, 'uFocal', 1 / Math.tan(radians(68) / 2));
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
    const descent = started && !reducedMotion ? clamp(revealSeconds / 8, 0, 1) * 2.7 : 0;
    const camera = [0, 20 - descent, 34] as const;
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
    bindAttribute(gl, staticProgram, 'aZone', buffers[2], 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[3]);
    applyCameraUniforms(staticProgram, camera, right, up, forward);
    uniform1f(gl, staticProgram, 'uPast', past);
    uniform1f(gl, staticProgram, 'uPresent', present);
    uniform1f(gl, staticProgram, 'uMemorial', memorial);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.drawElements(gl.TRIANGLES, staticGeometry.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(effectProgram);
    bindAttribute(gl, effectProgram, 'aPosition', buffers[4], 3);
    bindAttribute(gl, effectProgram, 'aColor', buffers[5], 4);
    bindAttribute(gl, effectProgram, 'aKind', buffers[6], 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[7]);
    applyCameraUniforms(effectProgram, camera, right, up, forward);
    uniform1f(gl, effectProgram, 'uTime', now / 1000);
    uniform1f(gl, effectProgram, 'uPast', past);
    uniform1f(gl, effectProgram, 'uMemorial', memorial);
    uniform1f(gl, effectProgram, 'uMotion', reducedMotion ? 0 : 1);
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
    applyDeviceOrientation(alpha, beta) {
      if (deviceAlphaOrigin === null) deviceAlphaOrigin = alpha;
      const delta = normalizeAngle(alpha - deviceAlphaOrigin);
      targetYaw = clamp(-radians(delta) * 0.7, -1.02, 1.02);
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
