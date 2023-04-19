import {
  imageWithAltFieldset,
  linkImageFieldset
} from "./patterns";

export const hiddenField = ({
  label = "Hidden",
  name = "hidden",
  ...rest
}) => ({
  label,
  name,
  widget: "hidden",
  ...rest
});


export const booleanField = ({
  label = "Boolean",
  name = "boolean",
  ...rest
}) => ({
  label,
  name,
  widget: "boolean",
  ...rest
});

export const numberField = ({
  label = "Number",
  name = "number",
  ...rest
}) => ({
  label,
  name,
  widget: "number",
  ...rest
});

export const textField = ({
  label = "Text",
  name = "text",
  ...rest
}) => ({
  label,
  name,
  widget: "text",
  ...rest
});

export const stringField = ({
  label = "String",
  name = "string",
  ...rest
}) => ({
  label,
  name,
  widget: "string",
  ...rest
});

export const imageField = ({
  label = "Image",
  name = "image",
  ...rest
}) => ({
  label,
  name,
  widget: "image",
  ...rest
});

export const selectField = ({
  label = "Select",
  name = "select",
  options = [],
  ...rest
}) => ({
  label,
  name,
  widget: "select",
  options,
  ...rest
});

export const selectOption = ({
  label = "SelectOption",
  value
}) => ({
  label,
  value
});

/*
{label: "Button", name: "button", widget: object, required: false, fields: [
  {label: "Text", name: "text", widget: string, required: false},
  {label: "Link", name: "link", widget: string, required: false}
]},
*/

export const buttonField = ({
  label = "Button",
  name = "button",
  required = false,
  ...rest
} = {}) => objectField({
  label: label,
  name: name,
  required: required,
  summary: "{{fields.text}} link: {{fields.link}}",
  fields: [
    stringField({
      label: "Text",
      name: "text",
      required: false
    }),
    stringField({
      label: "Link",
      name: "link",
      required: false
    })
  ],
  ...rest
});

export const objectField = ({
  label = "Object",
  name = "object",
  fields = [],
  ...rest
}) => ({
  label,
  name,
  widget: "object",
  fields,
  ...rest
});

export const listField = ({
  label = "List",
  name = "list",
  fields = [],
  ...rest
}) => ({
  label,
  name,
  widget: "list",
  fields,
  ...rest
});

export const imageWithAltField = ({
  label = "Image",
  name = "image",
  imageRequired = false,
  ...rest
} = {}) => objectField({
  label,
  name,
  fields: [
    ...imageWithAltFieldset({
      imageRequired
    })
  ],
  ...rest
});

export const imagesField = ({
  label = "Images",
  name = "images",
  imageRequired = false,
  ...rest
} = {}) => listField({
  label,
  name,
  fields: [
    ...imageWithAltFieldset({
      imageRequired
    })
  ],
  ...rest
});

export const linkImagesField = ({
  label = "Link Images",
  name = "link-images",
  imageRequired = false,
  ...rest
} = {}) => listField({
  label,
  name,
  fields: [
    ...linkImageFieldset({
      imageRequired
    })
  ],
  ...rest
});
