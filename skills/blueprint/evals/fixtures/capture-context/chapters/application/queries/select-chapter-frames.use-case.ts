import type { ChapterRepository } from "../chapter.repository";
import type { Chapter } from "../../domain/chapter";
import type { ChapterFrameSelection } from "../../domain/chapter-frame-selection";

// Chapter -> selected images; the saga keeps the result between steps.
export class SelectChapterFramesUseCase {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(chapter: Chapter): Promise<ChapterFrameSelection> {
    const evidence = await this.chapterRepository.loadEvidence(chapter);
    const candidates = evidence.candidateFrames();

    const candidateImageDTOs = await this.chapterRepository.extractImages(candidates);
    const scores = await this.chapterRepository.scoreImages(candidateImageDTOs);

    const images = evidence.selectImages(candidateImageDTOs, scores);
    const selection: ChapterFrameSelection = { chapter, images };

    return selection;
  }
}
