
module.exports = `
  type Link {
    title: String
    link: String
  }
  type Networks {
    icon: String
    link: String
    display: Boolean
  }
  type Social {
    title: String
    display: Boolean
    networks: [Networks]
  }
  type Logo {
    display: Boolean
  }
  type Columns {
    title: String
    display: Boolean
    items: [Link]
  }
  type FooterJson implements Node {
    legal: [Link]
    social: Social
    logo: Logo
    columns: [Columns]
  }
`;