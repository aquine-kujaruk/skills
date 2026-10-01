import type { Investigation } from "../../domain/investigation";
import type { PlanningContext } from "../../domain/planning-context";
import type { Topic } from "../../domain/topic";
import type { ExplorationRepository } from "../exploration.repository";

export class InvestigateProjectUseCase {
  constructor(private readonly explorationRepository: ExplorationRepository) {}

  async execute(topic: Topic, planningContext: PlanningContext): Promise<Investigation> {
    return this.explorationRepository.investigate(topic, planningContext);
  }
}
