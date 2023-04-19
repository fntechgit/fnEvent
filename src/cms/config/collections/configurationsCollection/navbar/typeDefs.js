
module.exports = `
  type NavbarItem {
    title: String
    link: String
    display: Boolean
    requiresAuth: Boolean
    pageRestriction: [String]
  }

  type NavbarJson implements Node {
    items: [NavbarItem]
  }
`;