import { PlanId } from "../../domain/chapter-plan";
import type { ChapterRepository } from "../chapter.repository";
import type { ChapterPlan } from "../../domain/chapter-plan";
import type { TimelineDTO } from "../../../shared/dtos";

// TimelineDTO -> ChapterPlan.
export class PlanChaptersUseCase {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async execute(timelineDTO: TimelineDTO): Promise<ChapterPlan> {
    const policy = await this.chapterRepository.loadPolicy();

    // Pure rules: computed signals -> possible cuts -> intervals.
    const possibleCuts = policy.identifyPossibleCuts(
      timelineDTO.visitChanges, timelineDTO.silences, timelineDTO.pauses,
    );
    const intervals = policy.partition(timelineDTO.range, possibleCuts);

    const plan: ChapterPlan = {
      id: PlanId.from(timelineDTO, policy),
      intervals,
    };

    await this.chapterRepository.savePlan(plan);
    return plan;
  }
}
