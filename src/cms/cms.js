import CMS from 'netlify-cms-app'

import './cms-utils';

import IndexPagePreview from './preview-templates/IndexPagePreview'
import CustomPagePreview from './preview-templates/CustomPagePreview'
import MarketingPagePreview from './preview-templates/MarketingPagePreview'
import VirtualBoothPagePreview from './preview-templates/VirtualBoothPagePreview'

import { Widget as FileRelationWidget } from '@ncwidgets/file-relation'
import { Widget as IdWidget } from '@ncwidgets/id'

CMS.registerWidget(IdWidget)
CMS.registerWidget(FileRelationWidget)

CMS.registerPreviewTemplate('index', IndexPagePreview)
CMS.registerPreviewTemplate('pages', CustomPagePreview)
CMS.registerPreviewTemplate('virtualBoothPage', VirtualBoothPagePreview)
CMS.registerPreviewTemplate('marketing', MarketingPagePreview)