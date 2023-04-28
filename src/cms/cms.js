import CMS from "netlify-cms-app";
import config from "./config";

import "./cms-utils";

import { Widget as FileRelationWidget } from "@ncwidgets/file-relation";
import { Widget as IdWidget } from "@ncwidgets/id";

import IndexPagePreview from "./preview-templates/IndexPagePreview";
import CustomPagePreview from "./preview-templates/CustomPagePreview";

CMS.init({ config });

CMS.registerWidget(IdWidget);
CMS.registerWidget(FileRelationWidget);

CMS.registerPreviewTemplate("index", IndexPagePreview);
CMS.registerPreviewTemplate("pages", CustomPagePreview);