import type { Artifact } from "./artifact";

export type ArtifactGraph = {
  artifacts: Artifact[];
  applyRequires: string[];
  requiredInOrder(): Artifact[];
};
