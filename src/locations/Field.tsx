import { FieldAppSDK } from "@contentful/app-sdk";
import { Option, Select } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useCallback, useEffect, useState } from "react";

import googleFonts from "../../config/google-fonts.json";
import { parseFontFieldValue, buildFontFieldValue } from "../lib/field-value";

type Font = {
  family: string;
  googleUrl?: string;
};

const HOST_GROTESK_FALLBACK =
  "'Host Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const parseFamilyFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const familyQuery = parsedUrl.searchParams.get("family") || "";
    const familyPart = familyQuery.split(":")[0];
    return decodeURIComponent(familyPart.replace(/\+/g, " "));
  } catch {
    const match = url.match(/family=([^&]+)/);
    if (!match) return url;
    const familyPart = match[1].split(":")[0];
    return decodeURIComponent(familyPart.replace(/\+/g, " "));
  }
};

// Precompute families at module load — the JSON is static inside the iframe
const FAMILIES: Font[] = (() => {
  const fonts =
    (googleFonts as unknown as { families: Partial<Font>[] }).families || [];
  return fonts
    .map((font) => {
      const googleUrl = font.googleUrl;
      const family =
        font.family || (googleUrl ? parseFamilyFromUrl(googleUrl) : "");
      return {
        family,
        googleUrl,
      } as Font;
    })
    .filter((font) => !!font.family);
})();

const injectedFonts = new Set<string>();

const Field: React.FC = () => {
  const sdk = useSDK<FieldAppSDK>();

  const [selected, setSelected] = useState<string | null>(() => {
    const parsed = parseFontFieldValue(sdk.field.getValue());
    return parsed?.googleFontPicker.family ?? null;
  });

  useEffect(() => {
    // enable auto resizing of the iframe the app runs in
    try {
      sdk.window.startAutoResizer();
    } catch (error) {
      console.debug("startAutoResizer failed", error);
    }

    // subscribe to external changes to keep UI in sync (use Zod-backed parser)
    const detach = sdk.field.onValueChanged((value) => {
      const parsed = parseFontFieldValue(value);
      setSelected(parsed?.googleFontPicker.family ?? null);
    });

    return () => {
      if (typeof detach === "function") detach();
    };
  }, [sdk]);

  const injectLink = useCallback((url?: string) => {
    try {
      if (!url || injectedFonts.has(url)) return;
      injectedFonts.add(url);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-google-fonts", "true");
      link.href = url;
      document.head.appendChild(link);
    } catch (err) {
      console.error("[google-font-picker] injectLink error", err, url);
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
          await sdk.field.setValue(buildFontFieldValue({ family }));
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
