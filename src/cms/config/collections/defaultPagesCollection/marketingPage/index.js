import {
  hiddenField,
  booleanField,
  numberField,
  stringField,
  selectField,
  selectOption,
  objectField,
  listField,
  imageWithAltField,
  imagesField,
  linkImagesField
} from "../../../fields";

import {
  MARKETING_PAGE_FILE_PATH
} from "@utils/filePath";

const marketingPage = {
  label: "Marketing Page",
  name: "marketing-page",
  file: MARKETING_PAGE_FILE_PATH,
  fields: [
    hiddenField({
      label: "Template Key",
      name: "templateKey",
      default: "marketing-page"
    }),
    objectField({
      label: "Hero",
      name: "hero",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Subtitle",
          name: "subtitle",
          required: false
        }),
        stringField({
          label: "Date",
          name: "date",
          required: false
        }),
        booleanField({
          label: "Date Layout",
          name: "dateLayout",
          required: false
        }),
        stringField({
          label: "Time",
          name: "time",
          required: false
        }),
        objectField({
          label: "Buttons",
          name: "buttons",
          fields: [
            objectField({
              label: "Register Button",
              name: "registerButton",
              fields: [
                stringField({
                  label: "Text",
                  name: "text"
                }),
                booleanField({
                  label: "Display",
                  name: "display",
                  required: false
                })
              ]
            }),
            objectField({
              label: "Login Button",
              name: "loginButton",
              fields: [
                stringField({
                  label: "Text",
                  name: "text"
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
        imageWithAltField({
          label: "Background Image",
          name: "background"
        }),
        imagesField()
      ]
    }),
    objectField({
      label: "Countdown",
      name: "countdown",
      fields: [
        booleanField({
          label: "Should Display?",
          name: "display",
          required: false
        }),
        stringField({
          label: "Text", 
          name: "text"
        })
      ]
    }),
    objectField({
      label: "Widgets",
      name: "leftColumn",
      fields: [
        objectField({
          label: "Schedule",
          name: "schedule",
          fields: [
            booleanField({
              label: "Display",
              name: "display",
              required: false
            }),
            stringField({
              label: "Title", 
              name: "title"
            })
          ]
        }),
        objectField({
          label: "Disqus",
          name: "disqus",
          fields: [
            booleanField({
              label: "Display",
              name: "display",
              required: false
            }),
            stringField({
              label: "Title", 
              name: "title",
              required: false
            })
          ]
        }),
        objectField({
          label: "Image",
          name: "image",
          fields: [
            booleanField({
              label: "Display",
              name: "display",
              required: false
            }),
            stringField({
              label: "Title", 
              name: "title"
            }),
            imageWithAltField()
          ]
        })
      ]
    }),
    numberField({
      label: "Redirect to Event",
      name: "eventRedirect",
      required: false,
      hint: "User will be redirected to this event after login"
    }),
    listField({
      label: "Masonry",
      name: "masonry",
      fields: [
        stringField({
          label: "Placement",
          name: "placement",
          required: false
        }),
        selectField({
          label: "Size",
          name: "size",
          options: [
            selectOption({
              label: "Single",
              value: 1
            }),
            selectOption({
              label: "Double",
              value: 2
            })
          ]
        }),
        linkImagesField({
          label: "Images",
          name: "images",
          imageRequired: true
        })
      ]
    })
  ]
};

export default marketingPage;
