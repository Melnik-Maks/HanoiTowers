import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { CLASSIC_LEVEL_MAX_DISKS, CLASSIC_LEVEL_MIN_DISKS } from "@/lib/constants";
import type { JsonLevelShape, ParsedLevel } from "@/types";

const rodSchema = z.array(z.number().int().positive());
const levelSchema = z.object({
  st1: rodSchema,
  st2: rodSchema,
  st3: rodSchema,
});

type RawLevelsMap = Record<string, unknown>;

declare global {
  var __variantsCache: RawLevelsMap | undefined;
}

function getVariantsPath() {
  const configuredPath = process.env.VARIANTS_JSON_PATH;
  if (configuredPath) {
    return path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), "data", "variants.json");
}

async function loadVariantsMap() {
  if (global.__variantsCache) {
    return global.__variantsCache;
  }

  const rawFile = await readFile(getVariantsPath(), "utf-8");
  const parsed = JSON.parse(rawFile) as RawLevelsMap;
  global.__variantsCache = parsed;
  return parsed;
}

export function normalizeLevel(level: JsonLevelShape): JsonLevelShape {
  return {
    st1: level.st1.map(Number),
    st2: level.st2.map(Number),
    st3: level.st3.map(Number),
  };
}

export function validateLevel(level: unknown) {
  const parsed = levelSchema.safeParse(level);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return {
    valid: true,
    errors: [] as string[],
  };
}

function buildGoalState(level: JsonLevelShape): JsonLevelShape {
  const allDiscs = [...level.st1, ...level.st2, ...level.st3].sort((a, b) => b - a);
  return { st1: [], st2: [], st3: allDiscs };
}

export function parseLevelFromJson(levelId: number, rawLevel: unknown): ParsedLevel {
  const validation = validateLevel(rawLevel);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const level = normalizeLevel(rawLevel as JsonLevelShape);
  const allDiscs = [...level.st1, ...level.st2, ...level.st3];

  return {
    id: levelId,
    source: "json",
    rods: level,
    allDiscs,
    discCount: allDiscs.length,
    goal: buildGoalState(level),
  };
}

export function createClassicLevel(disks: number): ParsedLevel {
  if (disks < CLASSIC_LEVEL_MIN_DISKS || disks > CLASSIC_LEVEL_MAX_DISKS) {
    throw new Error("Кількість дисків має бути від 3 до 8.");
  }

  const stack = Array.from({ length: disks }, (_, index) => disks - index);
  return {
    id: null,
    source: "classic",
    rods: { st1: stack, st2: [], st3: [] },
    allDiscs: [...stack],
    discCount: disks,
    goal: { st1: [], st2: [], st3: [...stack] },
  };
}

export async function getLevelById(levelId: number) {
  const variants = await loadVariantsMap();
  const raw = variants[String(levelId)];
  if (!raw) {
    return null;
  }

  return parseLevelFromJson(levelId, raw);
}

export async function getRandomLevel() {
  const levels = await getLevelsCatalog();
  const validLevels = levels.filter((level) => level.valid);
  if (!validLevels.length) {
    return null;
  }

  const randomLevel = validLevels[Math.floor(Math.random() * validLevels.length)];
  return getLevelById(randomLevel.id);
}

export async function getLevelsCatalog(search?: string) {
  const variants = await loadVariantsMap();
  const normalizedSearch = search?.trim();

  return Object.keys(variants)
    .filter((id) => (!normalizedSearch ? true : id.includes(normalizedSearch)))
    .sort((a, b) => Number(a) - Number(b))
    .map((id) => {
      const validation = validateLevel(variants[id]);
      let discCount = 0;

      if (validation.valid) {
        const parsed = parseLevelFromJson(Number(id), variants[id]);
        discCount = parsed.discCount;
      }

      return {
        id: Number(id),
        discCount,
        valid: validation.valid,
        errors: validation.errors,
      };
    });
}
