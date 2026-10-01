import { ArchiveName } from "../../domain/archive-name";
import type { Change } from "../../domain/change";
import type { ChangeRepository } from "../change.repository";

export class ArchiveChangeUseCase {
  constructor(private readonly changeRepository: ChangeRepository) {}

  async execute(change: Change): Promise<ArchiveName> {
    const today = await this.changeRepository.today();
    const archiveName = ArchiveName.from(change, today);
    await this.changeRepository.archive(change, archiveName);
    return archiveName;
  }
}
