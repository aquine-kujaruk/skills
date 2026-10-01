import { Exploration } from "../../domain/exploration";
import type { Decision } from "../../domain/decision";
import type { Investigation } from "../../domain/investigation";
import type { Topic } from "../../domain/topic";
import type { ExplorationRepository } from "../exploration.repository";

export class ConcludeExplorationUseCase {
  constructor(private readonly explorationRepository: ExplorationRepository) {}

  async execute(topic: Topic, investigation: Investigation, decisions: Decision[]): Promise<Exploration> {
    const exploration = Exploration.from(topic, investigation, decisions);
    await this.explorationRepository.presentConclusion(exploration);
    return exploration;
  }
}
