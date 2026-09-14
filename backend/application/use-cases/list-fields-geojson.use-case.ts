import {
  fieldToMapFeatures,
  type FieldsFeatureCollection,
} from "../../domain/field/fields-geojson.js"
import type { FieldRepository } from "../../domain/ports/field.repository.js"

export class ListFieldsGeoJsonUseCase {
  constructor(private readonly fieldRepository: FieldRepository) {}

  async execute(): Promise<FieldsFeatureCollection> {
    const items = await this.fieldRepository.list()
    const featureGroups = await Promise.all(
      items.map(async (item) => {
        const field = await this.fieldRepository.getByFileName(item.file)
        return fieldToMapFeatures(item.file, field)
      }),
    )

    return {
      type: "FeatureCollection",
      features: featureGroups.flat(),
    }
  }
}
