import {
  booleanField,
  stringField,
  objectField,
  listField
} from "../../../fields";

import {
  FOOTER_FILE_PATH
} from "@utils/filePath";

/*
- file: "src/content/footer.json"
  label: "Footer"
  name: "footer"
  fields:
    - {label: "Columns", name: "columns", widget: list, fields: [
        {label: "Title", name: "title", widget: string},
        {label: "Display", name: "display", widget: boolean, required: false},
        {label: "Items", name: "items", widget: list, fields: [
          {label: "Title", name: "title", widget: string},
          {label: "Link", name: "link", widget: string},         
        ]}
      ]}
    - {label: "Logo", name: "logo", widget: object, fields: [
        {label: "Display", name: "display", widget: boolean, required: false},
      ]}
    - {label: "Social", name: "social", widget: object, fields: [
        {label: "Title", name: "title", widget: string},
        {label: "Display", name: "display", widget: boolean, required: false},
        {label: "Networks", name: "networks", widget: list, fields: [
          {label: "Icon", name: "icon", widget: string},
          {label: "Link", name: "link", widget: string},
          {label: "Display", name: "display", widget: boolean, required: false},
        ]}
      ]}
    - {label: "Legal", name: "legal", widget: list, fields: [
        {label: "Title", name: "title", widget: string},
        {label: "Link", name: "link", widget: string},
      ]}
*/

const footer = {
  label: "Footer",
  name: "footer",
  file: FOOTER_FILE_PATH,
  fields: [
    listField({
      label: "Columns",
      name: "columns",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        booleanField({
          label: "Display",
          name: "display",
          required: false
        }),
        listField({
          label: "Items",
          name: "items",
          fields: [
            stringField({
              label: "Title",
              name: "title"
            }),
            stringField({
              label: "Link",
              name: "link"
            })
          ]
        })
      ]
    }),
    objectField({
      label: "Logo",
      name: "logo",
      fields: [
        booleanField({
          label: "Display",
          name: "display",
          required: false
        })
      ]
    }),
    objectField({
      label: "Social",
      name: "social",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        booleanField({
          label: "Display",
          name: "display",
          required: false
        }),
        listField({
          label: "Networks",
          name: "networks",
          fields: [
            stringField({
              label: "Icon",
              name: "icon"
            }),
            stringField({
              label: "Link",
              name: "link"
            }),
            booleanField({
              label: "Display",
              name: "display",
              required: false
            })
          ]
        })
      ]
    }),
    listField({
      label: "Legal",
      name: "legal",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Link",
          name: "link"
        })
      ]
    })
  ]
};

export default footer;