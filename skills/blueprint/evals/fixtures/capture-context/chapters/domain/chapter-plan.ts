import type { ChapterPolicy } from "./chapter-policy";
import type { TimeRangeDTO, TimelineDTO } from "../../shared/dtos";

export type PlanId = string;

// Proposed partition: intervals without identity yet.
export type ChapterPlan = {
  id: PlanId;
  intervals: TimeRangeDTO[];
};

// Deterministic identity: pure operation, no repositories.
export declare const PlanId: {
  from(timelineDTO: TimelineDTO, policy: ChapterPolicy): PlanId;
};
