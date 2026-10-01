import type { ChapterRepository } from "../chapter.repository";
import type { ChapterFrameSelection } from "../../domain/chapter-frame-selection";
import type { ProcessedChapter } from "../../domain/processed-chapter";

// Selected images -> template summary, no model.
export class SummarizeChapterWithTemplateUseCase {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute({ chapter, images }: ChapterFrameSelection): Promise<ProcessedChapter> {
    const evidence = await this.chapterRepository.loadEvidence(chapter);
    const summary = evidence.templateSummary(images);
    const result: ProcessedChapter = { chapter, images, summary };

    await this.chapterRepository.saveProcessed(result);
    return result;
  }
}
