import type { ChapterSummary } from "./chapter-summary";
import type { FrameCandidate } from "./frame-candidate";
import type { ImageScores } from "./image-scores";
import type { SynthesisContext } from "./synthesis-context";
import type { ImageDTO } from "../../shared/dtos";

export type ChapterEvidence = {
  candidateFrames(): FrameCandidate[];
  selectImages(imageDTOs: ImageDTO[], scores: ImageScores): ImageDTO[];
  prepareSynthesis(images: ImageDTO[]): SynthesisContext;
  templateSummary(images: ImageDTO[]): ChapterSummary; // deterministic, no model
};
