export type Vec3 = readonly [number, number, number];
export type Color3 = readonly [number, number, number];

export const TEMPORAL_ZONE = {
  neutral: 0,
  a1: 1,
  present: 2,
  memorial: 3,
} as const;

type TemporalZone = (typeof TEMPORAL_ZONE)[keyof typeof TEMPORAL_ZONE];

export type StaticGeometry = {
  positions: Float32Array;
  colors: Float32Array;
  zones: Float32Array;
  indices: Uint16Array;
};

export type EffectGeometry = {
  positions: Float32Array;
  colors: Float32Array;
  kinds: Float32Array;
  indices: Uint16Array;
};

class StaticBuilder {
  private positions: number[] = [];
  private colors: number[] = [];
  private zones: number[] = [];
  private indices: number[] = [];

  private vertex(point: Vec3, color: Color3, zone: TemporalZone) {
    const index = this.positions.length / 3;
    this.positions.push(...point);
    this.colors.push(...color);
    this.zones.push(zone);
    return index;
  }

  triangle(a: Vec3, b: Vec3, c: Vec3, color: Color3, zone: TemporalZone) {
    const offset = this.vertex(a, color, zone);
    this.vertex(b, color, zone);
    this.vertex(c, color, zone);
    this.indices.push(offset, offset + 1, offset + 2);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Color3, zone: TemporalZone) {
    const offset = this.vertex(a, color, zone);
    this.vertex(b, color, zone);
    this.vertex(c, color, zone);
    this.vertex(d, color, zone);
    this.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  }

