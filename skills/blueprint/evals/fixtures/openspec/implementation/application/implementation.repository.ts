import type { ChangeDTO, TaskDTO } from "../../shared/dtos";
import type { ApplyContext } from "../domain/apply-context";
import type { CodeChange } from "../domain/code-change";
import type { Verification } from "../domain/verification";

export interface ImplementationRepository {
  loadApplyContext(changeDTO: ChangeDTO): Promise<ApplyContext>;
  implement(taskDTO: TaskDTO, applyContext: ApplyContext): Promise<CodeChange>;
  verify(taskDTO: TaskDTO): Promise<Verification>;
}
