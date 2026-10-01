import type { Artifact } from "../../domain/artifact";
import type { Change } from "../../domain/change";
import type { ChangeRepository } from "../change.repository";

export class ListRequiredArtifactsUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change): Promise<Artifact[]> {
    const graph = await this.changeRepository.loadArtifactGraph(change);
    return graph.requiredInOrder();
  }
}
