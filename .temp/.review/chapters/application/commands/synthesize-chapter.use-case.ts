import type { ChapterRepository } from "../chapter.repository";
import type { ChapterFrameSelection } from "../../domain/chapter-frame-selection";
import type { ProcessedChapter } from "../../domain/processed-chapter";

// Selected images -> chapter summary with OpenAI.
export class SynthesizeChapterUseCase {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute({ chapter, images }: ChapterFrameSelection): Promise<ProcessedChapter> {
    const evidence = await this.chapterRepository.loadEvidence(chapter);
    const context = evidence.prepareSynthesis(images);

    const summary = await this.chapterRepository.generateSummary(context);
    const result: ProcessedChapter = { chapter, images, summary };

    await this.chapterRepository.saveProcessed(result);
    return result;
  }
}
