import type { FieldData } from "../../domain/field/field.schema.js";
import type { FieldRepository } from "../../domain/ports/field.repository.js";

export class GetFieldUseCase {
  constructor(private readonly fieldRepository: FieldRepository) {}

  execute(fileName: string): Promise<FieldData> {
    return this.fieldRepository.getByFileName(fileName);
  }
}
