import type { ChangeDTO } from "../../../shared/dtos";
import type { MainSpec } from "../../domain/main-spec";
import type { SpecRepository } from "../spec.repository";

export class SyncDeltaSpecsUseCase {
  constructor(private readonly specRepository: SpecRepository) {}

  async execute(changeDTO: ChangeDTO): Promise<MainSpec[]> {
    const deltas = await this.specRepository.loadDeltaSpecs(changeDTO);
    const synced: MainSpec[] = [];

    for (const delta of deltas) {
      const mainSpec = await this.specRepository.loadMainSpec(delta.capability);
      const merged = mainSpec.merge(delta);
      await this.specRepository.saveMainSpec(merged);
      synced.push(merged);
    }

    return synced;
  }
}
