import {
  stringField,
  imageField,
  listField
} from "./fields";

export const collectionDefaults = ({
  label,
  name
}) => ({
  label,
  name,
  /**
   * @see https://decapcms.org/docs/beta-features/#folder-collections-media-and-public-folder
   */
  media_folder: "",
  public_folder: "",
  editor: {
    preview: false
  }
});

export const imageWithAltFieldset = ({
  imageRequired = false
} = {}) => ([
  imageField({
    label: "Src",
    name: "src",
    required: imageRequired
    // removing allowance of empty value
    // default: ""
  }),
  stringField({
    label: "Alt",
    name: "alt",
    required: false
    // removing allowance of empty value
    // default: ""
  })
]);

export const linkImageFieldset = ({
  imageRequired = false
} = {}) => ([
  ...imageWithAltFieldset({
    imageRequired
  }),
  stringField({
    label: "Link",
    name: "link",
    required: false
  })
]);
