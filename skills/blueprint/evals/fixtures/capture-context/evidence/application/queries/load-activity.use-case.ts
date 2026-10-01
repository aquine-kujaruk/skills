import type { Session } from "../../domain/session";
import type { Activity } from "../../domain/activity";
import type { EvidenceRepository } from "../evidence.repository";

// Session -> activity recorded during capture.
export class LoadActivityUseCase {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async execute(session: Session): Promise<Activity> {
    return this.evidenceRepository.loadActivity(session);
  }
}
