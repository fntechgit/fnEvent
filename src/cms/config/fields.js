import {
  imageWithAltFieldset,
  linkImageFieldset
} from "./patterns";

export const hiddenField = ({
  label = "Hidden",
  name = "hidden",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "hidden",
  ...rest
});


export const booleanField = ({
  label = "Boolean",
  name = "boolean",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "boolean",
  ...rest
});

export const numberField = ({
  label = "Number",
  name = "number",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "number",
  ...rest
});

export const stringField = ({
  label = "String",
  name = "string",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "string",
  ...rest
});

export const textField = ({
  label = "Text",
  name = "text",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "text",
  ...rest
});

export const markdownField = ({
  label = "Markdown",
  name = "markdown",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "markdown",
  ...rest
});

export const imageField = ({
  label = "Image",
  name = "image",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "image",
  ...rest
});

export const fileField = ({
  label = "File",
  name = "file",
  required = false,
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "file",
  ...rest
});

export const selectField = ({
  label = "Select",
  name = "select",
  required = false,
  options = [],
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "select",
  options,
  ...rest
});

export const selectOption = ({
  label = "SelectOption",
  value,
  required = false,
  ...rest
} = {}) => ({
  label,
  value,
  required,
  ...rest
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
  label,
  name,
  required,
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
  required = false,
  fields = [],
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "object",
  fields,
  ...rest
});

export const listField = ({
  label = "List",
  name = "list",
  required = false,
  fields = [],
  ...rest
} = {}) => ({
  label,
  name,
  required,
  widget: "list",
  fields,
  ...rest
});

export const imageWithAltField = ({
  label = "Image",
  name = "image",
  required = false,
  imageRequired = false,
  ...rest
} = {}) => objectField({
  label,
  name,
  required,
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
  required = false,
  imageRequired = false,
  ...rest
} = {}) => listField({
  label,
  name,
  required,
  fields: [
    ...imageWithAltFieldset({
      imageRequired
    })
  ],
  ...rest
});

export const linkImageField = ({
  label = "Link Image",
  name = "link-image",
  required = false,
  imageRequired = false,
  ...rest
} = {}) => objectField({
  label,
  name,
  required,
  fields: [
    ...linkImageFieldset({
      imageRequired
    })
  ],
  ...rest
});

export const linkImagesField = ({
  label = "Link Images",
  name = "link-images",
  required = false,
  imageRequired = false,
  ...rest
} = {}) => listField({
  label,
  name,
  required,
  fields: [
    ...linkImageFieldset({
      imageRequired
    })
  ],
  ...rest
});
