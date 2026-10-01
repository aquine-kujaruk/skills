import type { Finding } from "./finding";
import type { Question } from "./question";

export type Investigation = { findings: Finding[]; openQuestions: Question[] };
