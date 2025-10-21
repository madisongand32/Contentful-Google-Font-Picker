# Google Font Picker App for Contentful

A custom [Contentful App](https://www.contentful.com/developers/docs/extensibility/app-framework/) that allows editors to select and apply Google Fonts directly inside the Contentful UI, **without the need of the Google Fonts API**. The app integrates with a generated google-fonts.json file to provide up-to-date font options and supports easy integration with frontend frameworks like Next.js.

## 🚀 Getting Started

### Development

Run the app locally inside your Contentful environment:

``npm run start``


- Starts the app in development mode.

- Automatically opens your Contentful app in the browser.

- The app will reload when you make edits.


### Build

``npm run build``


- Builds the app into the ``dist`` folder.

- Optimized for production with minification and hashed filenames.


### Upload to Contentful

#### Manual Upload
``npm run upload``


- Uploads your ``dist`` build to Contentful.

- Walks you through the prompts to select org/app/environment.




### CI/CD Upload
``npm run upload-ci``


Requires environment variables to be set:

````
CONTENTFUL_ORG_ID – Your organization ID

CONTENTFUL_APP_DEF_ID – Your app definition ID

CONTENTFUL_ACCESS_TOKEN – Personal access token (how to create one
)
````




## 📂 Updating the Fonts List

The app relies on a generated JSON file ``(/config/google-fonts.json)`` that defines the available fonts, categories, and weights.

If you want to refresh this list to include new or updated Google Fonts, run the generation script described below.


### 🛠 generate-google-fonts.ts

Generates the ``google-fonts.json`` file in ``/config`` by parsing Google Fonts metadata.

#### Usage

When new fonts are added to Google Fonts, regenerate the JSON file by running:

``npx tsx scripts/generate-google-fonts.ts``

#### What It Does

1. Performs a shallow git clone of the [google/fonts](https://github.com/google/fonts) repo if the input path is missing.

2. Recursively finds all METADATA.pb files and extracts:
````
family name

category (e.g., SANS_SERIF, SERIF)

weights (e.g., 400, 700, etc.)
````

3. Generates a Google Fonts stylesheet URL, e.g.:

``https://fonts.googleapis.com/css2?family=Family+Name:wght@400;700&display=swap``


4. Deduplicates entries and writes a new JSON file at:

``config/google-fonts.json``


#### Output

- ✅ Success message with output path
- 📂 JSON file structured as:
  ````
  {
  "families": [
    {
      "family": "Roboto",
      "category": "SANS_SERIF",
      "weights": [400, 700],
      "googleUrl": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
    }
  ]
  }
  ````

#### Error Handling

- Uses shallow clone (--depth 1) to minimize download size.
- Requires ``git`` and network access when cloning.
- Logs a warning for any ``METADATA.pb`` files it fails to parse.
- ``googleUrl`` includes all parsed weights, which can create long URLs — consider limiting weights ``(e.g., [400,700])`` to keep stylesheet size small.
- Exits with a non-zero code if cloning fails or no git is found.


## 🧩 Contentful Setup

### Install the App in Your Space

1. In Contentful, go to **Apps → Custom Apps**.
2. Click **Install App**.
3. Paste in the [deployed app’s URL](https://contentful-google-font-picker.vercel.app/)
4. Assign the app to the desired space and environment.

### Connect the App to a Field

1. Open your desired **Content Type** in Contentful.

2. Add a new field or edit an existing one.

3. Set the **field type to JSON** — this is required for the app to work.

4. Under the **Appearance tab**, select your Google Font Picker App as the field appearance.

5. Save the Content Type.

> ⚠️ Important: The field must be of type JSON.
> Other field types (e.g., Symbol, Text) will not work properly.




## 🖼️ Frontend Setup

Once the editor selects a font in Contentful, your frontend can consume it as part of your entry’s field data.

### Example (Next.js with Google Fonts)

1. The Google Fonts integration is built into Next.js 13+, so no separate installation is needed. Otherwise, run

``npm install next/font``

2. Import dynamically based on Contentful data:

````
import { Roboto, Open_Sans } from "next/font/google";

const fonts = {
  Roboto: Roboto({ subsets: ["latin"], weight: ["400", "700"] }),
  "Open Sans": Open_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] }),
};

export default function Page({ fontName, content }) {
  const SelectedFont = fonts[fontName] || fonts["Roboto"];
  return (
    <main className={SelectedFont.className}>
      <h1>{content.title}</h1>
      <p>{content.body}</p>
    </main>
  );
}
````

3. Ensure your Contentful field is connected to the Google Font Picker App so editors can choose from the available fonts.


## 🧱 Libraries Used

- [Forma 36](https://f36.contentful.com/) - Contentful’s design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/) - For seamless integration with the Contentful UI


## Learn More

- [Create Contentful App Docs](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/)
- [Contentful App Framework SDK](https://www.contentful.com/developers/docs/extensibility/app-framework/sdk/)
- [Google Fonts Repository](https://github.com/google/fonts)
