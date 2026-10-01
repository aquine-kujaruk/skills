import type { ChangeDTO } from "../../shared/dtos";
import type { DeltaSpec } from "../domain/delta-spec";
import type { MainSpec } from "../domain/main-spec";
import type { SpecValidation } from "../domain/spec-validation";

export interface SpecRepository {
  loadDeltaSpecs(changeDTO: ChangeDTO): Promise<DeltaSpec[]>;
  loadMainSpec(capability: string): Promise<MainSpec>;
  saveMainSpec(mainSpec: MainSpec): Promise<void>;
  validate(): Promise<SpecValidation>;
}
