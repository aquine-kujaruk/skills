import type { Chapter } from "./chapter";
import type { ChapterSummary } from "./chapter-summary";
import type { ImageDTO } from "../../shared/dtos";

export type ProcessedChapter = {
  chapter: Chapter;
  images: ImageDTO[];
  summary: ChapterSummary;
};
