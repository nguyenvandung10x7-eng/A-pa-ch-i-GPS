export type Vec3 = readonly [number, number, number];
export type Color3 = readonly [number, number, number];

export const TEMPORAL_ZONE = {
  neutral: 0,
  a1: 1,
  present: 2,
  memorial: 3,
} as const;

export const TEMPORAL_MATERIAL = {
  ground: 0,
  earth: 1,
  trench: 2,
  vegetation: 3,
  timber: 4,
  metal: 5,
  memorial: 6,
} as const;

type TemporalZone = (typeof TEMPORAL_ZONE)[keyof typeof TEMPORAL_ZONE];
type TemporalMaterial = (typeof TEMPORAL_MATERIAL)[keyof typeof TEMPORAL_MATERIAL];

export type StaticGeometry = {
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;
  zones: Float32Array;
  materials: Float32Array;
  indices: Uint16Array;
};

export type EffectGeometry = {
  positions: Float32Array;
  colors: Float32Array;
  kinds: Float32Array;
  indices: Uint16Array;
};

const normalFor = (a: Vec3, b: Vec3, c: Vec3): Vec3 => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = ab[1] * ac[2] - ab[2] * ac[1];
  const ny = ab[2] * ac[0] - ab[0] * ac[2];
  const nz = ab[0] * ac[1] - ab[1] * ac[0];
  const length = Math.hypot(nx, ny, nz);
  return length > 0.0001 ? [nx / length, ny / length, nz / length] : [0, 1, 0];
};

class StaticBuilder {
  private positions: number[] = [];
  private colors: number[] = [];
  private normals: number[] = [];
  private zones: number[] = [];
  private materials: number[] = [];
  private indices: number[] = [];

  private vertex(point: Vec3, color: Color3, normal: Vec3, zone: TemporalZone, material: TemporalMaterial) {
    const index = this.positions.length / 3;
    this.positions.push(...point);
    this.colors.push(...color);
    this.normals.push(...normal);
    this.zones.push(zone);
    this.materials.push(material);
    return index;
  }

  triangle(a: Vec3, b: Vec3, c: Vec3, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const normal = normalFor(a, b, c);
    const offset = this.vertex(a, color, normal, zone, material);
    this.vertex(b, color, normal, zone, material);
    this.vertex(c, color, normal, zone, material);
    this.indices.push(offset, offset + 1, offset + 2);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const normal = normalFor(a, b, d);
    const offset = this.vertex(a, color, normal, zone, material);
    this.vertex(b, color, normal, zone, material);
    this.vertex(c, color, normal, zone, material);
    this.vertex(d, color, normal, zone, material);
    this.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  }

  box(center: Vec3, size: Vec3, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const [x, y, z] = center;
    const [w, h, d] = size;
    const x0 = x - w / 2;
    const x1 = x + w / 2;
    const y0 = y - h / 2;
    const y1 = y + h / 2;
    const z0 = z - d / 2;
    const z1 = z + d / 2;
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], color, zone, material);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], color, zone, material);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], color, zone, material);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], color, zone, material);
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], color, zone, material);
  }

  cylinder(center: Vec3, radius: number, height: number, sides: number, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const [x, y, z] = center;
    const y0 = y - height / 2;
    const y1 = y + height / 2;
    for (let index = 0; index < sides; index += 1) {
      const angle0 = index / sides * Math.PI * 2;
      const angle1 = (index + 1) / sides * Math.PI * 2;
      const a: Vec3 = [x + Math.cos(angle0) * radius, y0, z + Math.sin(angle0) * radius];
      const b: Vec3 = [x + Math.cos(angle1) * radius, y0, z + Math.sin(angle1) * radius];
      const c: Vec3 = [b[0], y1, b[2]];
      const d: Vec3 = [a[0], y1, a[2]];
      this.quad(a, b, c, d, color, zone, material);
      this.triangle([x, y1, z], d, c, color, zone, material);
    }
  }

  ellipsoid(center: Vec3, radii: Vec3, sides: number, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const [cx, cy, cz] = center;
    const [rx, ry, rz] = radii;
    const bands = 4;
    const point = (latitude: number, longitude: number): Vec3 => [
      cx + Math.cos(latitude) * Math.cos(longitude) * rx,
      cy + Math.sin(latitude) * ry,
      cz + Math.cos(latitude) * Math.sin(longitude) * rz,
    ];
    for (let band = 0; band < bands; band += 1) {
      const latitude0 = -Math.PI / 2 + band / bands * Math.PI;
      const latitude1 = -Math.PI / 2 + (band + 1) / bands * Math.PI;
      for (let side = 0; side < sides; side += 1) {
        const longitude0 = side / sides * Math.PI * 2;
        const longitude1 = (side + 1) / sides * Math.PI * 2;
        this.quad(
          point(latitude0, longitude0),
          point(latitude0, longitude1),
          point(latitude1, longitude1),
          point(latitude1, longitude0),
          color,
          zone,
          material,
        );
      }
    }
  }

  strip(a: Vec3, b: Vec3, width: number, color: Color3, zone: TemporalZone, material: TemporalMaterial) {
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const length = Math.hypot(dx, dz) || 1;
    const px = -dz / length * width / 2;
    const pz = dx / length * width / 2;
    this.quad(
      [a[0] + px, a[1], a[2] + pz],
      [b[0] + px, b[1], b[2] + pz],
      [b[0] - px, b[1], b[2] - pz],
      [a[0] - px, a[1], a[2] - pz],
      color,
      zone,
      material,
    );
  }

  build(): StaticGeometry {
    if (this.positions.length / 3 > 65_535) throw new Error('temporal-scene-geometry-too-large');
    return {
      positions: new Float32Array(this.positions),
      colors: new Float32Array(this.colors),
      normals: new Float32Array(this.normals),
      zones: new Float32Array(this.zones),
      materials: new Float32Array(this.materials),
      indices: new Uint16Array(this.indices),
    };
  }
}

