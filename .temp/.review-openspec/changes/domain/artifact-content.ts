import type { ExplorationDTO } from "../../shared/dtos";
import type { Artifact } from "./artifact";

export type ArtifactContent = {
  artifact: Artifact;
  text: string;
  verifyGroundedIn(explorationDTO: ExplorationDTO): void;
};
