## generate-google-fonts.ts

Generates `google-fonts.json` file in config by parsing Google Fonts metadata.

### Usage

In the case of new Google fonts added in the future,

Run the script using npx:

```bash
npx tsx scripts/generate-google-fonts.ts
```

### What it does

1. If the input path is missing, it does a shallow git clone --depth 1 https://github.com/google/fonts.git into a temp folder.
2. Recursively finds all METADATA.pb files and parses family name, category, and weight variants.
3. Generates a Google Fonts stylesheet URL of the form: https://fonts.googleapis.com/css2?family=Family+Name:wght@400;700&display=swap
4. Removes duplicates by family and writes google-fonts.json (or your chosen output).

### Output

The script will output:

- ✅ Success message with the file path
- 📂 A JSON file at src/config/google-fonts.json with shape: { families: [{ family, category, weights, googleUrl }] }

### Error Handling

- The script uses a shallow clone to minimize download. Running without an existing local repo requires git.

- Generated googleUrl includes all parsed weights — for many families this can produce very long URLs. Consider post-processing to restrict to a curated subset (e.g., [400,700]) to keep stylesheet size small.

- Script skips METADATA.pb files that fail to parse and logs a warning.

- If cloning fails (no git or network), the script throws and exits non-zero.
