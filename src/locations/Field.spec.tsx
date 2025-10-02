import { describe, it, expect } from "vitest";
import { FontFieldSchema } from "../lib/field-value";

describe("FontFieldSchema validation", () => {
  it("validates valid font object", () => {
    const raw = {
      family: "Host Grotesk",
      googleUrl: "https://fonts.googleapis.com/css2?family=Host+Grotesk",
    };
    const result = FontFieldSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(raw);
    }
  });

  it("accepts null value", () => {
    const result = FontFieldSchema.safeParse(null);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it("rejects invalid object format", () => {
    const raw = { family: "Host Grotesk" }; // missing googleUrl
    const result = FontFieldSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = FontFieldSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects string values", () => {
    const result = FontFieldSchema.safeParse("Host Grotesk");
    expect(result.success).toBe(false);
  });

  it("rejects objects with wrong types", () => {
    const raw = { family: 123, googleUrl: true };
    const result = FontFieldSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  it("allows different valid families", () => {
    const raw = {
      family: "Roboto",
      googleUrl: "https://fonts.googleapis.com/css2?family=Roboto",
    };
    const result = FontFieldSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it("requires googleUrl to be non-empty string", () => {
    const raw = {
      family: "Roboto",
      googleUrl: "",
    };
    const result = FontFieldSchema.safeParse(raw);
    expect(result.success).toBe(false); // empty string not valid
  });
});
