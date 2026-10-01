import type { Session } from "../../domain/session";
import type { Image } from "../../domain/image";
import type { EvidenceRepository } from "../evidence.repository";

export class PrepareImagesUseCase {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async execute(session: Session): Promise<Image[]> {
    return this.evidenceRepository.extractImages(session);
  }
}
