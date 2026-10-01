import type { TimeRangeDTO } from "../../shared/dtos";
import type { PlanId } from "./chapter-plan";

export type ChapterId = string;

export type Chapter = {
  id: ChapterId;
  ordinal: number;
  range: TimeRangeDTO;
};

// Deterministic identity: pure operation, no repositories.
export declare const ChapterId: {
  from(planId: PlanId, ordinal: number): ChapterId;
};
