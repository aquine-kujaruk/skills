import type { Change } from "../../domain/change";
import type { Task } from "../../domain/task";
import type { ChangeRepository } from "../change.repository";

export class ListPendingTasksUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change): Promise<Task[]> {
    return this.changeRepository.loadPendingTasks(change);
  }
}
