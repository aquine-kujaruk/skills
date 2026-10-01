import type { Decision } from "../domain/decision";
import type { Exploration } from "../domain/exploration";
import type { Investigation } from "../domain/investigation";
import type { PlanningContext } from "../domain/planning-context";
import type { Question } from "../domain/question";
import type { Topic } from "../domain/topic";

export interface ExplorationRepository {
  loadPlanningContext(): Promise<PlanningContext>;
  investigate(topic: Topic, planningContext: PlanningContext): Promise<Investigation>;
  askReviewer(question: Question): Promise<Decision>;
  presentConclusion(exploration: Exploration): Promise<void>;
}
