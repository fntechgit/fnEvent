import configurationsCollection from "./collections/configurationsCollection";
import defaultPagesCollection from "./collections/defaultPagesCollection";

export const collections = [
  configurationsCollection,
  defaultPagesCollection
];

const config = {
  backend: {
    name: "github",
    repo: "fntechgit/fnEvent",
    branch: "main",
    commit_messages: {
      create: "Create {{collection}} “{{slug}}”",
      update: "Update {{collection}} “{{slug}}”",
      delete: "Delete {{collection}} “{{slug}}”",
      uploadMedia: "[skip ci] Upload “{{path}}”",
      deleteMedia: "[skip ci] Delete “{{path}}”",
    }
  },
  // It is not required to set `load_config_file` if the `config.yml` file is
  // missing, but will improve performance and avoid a load error.
  load_config_file: false,
  media_folder: "static/img",
  public_folder: "/img",
  collections: collections
};

export default config;