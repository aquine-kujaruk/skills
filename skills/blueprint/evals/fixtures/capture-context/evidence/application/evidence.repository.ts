import type { Session } from "../domain/session";
import type { Activity } from "../domain/activity";
import type { Image } from "../domain/image";
import type { NarrationFragment } from "../domain/narration-fragment";
import type { Timeline } from "../domain/timeline";

// Glue of the evidence context: FFmpeg, OpenAI (transcription) and SQLite.
export interface EvidenceRepository {
  extractImages(session: Session): Promise<Image[]>;
  // Opportunity: split the audio into fragments and transcribe them concurrently.
  transcribeNarration(session: Session): Promise<NarrationFragment[]>;
  loadActivity(session: Session): Promise<Activity>;
  saveTimeline(timeline: Timeline): Promise<void>;
}
