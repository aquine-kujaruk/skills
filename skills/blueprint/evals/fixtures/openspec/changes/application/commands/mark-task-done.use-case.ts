import type { Change } from "../../domain/change";
import type { Task } from "../../domain/task";
import type { ChangeRepository } from "../change.repository";

export class MarkTaskDoneUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change, task: Task): Promise<Task> {
    await this.changeRepository.markTaskDone(change, task);
    return task;
  }
}
