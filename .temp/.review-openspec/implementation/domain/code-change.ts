import type { TaskDTO } from "../../shared/dtos";

export type CodeChange = {
  files: string[];
  verifyCovers(taskDTO: TaskDTO): void;
  verifyStaysWithin(taskDTO: TaskDTO): void;
};
