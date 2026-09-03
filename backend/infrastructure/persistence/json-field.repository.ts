import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { isValidFieldFile } from "../../domain/field/field-file.js";
import { fieldSchema, type FieldData } from "../../domain/field/field.schema.js";
import type {
  FieldListItem,
  FieldRepository,
} from "../../domain/ports/field.repository.js";

export class JsonFieldRepository implements FieldRepository {
  constructor(private readonly dataDir: string) {}

  async list(): Promise<FieldListItem[]> {
    const files = (await readdir(this.dataDir))
      .filter(isValidFieldFile)
      .sort();

    return Promise.all(
      files.map(async (file) => {
        const field = await this.readField(file);
        return {
          file,
          id: field.field.id,
          name: field.field.name,
        };
      })
    );
  }

  async getByFileName(fileName: string): Promise<FieldData> {
    if (!isValidFieldFile(fileName)) {
      throw new Error("Invalid field file name.");
    }

    return this.readField(fileName);
  }

  private async readField(fileName: string): Promise<FieldData> {
    const path = join(this.dataDir, fileName);
    const raw = await readFile(path, "utf-8");
    return fieldSchema.parse(JSON.parse(raw));
  }
}
