import type { DeltaSpec } from "./delta-spec";
import type { Requirement } from "./requirement";

export type MainSpec = {
  capability: string;
  requirements: Requirement[];
  merge(delta: DeltaSpec): MainSpec;
};
