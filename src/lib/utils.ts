import { z } from "zod";

export const parseValueWithSchema = <Z extends z.ZodTypeAny, R = z.infer<Z>>(
  schema: Z,
  rawValue: unknown,
  dataMapper?: (input: z.infer<Z>) => R
): R | null => {
  const parsed = schema.safeParse(rawValue);
  if (!parsed.success) return null;
  return (dataMapper ? dataMapper(parsed.data) : parsed.data) as R;
};
