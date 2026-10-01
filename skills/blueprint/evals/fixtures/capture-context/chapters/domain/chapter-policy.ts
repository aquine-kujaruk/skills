import type { TimeRangeDTO } from "../../shared/dtos";
import type { CutPoint } from "./cut-point";

export type ChapterPolicy = {
  identifyPossibleCuts(
    visits: number[],
    silences: TimeRangeDTO[],
    pauses: number[],
  ): CutPoint[];
  partition(range: TimeRangeDTO, cuts: CutPoint[]): TimeRangeDTO[];
};
