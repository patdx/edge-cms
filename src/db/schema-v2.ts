import { z } from 'zod';

// this is more an experiment, maybe easier than using json schema

const SchemaV2 = z.object({
  /** table name */
  name: z.string(),
  columns: z.record(
    z.string(),
    z.object({
      name: z.string(),
      required: z.boolean(),
      default: z.any(),
      dataType: z.enum(['text', 'number']),
      uiType: z.enum(['textarea', 'json']),
      trim: z.boolean(),
    })
  ),
});
