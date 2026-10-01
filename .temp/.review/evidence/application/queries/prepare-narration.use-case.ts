import type { Session } from "../../domain/session";
import type { NarrationFragment } from "../../domain/narration-fragment";
import type { EvidenceRepository } from "../evidence.repository";

export class PrepareNarrationUseCase {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async execute(session: Session): Promise<NarrationFragment[]> {
    return this.evidenceRepository.transcribeNarration(session);
  }
}
