
module.exports = `
  type ImageWithAlt {
    src: File @fileByRelativePath
    alt: String
  }
  type LinkImageWithAlt {
    src: File @fileByRelativePath
    alt: String
    link: String
  }
  type MarketingPageMasonry {
    placement: String
    size: Int
    images: [LinkImageWithAlt]
  }
  type MarketingPageLeftColumnWidget {
    display: Boolean
    title: String
  }
  type MarketingPageLeftColumnImageWidget {
    display: Boolean
    title: String
    image: ImageWithAlt
  }
  type MarketingPageLeftColumn {
    schedule: MarketingPageLeftColumnWidget
    disqus: MarketingPageLeftColumnWidget
    image: MarketingPageLeftColumnImageWidget
  }
  type MarketingPageCountdown {
    display: Boolean
    text: String
  }
  type MarketingPageHeroButton {
    text: String
    display: Boolean
  }
  type MarketingPageHeroButtons {
    loginButton: MarketingPageHeroButton
    registerButton: MarketingPageHeroButton
  }
  type MarketingPageHero {
    title: String
    subtitle: String
    date: String
    time: String
    dateLayout: Boolean
    images: [ImageWithAlt]
    background: ImageWithAlt
    buttons: MarketingPageHeroButtons
  }
  type MarketingPageJson implements Node {
    hero: MarketingPageHero
    leftColumn: MarketingPageLeftColumn
    countdown: MarketingPageCountdown
    eventRedirect: Int
    masonry: [MarketingPageMasonry]
  }
`;
