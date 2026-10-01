import type { ProcessedChapterDTO, SessionDTO } from "../../shared/dtos";
import type { Publication } from "../domain/publication";
import type { SessionSummary } from "../domain/session-summary";

// Glue of the publication context: OpenAI, files and index.
export interface PublicationRepository {
  generateSessionSummary(processedChapterDTOs: ProcessedChapterDTO[]): Promise<SessionSummary>;
  publish(
    session: SessionDTO,
    summary: SessionSummary,
    processedChapterDTOs: ProcessedChapterDTO[],
  ): Promise<Publication>;
}
