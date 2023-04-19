const siteSettingsTypeDefs = require("./siteSettings/typeDefs");
const adsTypeDefs = require("./ads/typeDefs");
const navbarTypeDefs = require("./navbar/typeDefs");
const footerTypeDefs = require("./footer/typeDefs");

module.exports = [
  siteSettingsTypeDefs,
  adsTypeDefs,
  navbarTypeDefs,
  footerTypeDefs
].join("");
