import type { ChangeDTO } from "../../../shared/dtos";
import type { ApplyContext } from "../../domain/apply-context";
import type { ImplementationRepository } from "../implementation.repository";

export class LoadApplyContextUseCase {
  constructor(private readonly implementationRepository: ImplementationRepository) {}

  async execute(changeDTO: ChangeDTO): Promise<ApplyContext> {
    return this.implementationRepository.loadApplyContext(changeDTO);
  }
}
