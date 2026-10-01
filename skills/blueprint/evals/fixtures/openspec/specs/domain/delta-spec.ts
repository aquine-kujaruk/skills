import type { Requirement } from "./requirement";

export type DeltaSpec = {
  capability: string;
  added: Requirement[];
  modified: Requirement[];
  removed: string[];
  renamed: { from: string; to: string }[];
};
