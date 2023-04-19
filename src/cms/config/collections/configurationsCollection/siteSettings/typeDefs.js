
module.exports = `
  type Favicons {
    favicon180: String
    favicon32: String
    favicon16: String
  }
  type Schedule {
    allowClick: Boolean
  }
  type Chat {
    showQA: Boolean
    showHelp: Boolean
    defaultScope: String
  }
  type Widgets {
    schedule: Schedule
    chat: Chat
  }
  type SiteSettingsJson implements Node {
    favicons: Favicons
    widgets: Widgets
  }
`;