class EffectBuilder {
  private positions: number[] = [];
  private colors: number[] = [];
  private kinds: number[] = [];
  private indices: number[] = [];

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: readonly [number, number, number, number], kind: number) {
    const offset = this.positions.length / 3;
    [a, b, c, d].forEach((point) => {
      this.positions.push(...point);
      this.colors.push(...color);
      this.kinds.push(kind);
    });
    this.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  }

  build(): EffectGeometry {
    return {
      positions: new Float32Array(this.positions),
      colors: new Float32Array(this.colors),
      kinds: new Float32Array(this.kinds),
      indices: new Uint16Array(this.indices),
    };
  }
}

const craterCenters = [
  [-18, -10, 2.25],
  [-10, -17.5, 2.8],
  [-23, -23, 2.45],
  [-6, -8, 1.7],
] as const;

const terrainHeight = (x: number, z: number) => {
  const hill = 11.9 * Math.exp(-(((x + 15) ** 2) / 225 + ((z + 16) ** 2) / 305));
  const shoulder = 3.6 * Math.exp(-(((x + 27) ** 2) / 180 + ((z + 12) ** 2) / 270));
  const roughness = Math.sin(x * 0.72 + z * 0.17) * 0.3 + Math.sin(z * 0.58) * 0.22;
  const craterDepth = craterCenters.reduce((sum, [cx, cz, radius]) => {
    const distance = ((x - cx) ** 2 + (z - cz) ** 2) / (radius ** 2);
    return sum + 1.3 * Math.exp(-distance * 1.7);
  }, 0);
  return 0.05 + hill + shoulder + roughness - craterDepth;
};

export const TerrainA11954 = (builder: StaticBuilder) => {
  const xMin = -40;
  const xMax = 3;
  const zMin = -45;
  const zMax = 13;
  const columns = 32;
  const rows = 36;
  const dx = (xMax - xMin) / columns;
  const dz = (zMax - zMin) / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x0 = xMin + column * dx;
      const x1 = x0 + dx;
      const z0 = zMin + row * dz;
      const z1 = z0 + dz;
      const patch = Math.sin(column * 1.91 + row * 0.73) * 0.5 + 0.5;
      const livingPatch = Math.sin(column * 0.43 - row * 0.61) > 0.54;
      const color: Color3 = livingPatch
        ? [0.17 + patch * 0.03, 0.23 + patch * 0.035, 0.13 + patch * 0.018]
        : [0.28 + patch * 0.052, 0.18 + patch * 0.034, 0.105 + patch * 0.018];
      builder.quad(
        [x0, terrainHeight(x0, z0), z0],
        [x1, terrainHeight(x1, z0), z0],
        [x1, terrainHeight(x1, z1), z1],
        [x0, terrainHeight(x0, z1), z1],
        color,
        TEMPORAL_ZONE.a1,
        TEMPORAL_MATERIAL.earth,
      );
    }
  }

  craterCenters.forEach(([cx, cz, radius]) => {
    const segments = 14;
    for (let index = 0; index < segments; index += 1) {
      const angle0 = index / segments * Math.PI * 2;
      const angle1 = (index + 1) / segments * Math.PI * 2;
      const outer = (angle: number): Vec3 => {
        const x = cx + Math.cos(angle) * radius * 1.1;
        const z = cz + Math.sin(angle) * radius * 1.1;
        return [x, terrainHeight(x, z) + 0.04, z];
      };
      const inner = (angle: number): Vec3 => [
        cx + Math.cos(angle) * radius * 0.46,
        terrainHeight(cx, cz) - 0.28,
        cz + Math.sin(angle) * radius * 0.46,
      ];
      builder.quad(outer(angle0), outer(angle1), inner(angle1), inner(angle0), [0.135, 0.087, 0.058], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.trench);
    }
  });

  const trenches: readonly [Vec3, Vec3][] = [
    [[-30, terrainHeight(-30, -7) + 0.17, -7], [-9, terrainHeight(-9, -13) + 0.17, -13]],
    [[-24, terrainHeight(-24, -22) + 0.17, -22], [-5, terrainHeight(-5, -25) + 0.17, -25]],
    [[-15, terrainHeight(-15, -6) + 0.19, -6], [-16, terrainHeight(-16, -31) + 0.19, -31]],
  ];
  trenches.forEach(([a, b]) => {
    builder.strip(a, b, 1.35, [0.23, 0.145, 0.087], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.earth);
    builder.strip([a[0], a[1] + 0.05, a[2]], [b[0], b[1] + 0.05, b[2]], 0.58, [0.072, 0.052, 0.038], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.trench);
  });

  for (let index = 0; index < 24; index += 1) {
    const x = -28 + (index % 12) * 1.7;
    const z = index < 12 ? -12.1 : -23.6;
    builder.ellipsoid(
      [x, terrainHeight(x, z) + 0.34, z],
      [0.7, 0.31, 0.41],
      7,
      index % 3 === 0 ? [0.36, 0.29, 0.19] : [0.3, 0.245, 0.16],
      TEMPORAL_ZONE.a1,
      TEMPORAL_MATERIAL.earth,
    );
  }

  for (let index = 0; index < 11; index += 1) {
    const x = -32 + index * 2.7;
    const z = -4.8 - Math.sin(index * 0.8) * 1.2;
    const y = terrainHeight(x, z);
    builder.cylinder([x, y + 0.88, z], 0.09, 1.76, 6, [0.11, 0.09, 0.07], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.timber);
  }

  [[-20, -18], [-12, -21], [-8, -14], [-25, -25]].forEach(([x, z]) => {
    const y = terrainHeight(x, z);
    builder.cylinder([x, y + 0.46, z], 0.17, 0.92, 7, [0.045, 0.052, 0.045], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.metal);
    builder.box([x, y + 1.04, z], [0.23, 0.28, 0.23], [0.045, 0.052, 0.045], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.metal);
  });

  for (let index = 0; index < 10; index += 1) {
    const x = -36 + index * 3.5;
    const z = -32 - (index % 3) * 3.4;
    const y = terrainHeight(x, z);
    builder.cylinder([x, y + 1.15, z], 0.13, 2.3, 7, [0.12, 0.09, 0.065], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.timber);
    builder.ellipsoid([x, y + 2.9, z], [0.92, 1.25, 0.84], 7, [0.11, 0.19, 0.105], TEMPORAL_ZONE.a1, TEMPORAL_MATERIAL.vegetation);
  }
};

