import type { FieldData } from "../field/field.schema.js";

export interface FieldListItem {
  file: string;
  id: string;
  name: string;
}

export interface FieldRepository {
  list(): Promise<FieldListItem[]>;
  getByFileName(fileName: string): Promise<FieldData>;
}
