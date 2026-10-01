import type { ProcessedChapterDTO } from "../../../shared/dtos";
import type { SessionSummary } from "../../domain/session-summary";
import type { PublicationRepository } from "../publication.repository";

export class SummarizeSessionUseCase {
  constructor(private readonly publicationRepository: PublicationRepository) {}

  async execute(processedChapterDTOs: ProcessedChapterDTO[]): Promise<SessionSummary> {
    return this.publicationRepository.generateSessionSummary(processedChapterDTOs);
  }
}
