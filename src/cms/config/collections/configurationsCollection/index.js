import {
  collectionDefaults
} from "../../patterns";

import siteSettings from "./siteSettings";
import ads from "./ads";
import navbar from "./navbar";
import footer from "./footer";
import postersPages from "./postersPages";

const configurationsCollection = {
  ...collectionDefaults({
    label: "Configurations",
    name: "configurations"
  }),
  files: [
    siteSettings,
    ads,
    navbar,
    footer,
    postersPages
  ]
};

export default configurationsCollection;