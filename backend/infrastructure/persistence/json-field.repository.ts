import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fieldSchema, type FieldData } from "../../domain/field/field.schema.js";
import type {
  FieldListItem,
  FieldRepository,
} from "../../domain/ports/field.repository.js";

export class JsonFieldRepository implements FieldRepository {
  constructor(private readonly dataDir: string) {}

  async list(): Promise<FieldListItem[]> {
    const files = (await readdir(this.dataDir)).filter((file) =>
      file.endsWith(".json")
    );
    const items: FieldListItem[] = [];

    for (const file of files) {
      const path = join(this.dataDir, file);
      const raw = await readFile(path, "utf-8");
      const field = fieldSchema.parse(JSON.parse(raw));
      items.push({
        file,
        path,
        id: field.field.id,
        name: field.field.name,
      });
    }

    return items;
  }

  async getByFileName(fileName: string): Promise<FieldData> {
    const path = join(this.dataDir, fileName);
    const raw = await readFile(path, "utf-8");
    return fieldSchema.parse(JSON.parse(raw));
  }
}
