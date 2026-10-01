import type { ExplorationDTO } from "../../shared/dtos";

export type Change = { name: string };

export declare const Change: {
  named(explorationDTO: ExplorationDTO): Change;
};
