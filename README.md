# Google Font Picker App for Contentful

This is a custom Contentful App that allows editors to pick a Google Font directly within Contentful. The app integrates with a fonts.json file that defines the available fonts and makes it easy to apply them on your frontend.

## 🚀 Getting Started

### Development

Run the app locally inside your Contentful environment:

npm start


Starts the app in development mode.

Automatically opens your Contentful app in the browser.

The app will reload when you make edits.


### Build

npm run build


Builds the app into the dist folder.

Optimized for production with minification and hashed filenames.


### Upload to Contentful

Manual Upload
npm run upload


Uploads your dist build to Contentful.

Walks you through the prompts to select org/app/environment.


### CI/CD Upload
npm run upload-ci


Requires environment variables to be set:

CONTENTFUL_ORG_ID – Your organization ID

CONTENTFUL_APP_DEF_ID – Your app definition ID

CONTENTFUL_ACCESS_TOKEN – Personal access token (how to create one
)



## 📂 Updating Fonts

This app relies on a fonts.json file that defines the list of available fonts from Google Fonts.
