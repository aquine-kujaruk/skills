import type { Decision } from "./decision";
import type { Finding } from "./finding";
import type { Investigation } from "./investigation";
import type { Topic } from "./topic";

export type Exploration = { topic: Topic; findings: Finding[]; decisions: Decision[] };

export declare const Exploration: {
  from(topic: Topic, investigation: Investigation, decisions: Decision[]): Exploration;
};
