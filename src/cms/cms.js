import CMS from "netlify-cms-app";
import config from "./config";

import "./cms-utils";

import MarketingPagePreview from './preview-templates/MarketingPagePreview'
import VirtualBoothPagePreview from './preview-templates/VirtualBoothPagePreview'
import { Widget as FileRelationWidget } from "@ncwidgets/file-relation";
import { Widget as IdWidget } from "@ncwidgets/id";

import IndexPagePreview from "./preview-templates/IndexPagePreview";
import CustomPagePreview from "./preview-templates/CustomPagePreview";

CMS.init({ config });

CMS.registerPreviewTemplate('virtualBoothPage', VirtualBoothPagePreview)
CMS.registerPreviewTemplate('marketing', MarketingPagePreview)CMS.registerWidget(IdWidget);
CMS.registerWidget(FileRelationWidget);

CMS.registerPreviewTemplate("index", IndexPagePreview);
CMS.registerPreviewTemplate("pages", CustomPagePreview);