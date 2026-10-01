import type { PlanningContext } from "../../domain/planning-context";
import type { ExplorationRepository } from "../exploration.repository";

export class LoadPlanningContextUseCase {
  constructor(private readonly explorationRepository: ExplorationRepository) {}

  async execute(): Promise<PlanningContext> {
    return this.explorationRepository.loadPlanningContext();
  }
}
