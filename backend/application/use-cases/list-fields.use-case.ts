import type { FieldListItem, FieldRepository } from "../../domain/ports/field.repository.js";

export class ListFieldsUseCase {
  constructor(private readonly fieldRepository: FieldRepository) {}

  execute(): Promise<FieldListItem[]> {
    return this.fieldRepository.list();
  }
}
