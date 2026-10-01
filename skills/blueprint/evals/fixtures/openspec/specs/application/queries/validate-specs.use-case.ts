import type { SpecValidation } from "../../domain/spec-validation";
import type { SpecRepository } from "../spec.repository";

export class ValidateSpecsUseCase {
  constructor(private readonly specRepository: SpecRepository) {}

  async execute(): Promise<SpecValidation> {
    return this.specRepository.validate();
  }
}
