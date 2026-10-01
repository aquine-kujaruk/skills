import type { ExplorationDTO } from "../../../shared/dtos";
import type { ArtifactContent } from "../../domain/artifact-content";
import type { Change } from "../../domain/change";
import type { ChangeRepository } from "../change.repository";

export class ReviseArtifactsUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change, explorationDTO: ExplorationDTO): Promise<ArtifactContent[]> {
    const contents = await this.changeRepository.loadExistingArtifacts(change);
    const revisions: ArtifactContent[] = [];

    for (const content of contents) {
      const revision = await this.changeRepository.draftRevision(content, explorationDTO);
      revision.verifyGroundedIn(explorationDTO);
      await this.changeRepository.saveArtifact(change, revision);
      revisions.push(revision);
    }

    return revisions;
  }
}
