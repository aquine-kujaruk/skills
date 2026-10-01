import type { ExplorationDTO } from "../../../shared/dtos";
import type { Artifact } from "../../domain/artifact";
import type { ArtifactContent } from "../../domain/artifact-content";
import type { Change } from "../../domain/change";
import type { ChangeRepository } from "../change.repository";

export class WriteArtifactUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change, artifact: Artifact, explorationDTO: ExplorationDTO): Promise<ArtifactContent> {
    const [instructions, dependencies] = await Promise.all([
      this.changeRepository.loadInstructions(change, artifact),
      this.changeRepository.loadArtifacts(change, artifact.requires),
    ]);

    const content = await this.changeRepository.draftArtifact(instructions, explorationDTO, dependencies);
    content.verifyGroundedIn(explorationDTO);

    await this.changeRepository.saveArtifact(change, content);
    return content;
  }
}
