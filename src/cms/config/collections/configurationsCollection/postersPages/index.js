import {
  numberField,
  stringField,
  imageField,
  listField
} from "../../../fields";

import {
  POSTER_PAGES_FILE_PATH
} from "@utils/filePath";

/*
- file: "src/content/posters-pages.json"
  label: "Posters Pages"
  name: "posters-pages"
  fields:
    - {label: "Posters Pages", name: "postersPages", widget: list, fields: [
        {label: "Name", name: "name", widget: string, required: false},
        {label: "Track Group Id", name: "trackGroupId", widget: number},
        {label: "Title", name: "title", widget: string },
        {label: "Subtitle", name: "subtitle", widget: string },
        {label: "Background Image", name: "image", widget: image, required: false},
      ]}
*/

const postersPages = {
  label: "Posters Pages",
  name: "posters-pages",
  file: POSTER_PAGES_FILE_PATH,
  fields: [
    listField({
      label: "Posters Pages",
      name: "postersPages",
      fields: [
        stringField({
          label: "Name",
          name: "name",
          required: false
        }),
        numberField({
          label: "Track Group Id",
          name: "trackGroupId"
        }),
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Subtitle",
          name: "subtitle"
        }),
        imageField({
          label: "Background Image",
          name: "image",
          required: false
        })
      ]
    })
  ]
};

export default postersPages;
