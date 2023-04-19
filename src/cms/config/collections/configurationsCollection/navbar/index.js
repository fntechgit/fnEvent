import {
  booleanField,
  stringField,
  selectField,
  selectOption,
  listField
} from "../../../fields";

import {
  NAVBAR_FILE_PATH
} from "@utils/filePath";

const PAGE_RESTRICTIONS = {
  any: "ANY",
  activity: "ACTIVITY",
  marketing: "MARKETING",
  lobby: "LOBBY",
  show: "SHOW",
  customPage: "CUSTOM_PAGE"
};

const getPageRestrictionsOptions = () =>
  Object.entries(PAGE_RESTRICTIONS).map(([key, value]) => selectOption({ label: value, value: value }));

/*
- file: "src/content/navbar.json"
  label: "Navbar"
  name: "navbar"
  fields:
    - {label: "Navbar", name: "items", widget: list, fields: [
        {label: "Title", name: "title", widget: string},
        {label: "Link", name: "link", widget: string},
        {label: "Display?", name: "display", widget: boolean, required: false},
        {label: "Requires Auth?", name: "requiresAuth", widget: boolean, required: false, default: false},
        {label: "Show only at Show Time?", name: "showOnlyAtShowTime", widget: boolean, required: false, default: false},
        {label: "Show only on page", name: "pageRestriction", widget: select, multiple: true, default: ["ANY"], options: ["ANY", "MARKETING", "LOBBY", "ACTIVITY", "SHOW", "CUSTOM_PAGE"]},
      ]}
*/

const navbar = {
  label: "Navbar",
  name: "navbar",
  file: NAVBAR_FILE_PATH,
  fields: [
    listField({
      label: "Navbar",
      name: "items",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Link",
          name: "link"
        }),
        booleanField({
          label: "Display?",
          name: "display",
          required: false
        }),
        booleanField({
          label: "Requires Auth?",
          name: "requiresAuth",
          required: false,
          default: false
        }),
        booleanField({
          label: "Show only at Show Time?",
          name: "showOnlyAtShowTime",
          required: false,
          default: false
        }),
        selectField({
          label: "Show only on page",
          name: "pageRestriction",
          multiple: true,
          required: false,
          default: [PAGE_RESTRICTIONS.any],
          options: getPageRestrictionsOptions()
        })
      ]
    })
  ]
};

export {
  PAGE_RESTRICTIONS
};

export default navbar;
