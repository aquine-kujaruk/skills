import type { Decision } from "../../domain/decision";
import type { Question } from "../../domain/question";
import type { ExplorationRepository } from "../exploration.repository";

export class ResolveDecisionUseCase {
  constructor(private readonly explorationRepository: ExplorationRepository) {}

  async execute(question: Question): Promise<Decision> {
    return this.explorationRepository.askReviewer(question);
  }
}
