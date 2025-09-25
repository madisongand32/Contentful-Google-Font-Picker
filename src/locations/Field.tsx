// "use client";
import { FieldAppSDK } from "@contentful/app-sdk";
import { Option, Select } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useCallback, useEffect, useState } from "react";

import googleFonts from "../../config/google-fonts.json";

type Font = {
  family: string;
  googleUrl?: string;
};

const HOST_GROTESK_FALLBACK =
  "'Host Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const normalizeValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "family" in value)
    return String((value as { family?: unknown }).family ?? null);
  return null;
};

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

  const families = FAMILIES;

  const [selected, setSelected] = useState<string | null>(() => {
    return normalizeValue(sdk.field.getValue());
  });

  console.log("font chosen", sdk.field.getValue());

  useEffect(() => {
    // enable auto resizing of the iframe the app runs in
    try {
      sdk.window.startAutoResizer();
    } catch (error) {
      console.debug("startAutoResizer failed", error);
    }

    // subscribe to external changes to keep UI in sync
    const detach = sdk.field.onValueChanged((value) =>
      setSelected(normalizeValue(value))
    );

    return () => {
      try {
        if (typeof detach === "function") detach();
      } catch {}
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
    const entry = families.find((font) => font.family === selected);
    if (entry?.googleUrl) injectLink(entry.googleUrl);
  }, [selected, families, injectLink]);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const family = e.target.value || null;
      setSelected(family);
      try {
        if (family === null) {
          await sdk.field.removeValue();
        } else {
          await sdk.field.setValue(family);
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
        <Option value="">{"-- default --"}</Option>
        {families.map((f) => (
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
            // padding: 12,
            // border: "1px solid #eee",
            // borderRadius: 6,
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
