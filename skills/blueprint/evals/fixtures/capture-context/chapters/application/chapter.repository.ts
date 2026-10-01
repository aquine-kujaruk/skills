import type { Chapter } from "../domain/chapter";
import type { ChapterEvidence } from "../domain/chapter-evidence";
import type { ChapterPlan } from "../domain/chapter-plan";
import type { ChapterPolicy } from "../domain/chapter-policy";
import type { ChapterSummary } from "../domain/chapter-summary";
import type { FrameCandidate } from "../domain/frame-candidate";
import type { ImageScores } from "../domain/image-scores";
import type { ProcessedChapter } from "../domain/processed-chapter";
import type { SynthesisContext } from "../domain/synthesis-context";
import type { ImageDTO } from "../../shared/dtos";

// Glue of the chapters context: SQLite, FFmpeg, Prem and OpenAI.
export interface ChapterRepository {
  // Planning
  loadPolicy(): Promise<ChapterPolicy>;
  savePlan(plan: ChapterPlan): Promise<void>;
  saveChapters(chapters: Chapter[]): Promise<void>;

  // Visual selection
  loadEvidence(chapter: Chapter): Promise<ChapterEvidence>;
  extractImages(candidates: FrameCandidate[]): Promise<ImageDTO[]>;
  // Opportunity: send the images to Prem arranged in grids to make fewer calls.
  scoreImages(imageDTOs: ImageDTO[]): Promise<ImageScores>;

  // Synthesis
  generateSummary(context: SynthesisContext): Promise<ChapterSummary>;
  saveProcessed(result: ProcessedChapter): Promise<void>;
}