  box(center: Vec3, size: Vec3, color: Color3, zone: TemporalZone) {
    const [x, y, z] = center;
    const [w, h, d] = size;
    const x0 = x - w / 2;
    const x1 = x + w / 2;
    const y0 = y - h / 2;
    const y1 = y + h / 2;
    const z0 = z - d / 2;
    const z1 = z + d / 2;
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], color, zone);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], color, zone);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], color, zone);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], color, zone);
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], color, zone);
    this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], color, zone);
  }

  roof(center: Vec3, width: number, depth: number, height: number, color: Color3) {
    const [x, y, z] = center;
    const x0 = x - width / 2;
    const x1 = x + width / 2;
    const z0 = z - depth / 2;
    const z1 = z + depth / 2;
    const ridge0: Vec3 = [x, y + height, z0];
    const ridge1: Vec3 = [x, y + height, z1];
    this.quad([x0, y, z1], [x1, y, z1], ridge1, ridge1, color, TEMPORAL_ZONE.present);
    this.quad([x1, y, z0], [x0, y, z0], ridge0, ridge0, color, TEMPORAL_ZONE.present);
    this.quad([x0, y, z0], [x0, y, z1], ridge1, ridge0, color, TEMPORAL_ZONE.present);
    this.quad([x1, y, z1], [x1, y, z0], ridge0, ridge1, color, TEMPORAL_ZONE.present);
  }

  pyramid(center: Vec3, radius: number, height: number, color: Color3, zone: TemporalZone) {
    const [x, y, z] = center;
    const tip: Vec3 = [x, y + height, z];
    this.triangle([x - radius, y, z - radius], [x + radius, y, z - radius], tip, color, zone);
    this.triangle([x + radius, y, z - radius], [x + radius, y, z + radius], tip, color, zone);
    this.triangle([x + radius, y, z + radius], [x - radius, y, z + radius], tip, color, zone);
    this.triangle([x - radius, y, z + radius], [x - radius, y, z - radius], tip, color, zone);
  }

  strip(a: Vec3, b: Vec3, width: number, color: Color3, zone: TemporalZone) {
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const length = Math.hypot(dx, dz) || 1;
    const px = (-dz / length) * width / 2;
    const pz = (dx / length) * width / 2;
    this.quad(
      [a[0] + px, a[1], a[2] + pz],
      [b[0] + px, b[1], b[2] + pz],
      [b[0] - px, b[1], b[2] - pz],
      [a[0] - px, a[1], a[2] - pz],
      color,
      zone,
    );
  }

  build(): StaticGeometry {
    if (this.positions.length / 3 > 65_535) throw new Error('temporal-scene-geometry-too-large');
    return {
      positions: new Float32Array(this.positions),
      colors: new Float32Array(this.colors),
      zones: new Float32Array(this.zones),
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
  [-17, -11, 2.2],
  [-9, -18, 2.8],
  [-22, -23, 2.5],
  [-5, -8, 1.7],
] as const;

const terrainHeight = (x: number, z: number) => {
  const mainHill = 11.5 * Math.exp(-(((x + 14) ** 2) / 230 + ((z + 16) ** 2) / 310));
  const shoulder = 3.8 * Math.exp(-(((x + 25) ** 2) / 190 + ((z + 12) ** 2) / 280));
  const roughness = Math.sin(x * 0.72 + z * 0.17) * 0.35 + Math.sin(z * 0.58) * 0.28;
  const craterDepth = craterCenters.reduce((sum, [cx, cz, radius]) => {
    const distance = ((x - cx) ** 2 + (z - cz) ** 2) / (radius ** 2);
    return sum + 1.25 * Math.exp(-distance * 1.7);
  }, 0);
  return 0.1 + mainHill + shoulder + roughness - craterDepth;
};

export const TerrainA11954 = (builder: StaticBuilder) => {
  const xMin = -34;
  const xMax = 2;
  const zMin = -40;
  const zMax = 7;
  const columns = 26;
  const rows = 30;
  const dx = (xMax - xMin) / columns;
  const dz = (zMax - zMin) / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x0 = xMin + column * dx;
      const x1 = x0 + dx;
      const z0 = zMin + row * dz;
      const z1 = z0 + dz;
      const shade = 0.9 + Math.sin(column * 1.9 + row * 0.73) * 0.08;
      const color: Color3 = [0.34 * shade, 0.23 * shade, 0.16 * shade];
      builder.quad(
        [x0, terrainHeight(x0, z0), z0],
        [x1, terrainHeight(x1, z0), z0],
        [x1, terrainHeight(x1, z1), z1],
        [x0, terrainHeight(x0, z1), z1],
        color,
        TEMPORAL_ZONE.a1,
      );
    }
  }

  const trenchLines: readonly [Vec3, Vec3][] = [
    [[-27, terrainHeight(-27, -8) + 0.16, -8], [-8, terrainHeight(-8, -13) + 0.16, -13]],
    [[-22, terrainHeight(-22, -22) + 0.16, -22], [-4, terrainHeight(-4, -25) + 0.16, -25]],
    [[-14, terrainHeight(-14, -7) + 0.18, -7], [-15, terrainHeight(-15, -30) + 0.18, -30]],
  ];
  trenchLines.forEach(([a, b]) => builder.strip(a, b, 0.85, [0.13, 0.105, 0.085], TEMPORAL_ZONE.a1));

  for (let index = 0; index < 18; index += 1) {
    const x = -25 + (index % 9) * 2.2;
    const z = index < 9 ? -12.4 : -23.6;
    builder.box([x, terrainHeight(x, z) + 0.28, z], [1.25, 0.48, 0.65], [0.39, 0.32, 0.21], TEMPORAL_ZONE.a1);
  }

  for (let index = 0; index < 12; index += 1) {
    const x = -31 + index * 2.45;
    const z = -5.2 - Math.sin(index * 0.8) * 1.3;
    const y = terrainHeight(x, z);
    builder.box([x, y + 0.9, z], [0.16, 1.8, 0.16], [0.16, 0.13, 0.1], TEMPORAL_ZONE.a1);
  }

  [[-19, -18], [-11, -21], [-7, -14], [-24, -25]].forEach(([x, z]) => {
    const y = terrainHeight(x, z);
    builder.box([x, y + 0.52, z], [0.34, 1.05, 0.25], [0.075, 0.08, 0.075], TEMPORAL_ZONE.a1);
    builder.box([x, y + 1.2, z], [0.24, 0.34, 0.24], [0.075, 0.08, 0.075], TEMPORAL_ZONE.a1);
  });
};

