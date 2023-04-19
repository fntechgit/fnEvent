
module.exports = `
  type Button {
    text: String
    link: String
  }
  type ImageWithAlt {
    src: File @fileByRelativePath
    alt: String
  }
  type ColumnAds {
    column: String
    button: Button
    eventId: String
    image: ImageWithAlt
  }
  type Ads {
    section: String
    columnAds: [ColumnAds]
  }
  type AdsJson implements Node {
    ads: [Ads]
  }
`;
