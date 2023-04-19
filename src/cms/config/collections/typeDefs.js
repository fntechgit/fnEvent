const configurationsCollectionTypeDefs = require("./configurationsCollection/typeDefs");
const defaultPagesCollectionTypeDefs = require("./defaultPagesCollection/typeDefs");

module.exports = [
  configurationsCollectionTypeDefs,
  defaultPagesCollectionTypeDefs
].join("");
