import type { TaskDTO } from "../../../shared/dtos";
import type { Verification } from "../../domain/verification";
import type { ImplementationRepository } from "../implementation.repository";

export class VerifyTaskUseCase {
  constructor(private readonly implementationRepository: ImplementationRepository) {}

  async execute(taskDTO: TaskDTO): Promise<Verification> {
    return this.implementationRepository.verify(taskDTO);
  }
}
