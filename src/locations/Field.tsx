import { FieldAppSDK } from "@contentful/app-sdk";
import { Option, Select } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import googleFonts from "../../config/google-fonts.json";
import { FontSchema, FontFieldSchema } from "../lib/field-value";

type Font = z.infer<typeof FontSchema>;

const HOST_GROTESK_FALLBACK =
  "'Host Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// Precompute families at module load — the JSON is static inside the iframe
const GoogleFontsSchema = z.object({ families: z.array(FontSchema) });
const FAMILIES: Font[] = (() => {
  const result = GoogleFontsSchema.safeParse(googleFonts);
  if (!result.success) {
    console.error("Invalid google-fonts.json structure:", result.error);
    return [];
  }
  return result.data.families.filter((font) => font.family && font.googleUrl);
})();

const injectedFonts = new Set<string>();

const Field: React.FC = () => {
  const sdk = useSDK<FieldAppSDK>();

  const [selected, setSelected] = useState<string | null>(() => {
    const rawValue = sdk.field.getValue();
    const result = FontFieldSchema.safeParse(rawValue);
    return result.success ? result.data?.family ?? null : null;
  });

  useEffect(() => {
    // enable auto resizing of the iframe the app runs in
    try {
      sdk.window.startAutoResizer();
    } catch (error) {
      console.debug("startAutoResizer failed", error);
    }

    // subscribe to external changes to keep UI in sync
    const detach = sdk.field.onValueChanged((value) => {
      const result = FontFieldSchema.safeParse(value);
      setSelected(result.success ? result.data?.family ?? null : null);
    });

    return () => {
      if (typeof detach === "function") detach();
    };
  }, [sdk]);

  const injectLink = useCallback((googleUrl?: string) => {
    try {
      if (!googleUrl || injectedFonts.has(googleUrl)) return;
      injectedFonts.add(googleUrl);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-google-fonts", "true");
      link.href = googleUrl;
      document.head.appendChild(link);
    } catch (err) {
      console.error("[google-font-picker] injectLink error", err, googleUrl);
    }
  }, []);

  useEffect(() => {
    const entry = FAMILIES.find((f) => f.family === selected);
    if (entry?.googleUrl) injectLink(entry.googleUrl);
  }, [selected, injectLink]);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const family = e.target.value || null;
      setSelected(family);

      try {
        if (!family) {
          await sdk.field.removeValue();
        } else {
          const entry = FAMILIES.find((f) => f.family === family);
          if (entry?.googleUrl) {
            // Save a payload using googleUrl consistently
            const fontValue = {
              family,
              googleUrl: entry.googleUrl,
            };
            await sdk.field.setValue(fontValue);
          } else {
            console.error(
              "[google-font-picker] No URL found for font:",
              family
            );
          }
        }
      } catch (error) {
        console.error(
          "[google-font-picker] error saving field value",
          error,
          family
        );
      }
    },
    [sdk]
  );

  return (
    <div>
      <Select
        id="font-family-select"
        value={selected ?? ""}
        onChange={(e) => onChange(e)}
        style={{ width: "100%" }}
      >
        <Option value="">-- default --</Option>
        {FAMILIES.map((f) => (
          <Option key={f.family} value={f.family}>
            {f.family}
          </Option>
        ))}
      </Select>

      <div style={{ marginTop: 16 }}>
        <p style={{ fontWeight: 500 }}>{"Preview"}</p>
        <div
          style={{
            marginTop: 8,
            fontSize: 16,
            fontFamily: selected
              ? `"${selected}", ${HOST_GROTESK_FALLBACK}`
              : HOST_GROTESK_FALLBACK,
          }}
        >
          {"Kick content chaos to the curb with Coin"}
        </div>
      </div>
    </div>
  );
};

export default Field;
