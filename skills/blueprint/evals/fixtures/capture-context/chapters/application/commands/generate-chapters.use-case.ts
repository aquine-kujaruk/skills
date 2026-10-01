import { ChapterId } from "../../domain/chapter";
import type { ChapterRepository } from "../chapter.repository";
import type { Chapter } from "../../domain/chapter";
import type { ChapterPlan } from "../../domain/chapter-plan";

// ChapterPlan -> identified, persisted units.
export class GenerateChaptersUseCase {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(plan: ChapterPlan): Promise<Chapter[]> {
    const chapters: Chapter[] = plan.intervals.map((range, index) => ({
      id: ChapterId.from(plan.id, index + 1),
      ordinal: index + 1,
      range,
    }));

    await this.chapterRepository.saveChapters(chapters);
    return chapters;
  }
}
