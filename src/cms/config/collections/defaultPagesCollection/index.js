import {
  collectionDefaults
} from "../../patterns";

import marketingPage from "./marketingPage";
import lobbyPage from "./lobbyPage";

const defaultPagesCollection = {
  ...collectionDefaults({
    label: "Default Pages",
    name: "default-pages"
  }),
  files: [
    marketingPage,
    //lobbyPage
  ]
};

export default defaultPagesCollection;