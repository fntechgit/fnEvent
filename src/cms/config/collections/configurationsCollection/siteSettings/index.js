import {
  booleanField,
  imageField,
  selectField,
  selectOption,
  objectField
} from "../../../fields";

import {
  SITE_SETTINGS_FILE_PATH
} from "@utils/filePath";

/*
- file: "src/content/site-settings/index.json"
  label: "Site Settings"
  name: "site-settings"
  fields:
    - {label: "Favicons", name: favicons, widget: object, fields: [
        {label: "Favicon 180x180", name: favicon180, widget: image},
        {label: "Favicon 32x32", name: favicon32, widget: image},
        {label: "Favicon 16x16", name: favicon16, widget: image}
      ]}
    - {label: "Widgets", name: widgets, widget: object, fields: [
        {label: "Chat", name: chat, widget: object, fields: [
          {label: "Show QA", name: showQA, widget: boolean, required: false, default: false},
          {label: "Show Help", name: showHelp, widget: boolean, required: false, default: false},
          {label: "Default Filter Criteria", name: defaultScope, widget: select, required: false, default: 'page', options: [
            {label: "In this Room", value: "page" },
            {label: "All Attendees", value: "show" }
          ]}
        ]},
        {label: "Schedule", name: schedule, widget: object, fields: [
          {label: "Allow Clickable Behavior", name: allowClick, widget: boolean, required: false, default: true},                
        ]}
      ]}
*/

const siteSettings = {
  label: "Site Settings",
  name: "site-settings",
  file: SITE_SETTINGS_FILE_PATH,
  fields: [
    objectField({
      label: "Favicons",
      name: "favicons",
      fields: [
        imageField({
          label: "Favicon 180x180",
          name: "favicon180",
          required: false
        }),
        imageField({
          label: "Favicon 32x32",
          name: "favicon32",
          required: false
        }),
        imageField({
          label: "Favicon 16x16",
          name: "favicon16",
          required: false
        })
      ]
    }),
    objectField({
      label: "Widgets",
      name: "widgets",
      fields: [
        objectField({
          label: "Chat",
          name: "chat",
          fields: [
            booleanField({
              label: "Show QA",
              name: "showQA",
              required: false,
              default: false
            }),
            booleanField({
              label: "Show Help",
              name: "showHelp",
              required: false, 
              default: false
            }),
            selectField({
              label: "Default Filter Criteria",
              name: "defaultScope",
              required: false,
              default: 'page',
              options: [
                selectOption({
                  label: "In this Room",
                  value: "page"
                }),
                selectOption({
                  label: "All Attendees",
                  value: "show"
                })
              ]
            })
          ]
        }),
        objectField({
          label: "Schedule",
          name: "schedule",
          fields: [
            booleanField({
              label: "Allow Clickable Behavior",
              name: "allowClick",
              required: false,
              default: true
            }),
          ]
        }),
      ]
    })
  ]
};

export default siteSettings;