export const CurrentRoad = (builder: StaticBuilder) => {
  const segments = 34;
  for (let index = 0; index < segments; index += 1) {
    const z0 = 19 - index * 1.65;
    const z1 = 19 - (index + 1) * 1.65;
    const x0 = 3.7 + Math.sin(index * 0.11) * 0.72;
    const x1 = 3.7 + Math.sin((index + 1) * 0.11) * 0.72;
    const y0 = 0.25 + index * 0.105;
    const y1 = 0.25 + (index + 1) * 0.105;
    const halfWidth = 2.25;
    builder.quad(
      [x0 - halfWidth, y0, z0],
      [x0 + halfWidth, y0, z0],
      [x1 + halfWidth, y1, z1],
      [x1 - halfWidth, y1, z1],
      index % 4 === 0 ? [0.54, 0.55, 0.52] : [0.58, 0.585, 0.55],
      TEMPORAL_ZONE.present,
    );

    if (index % 2 === 0) {
      builder.box([x1 - 2.63, y1 + 0.42, z1], [0.36, 0.82, 1.7], [0.42, 0.43, 0.4], TEMPORAL_ZONE.present);
    }
    if (index % 3 === 0) {
      builder.box([x1 - 2.9, y1 + 1.35, z1], [0.12, 1.95, 0.12], [0.055, 0.065, 0.06], TEMPORAL_ZONE.present);
      builder.box([x1 - 2.9, y1 + 1.1, z1 - 1.15], [0.1, 0.1, 2.3], [0.055, 0.065, 0.06], TEMPORAL_ZONE.present);
    }
  }

  builder.box([8.55, 0.45, 4], [0.3, 0.3, 12], [0.31, 0.28, 0.23], TEMPORAL_ZONE.present);
  builder.box([9.05, 0.32, 2.4], [0.22, 0.22, 9], [0.24, 0.24, 0.22], TEMPORAL_ZONE.present);

  for (let index = 0; index < 22; index += 1) {
    const leftSide = index % 2 === 0;
    const x = leftSide ? -0.2 - (index % 3) * 0.6 : 8.4 + (index % 4) * 0.45;
    const z = 18 - index * 2.25;
    const y = 0.5 + index * 0.1;
    builder.pyramid([x, y, z], 0.75 + (index % 3) * 0.18, 2.4 + (index % 4) * 0.5, [0.16, 0.29, 0.18], TEMPORAL_ZONE.present);
  }
};

export const CurrentHouses = (builder: StaticBuilder) => {
  const houses = [
    [11, 0.1, -1, 5.3, 3.5, 5.8],
    [16.2, 0.7, -7, 5.8, 4.2, 6.5],
    [10.8, 1.2, -13.5, 4.7, 3.8, 5.5],
    [17.5, 1.9, -18.5, 6.2, 4.4, 6.8],
    [9.6, 2.6, -24.5, 5.4, 3.6, 5.9],
  ] as const;

  houses.forEach(([x, y, z, width, height, depth], index) => {
    const wall: Color3 = index % 2 === 0 ? [0.52, 0.48, 0.39] : [0.42, 0.5, 0.45];
    builder.box([x, y + height / 2, z], [width, height, depth], wall, TEMPORAL_ZONE.present);
    builder.roof([x, y + height, z], width + 0.7, depth + 0.7, 1.45, index % 2 === 0 ? [0.34, 0.16, 0.1] : [0.2, 0.24, 0.2]);
    builder.quad(
      [x - 1.15, y + 1.05, z + depth / 2 + 0.02],
      [x - 0.2, y + 1.05, z + depth / 2 + 0.02],
      [x - 0.2, y + 2.05, z + depth / 2 + 0.02],
      [x - 1.15, y + 2.05, z + depth / 2 + 0.02],
      [0.9, 0.65, 0.28],
      TEMPORAL_ZONE.present,
    );
  });

  for (let index = 0; index < 7; index += 1) {
    builder.box([9 + index * 1.7, 7.5 + index * 0.12, -22 - index * 0.7], [0.12, 8, 0.12], [0.08, 0.085, 0.08], TEMPORAL_ZONE.present);
  }
  builder.strip([9, 10.5, -22], [19.2, 11.2, -26.2], 0.08, [0.06, 0.06, 0.055], TEMPORAL_ZONE.present);
};

