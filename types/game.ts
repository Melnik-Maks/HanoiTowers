export type RodId = "st1" | "st2" | "st3";

export type JsonLevelShape = {
  st1: number[];
  st2: number[];
  st3: number[];
};

export type LevelSource = "classic" | "json";

export type ParsedLevel = {
  id: number | null;
  source: LevelSource;
  rods: JsonLevelShape;
  allDiscs: number[];
  discCount: number;
  goal: JsonLevelShape;
};

export type GameCompletionPayload = {
  levelId?: number | null;
  classicDisks?: number | null;
  durationMs: number;
  moves: number;
  source: LevelSource;
};
