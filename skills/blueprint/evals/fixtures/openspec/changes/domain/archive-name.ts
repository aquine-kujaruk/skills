import type { Change } from "./change";

export type ArchiveName = string;

export declare const ArchiveName: {
  from(change: Change, today: string): ArchiveName;
};