export const CemeteryHorizon = (builder: StaticBuilder) => {
  builder.quad([-4, 2.1, -35], [8.5, 2.1, -35], [9.5, 2.9, -49], [-5, 2.9, -49], [0.12, 0.19, 0.145], TEMPORAL_ZONE.memorial, TEMPORAL_MATERIAL.ground);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const x = -2.9 + column * 1.45 + (row % 2) * 0.28;
      const z = -37 - row * 2.65;
      const y = 2.65 + row * 0.17;
      builder.box([x, y + 0.58, z], [0.38, 1.05, 0.17], [0.58, 0.58, 0.53], TEMPORAL_ZONE.memorial, TEMPORAL_MATERIAL.memorial);
    }
  }
  builder.box([3.1, 5.1, -47], [0.82, 4.8, 0.58], [0.64, 0.58, 0.43], TEMPORAL_ZONE.memorial, TEMPORAL_MATERIAL.memorial);
};

export const TemporalAurora = (builder: EffectBuilder) => {
  for (let ribbon = 0; ribbon < 6; ribbon += 1) {
    const x = -5.8 + ribbon * 1.45;
    const z = -12 - ribbon * 3.7;
    const alpha = 0.055 + ribbon * 0.006;
    const color = ribbon % 3 === 0
      ? [0.33, 0.52, 0.41, alpha]
      : ribbon % 3 === 1
        ? [0.31, 0.39, 0.49, alpha]
        : [0.47, 0.42, 0.29, alpha * 0.72];
    builder.quad(
      [x - 2.4, 1, z + 9],
      [x + 1.7, 2.2, z - 9],
      [x + 2.8, 25, z - 10],
      [x - 3.1, 22, z + 8],
      color as [number, number, number, number],
      0,
    );
  }
};

export const TemporalMist = (builder: EffectBuilder) => {
  const layers = [
    [-43, 2.1, 12, 31, -1],
    [-34, 4.7, -7, 35, 1],
    [-26, 7, -25, 29, -1],
    [-9, 3.6, -39, 24, 1],
  ] as const;
  layers.forEach(([x, y, z, width, direction], index) => {
    const depth = 8 + index * 2.2;
    builder.quad(
      [x, y, z],
      [x + width, y + 0.3 * direction, z - depth],
      [x + width, y + 2.6, z - depth],
      [x, y + 2.2, z],
      [0.58, 0.61, 0.56, 0.032 + index * 0.008],
      1,
    );
  });
};

export const buildTemporalStaticGeometry = (): StaticGeometry => {
  const builder = new StaticBuilder();
  TerrainA11954(builder);
  CemeteryHorizon(builder);
  return builder.build();
};

export const buildTemporalEffectGeometry = (): EffectGeometry => {
  const builder = new EffectBuilder();
  TemporalAurora(builder);
  TemporalMist(builder);
  return builder.build();
};
