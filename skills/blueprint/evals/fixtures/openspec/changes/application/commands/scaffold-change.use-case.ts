import { Change } from "../../domain/change";
import type { ExplorationDTO } from "../../../shared/dtos";
import type { ChangeRepository } from "../change.repository";

export class ScaffoldChangeUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(explorationDTO: ExplorationDTO): Promise<Change> {
    const change = Change.named(explorationDTO);
    await this.changeRepository.scaffold(change);
    return change;
  }
}
