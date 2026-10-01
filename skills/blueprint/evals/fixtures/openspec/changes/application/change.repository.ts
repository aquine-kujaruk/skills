import type { ExplorationDTO } from "../../shared/dtos";
import type { ArchiveName } from "../domain/archive-name";
import type { Artifact } from "../domain/artifact";
import type { ArtifactContent } from "../domain/artifact-content";
import type { ArtifactGraph } from "../domain/artifact-graph";
import type { ArtifactInstructions } from "../domain/artifact-instructions";
import type { Change } from "../domain/change";
import type { Task } from "../domain/task";

export interface ChangeRepository {
  scaffold(change: Change): Promise<void>;
  loadArtifactGraph(change: Change): Promise<ArtifactGraph>;
  loadInstructions(change: Change, artifact: Artifact): Promise<ArtifactInstructions>;
  loadArtifacts(change: Change, artifactIds: string[]): Promise<ArtifactContent[]>;
  loadExistingArtifacts(change: Change): Promise<ArtifactContent[]>;
  draftArtifact(
    instructions: ArtifactInstructions,
    explorationDTO: ExplorationDTO,
    dependencies: ArtifactContent[],
  ): Promise<ArtifactContent>;
  draftRevision(content: ArtifactContent, explorationDTO: ExplorationDTO): Promise<ArtifactContent>;
  saveArtifact(change: Change, content: ArtifactContent): Promise<void>;
  loadPendingTasks(change: Change): Promise<Task[]>;
  markTaskDone(change: Change, task: Task): Promise<void>;
  today(): Promise<string>;
  archive(change: Change, archiveName: ArchiveName): Promise<void>;
}
