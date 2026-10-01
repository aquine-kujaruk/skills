import type { Chapter } from "./chapter";
import type { ImageDTO } from "../../shared/dtos";

// Output of visual selection; the saga serializes it until synthesis.
export type ChapterFrameSelection = {
  chapter: Chapter;
  images: ImageDTO[];
};