export const CemeteryHorizon = (builder: StaticBuilder) => {
  builder.quad([-5, 2.1, -34], [8.5, 2.1, -34], [10, 3.1, -49], [-6, 3.1, -49], [0.2, 0.245, 0.22], TEMPORAL_ZONE.memorial);
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const x = -3.6 + column * 1.55 + (row % 2) * 0.3;
      const z = -36.2 - row * 2.45;
      const y = 2.7 + row * 0.18;
      builder.box([x, y + 0.6, z], [0.44, 1.2, 0.2], [0.68, 0.69, 0.62], TEMPORAL_ZONE.memorial);
    }
  }
  builder.box([3.2, 5.35, -47], [1.05, 5.7, 0.7], [0.73, 0.68, 0.54], TEMPORAL_ZONE.memorial);
};

const TemporalGround = (builder: StaticBuilder) => {
  builder.quad([-70, -0.35, 34], [45, -0.35, 34], [45, -0.35, -78], [-70, -0.35, -78], [0.16, 0.205, 0.16], TEMPORAL_ZONE.neutral);
  for (let index = 0; index < 18; index += 1) {
    const x = -40 + index * 5.2;
    const z = -58 - (index % 4) * 3.2;
    builder.pyramid([x, -0.2, z], 6.5 + (index % 3) * 2, 10 + (index % 4) * 2.6, [0.11, 0.155, 0.14], TEMPORAL_ZONE.neutral);
  }
};

export const TemporalAurora = (builder: EffectBuilder) => {
  for (let ribbon = 0; ribbon < 5; ribbon += 1) {
    const z = -38 - ribbon * 2.4;
    const alpha = 0.13 + ribbon * 0.018;
    for (let segment = 0; segment < 18; segment += 1) {
      const x0 = -37 + segment * 2.55;
      const x1 = x0 + 2.55;
      const base0 = 17 + ribbon * 1.8 + Math.sin(segment * 0.55 + ribbon) * 2.1;
      const base1 = 17 + ribbon * 1.8 + Math.sin((segment + 1) * 0.55 + ribbon) * 2.1;
      const color = ribbon % 3 === 0
        ? [0.32, 0.62, 0.46, alpha]
        : ribbon % 3 === 1
          ? [0.25, 0.43, 0.58, alpha]
          : [0.55, 0.47, 0.26, alpha * 0.8];
      builder.quad([x0, base0, z], [x1, base1, z], [x1, base1 + 9, z], [x0, base0 + 8, z], color as [number, number, number, number], 0);
    }
  }
};

export const TemporalMist = (builder: EffectBuilder) => {
  const layers = [
    [-42, 2.2, 12, 25, -1],
    [-35, 4.8, -6, 32, 1],
    [-24, 7.1, -24, 28, -1],
    [-8, 3.7, -38, 31, 1],
  ] as const;
  layers.forEach(([x, y, z, width, direction], index) => {
    const depth = 9 + index * 2;
    builder.quad(
      [x, y, z],
      [x + width, y + 0.3 * direction, z - depth],
      [x + width, y + 2.5, z - depth],
      [x, y + 2.2, z],
      [0.64, 0.69, 0.64, 0.055 + index * 0.012],
      1,
    );
  });
};

export const buildTemporalStaticGeometry = (): StaticGeometry => {
  const builder = new StaticBuilder();
  TemporalGround(builder);
  TerrainA11954(builder);
  CurrentRoad(builder);
  CurrentHouses(builder);
  CemeteryHorizon(builder);
  return builder.build();
};

export const buildTemporalEffectGeometry = (): EffectGeometry => {
  const builder = new EffectBuilder();
  TemporalAurora(builder);
  TemporalMist(builder);
  return builder.build();
};
