export type FontObject = { googleFontPicker: { family: string } };

/**
 * Parse raw field value into object with `googleFontPicker.family`.
 * Always returns consistent object shape, or null if empty.
 */
export const parseFontFieldValue = (value: unknown): FontObject | null => {
  if (typeof value === "string" && value.trim()) {
    return { googleFontPicker: { family: value.trim() } };
  }

  // Optional: handle legacy object shapes
  if (value && typeof value === "object" && "googleFontPicker" in value) {
    const obj = value as Record<string, unknown>;
    if (
      obj.googleFontPicker &&
      typeof (obj.googleFontPicker as any).family === "string"
    ) {
      return {
        googleFontPicker: { family: (obj.googleFontPicker as any).family },
      };
    }
  }

  return null;
};

/**
 * Build canonical field value for Contentful short text field.
 * Returns just the font family string.
 */
export const buildFontFieldValue = (font?: { family: string }): string =>
  font?.family ?? "";
