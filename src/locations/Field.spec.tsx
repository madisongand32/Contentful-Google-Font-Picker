import { describe, it, expect } from "vitest";
import { parseFontFieldValue, buildFontFieldValue } from "../lib/field-value";

describe("field-value helpers", () => {
  it("parses canonical string value", () => {
    const raw = "Host Grotesk";
    const parsed = parseFontFieldValue(raw);
    expect(parsed).toEqual({
      googleFontPicker: { family: "Host Grotesk" },
    });
  });

  it("returns null for empty string", () => {
    const parsed = parseFontFieldValue("");
    expect(parsed).toBeNull();
  });

  it("returns null for empty object", () => {
    const parsed = parseFontFieldValue({});
    expect(parsed).toBeNull();
  });

  it("parses object shape with googleFontPicker", () => {
    const raw = { googleFontPicker: { family: "Host Grotesk" } };
    const parsed = parseFontFieldValue(raw);
    expect(parsed).toEqual({ googleFontPicker: { family: "Host Grotesk" } });
  });

  it("returns null for object with missing family", () => {
    const parsed = parseFontFieldValue({ googleFontPicker: {} });
    expect(parsed).toBeNull();
  });

  it("builds canonical field value from family", () => {
    const payload = buildFontFieldValue({ family: "Host Grotesk" });
    expect(payload).toEqual("Host Grotesk");
  });

  it("builds empty string when no font is provided", () => {
    const payload = buildFontFieldValue();
    expect(payload).toEqual("");
  });

  it("trims string family", () => {
    const parsed = parseFontFieldValue("  Host Grotesk  ");
    expect(parsed).toEqual({ googleFontPicker: { family: "Host Grotesk" } });
  });
});
