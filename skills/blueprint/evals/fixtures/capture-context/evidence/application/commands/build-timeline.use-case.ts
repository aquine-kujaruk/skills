import type { Session } from "../../domain/session";
import { Timeline } from "../../domain/timeline";
import type { Activity } from "../../domain/activity";
import type { Image } from "../../domain/image";
import type { NarrationFragment } from "../../domain/narration-fragment";
import type { EvidenceRepository } from "../evidence.repository";

export class BuildTimelineUseCase {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async execute(
    session: Session,
    images: Image[],
    narration: NarrationFragment[],
    activity: Activity,
  ): Promise<Timeline> {
    const timeline = Timeline.from(session, images, narration, activity);
    await this.evidenceRepository.saveTimeline(timeline);
    return timeline;
  }
}
