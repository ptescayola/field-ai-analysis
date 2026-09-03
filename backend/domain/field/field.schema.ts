import { z } from "zod";

export const fieldSchema = z.object({
  field: z.object({
    id: z.string(),
    name: z.string(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    area_hectares: z.number().positive(),
  }),
  crop: z.object({
    type: z.string(),
    variety: z.string(),
    planting_date: z.string(),
    growth_stage: z.string(),
  }),
  soil: z.object({
    type: z.string(),
    moisture_percent: z.number().min(0).max(100),
    temperature_c: z.number(),
    ph: z.number(),
  }),
  weather: z.object({
    temperature_c: z.number(),
    humidity_percent: z.number().min(0).max(100),
    rain_last_7_days_mm: z.number().min(0),
    forecast: z.array(
      z.object({
        day: z.string(),
        rain_mm: z.number().min(0),
        max_temperature_c: z.number(),
      })
    ),
  }),
  vegetation: z.object({
    ndvi: z.number().min(-1).max(1),
    ndvi_previous_week: z.number().min(-1).max(1),
  }),
  observations: z.array(z.string()),
});

export type FieldData = z.infer<typeof fieldSchema>;
