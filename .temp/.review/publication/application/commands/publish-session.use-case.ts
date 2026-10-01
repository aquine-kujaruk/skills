import type { ProcessedChapterDTO, SessionDTO } from "../../../shared/dtos";
import type { Publication } from "../../domain/publication";
import type { SessionSummary } from "../../domain/session-summary";
import type { PublicationRepository } from "../publication.repository";

export class PublishSessionUseCase {
  constructor(private readonly publicationRepository: PublicationRepository) {}

  async execute(
    session: SessionDTO,
    summary: SessionSummary,
    processedChapterDTOs: ProcessedChapterDTO[],
  ): Promise<Publication> {
    return this.publicationRepository.publish(session, summary, processedChapterDTOs);
  }
}
