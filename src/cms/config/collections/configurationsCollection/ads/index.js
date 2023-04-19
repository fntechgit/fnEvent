import {
  stringField,
  selectField,
  selectOption,
  buttonField,
  objectField,
  listField,
  imageWithAltField
} from "../../../fields";

import {
  imageWithAltFieldset
} from "../../../patterns";


import {
  ADS_FILE_PATH
} from "@utils/filePath";

/*
- file: "src/content/ads.json"
  label: "Advertisement"
  name: "ads"
  fields:
    - {label: "Ads", name: "ads", widget: list, fields: [
        {label: "Page", name: "section", widget: string},
        {label: "Ads", name: "columnAds", widget: list, required: false, fields: [
          {label: "Image", name: "image", widget: object, required: false, fields: [
            {label: "File", name: "file", widget: image, required: false, default: ''},
            {label: "Alt", name: "alt", widget: string, required: false, default: ''},
          ]},
          {label: "Button", name: "button", widget: object, required: false, fields: [
            {label: "Text", name: "text", widget: string, required: false},
            {label: "Link", name: "link", widget: string, required: false}
          ]},
          {label: "Column", name: "column", widget: select, options: [
            {label: "Left", value: "left" },
            {label: "Center", value: "center" },
            {label: "Right", value: "right" },
          ]},
          {label: "Specific Event?", name: "id", widget: string, required: false, default: 0}
        ]},
      ]}
*/

const ads = {
  label: "Ad Placements",
  name: "ad-placements",
  file: ADS_FILE_PATH,
  fields: [
    listField({
      label: "Ads",
      name: "ads",
      fields: [
        stringField({
          label: "Page",
          name: "section"
        }),
        listField({
          label: "Ads",
          name: "columnAds",
          required: false,
          fields: [
            imageWithAltField(),
            buttonField(),
            selectField({
              label: "Column",
              name: "column",
              options: [
                selectOption({
                  label: "Left",
                  value: "left"
                }),
                selectOption({
                  label: "Center",
                  value: "center"
                }),
                selectOption({
                  label: "Right",
                  value: "right"
                })
              ]
            }),
            stringField({
              label: "Specific Event?",
              name: "id",
              required: false
              // removing default value
              //default: 0
            })
          ]
        })
      ]
    })
  ]
};

export default ads;
