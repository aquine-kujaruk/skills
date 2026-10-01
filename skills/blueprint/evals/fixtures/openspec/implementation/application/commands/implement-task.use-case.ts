import type { TaskDTO } from "../../../shared/dtos";
import type { ApplyContext } from "../../domain/apply-context";
import type { CodeChange } from "../../domain/code-change";
import type { ImplementationRepository } from "../implementation.repository";

export class ImplementTaskUseCase {
  constructor(private readonly implementationRepository: ImplementationRepository) {}

  async execute(taskDTO: TaskDTO, applyContext: ApplyContext): Promise<CodeChange> {
    const codeChange = await this.implementationRepository.implement(taskDTO, applyContext);
    codeChange.verifyCovers(taskDTO);
    codeChange.verifyStaysWithin(taskDTO);
    return codeChange;
  }
}
