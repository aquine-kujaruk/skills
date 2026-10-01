import type { TimeRange } from "./time-range";
import type { Session } from "./session";
import type { Activity } from "./activity";
import type { Image } from "./image";
import type { NarrationFragment } from "./narration-fragment";

export type Timeline = {
  range: TimeRange;
  visitChanges: number[];
  silences: TimeRange[]; // computed by evidence when building the timeline
  pauses: number[];
};

// Pure construction from evidence already obtained; no FFmpeg or APIs.
export declare const Timeline: {
  from(
    session: Session,
    images: Image[],
    narration: NarrationFragment[],
    activity: Activity,
  ): Timeline;
};
