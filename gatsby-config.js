const {
  STATIC_CONTENT_DIR_PATH
} = require("./src/utils/filePath");

module.exports = {
  siteMetadata: {
    title: "Virtual Event",
    description: "Virtual event",
  },
  plugins: [
    {
      resolve: "gatsby-alias-imports",
      options: {
        aliases: {
          "@utils": `${__dirname}/src/utils`
        }
      }
    },
    {
      /**
       * Gatsby v4 uses ES Modules for importing cssModules by default.
       * Disabling this to avoid needing to update in all files and for compatibility
       * with other plugins/packages that have not yet been updated.
       * @see https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules
       *
       * Also, since libSass was deprecated in October 2020, the Node Sass package has also been deprecated.
       * As such, we have migrated from Node Sass to Dart Sass in package.json.
       * @see https://www.gatsbyjs.com/plugins/gatsby-plugin-sass/#v300
       * @see https://sass-lang.com/blog/libsass-is-deprecated#how-do-i-migrate
       */
      resolve: "gatsby-plugin-sass",
      options: {
        cssLoaderOptions: {
          esModule: false,
          modules: {
            namedExport: false
          }
        }
      }
    },
    {
      // Add image assets before markdown or json files
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/static/img`,
        name: "uploads"
      }
    },
    {
      // Add image assets before markdown or json files
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/img`,
        name: "images"
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/pages`,
        name: "pages"
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/${STATIC_CONTENT_DIR_PATH}`,
        name: "content"
      }
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-transformer-json",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-relative-images",
            options: {
              name: 'uploads',
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              // It"s important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 2048
            }
          },
          {
            resolve: "gatsby-remark-copy-linked-files",
            options: {
              destinationDir: "static",
            }
          }
        ]
      }
    },
    {
      resolve: "gatsby-plugin-netlify-cms",
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
        manualInit: true,
        enableIdentityWidget: false,
        /**
         * Fixes Module not found: Error: Can"t resolve "path" bug.
         * Webpack 5 doesn"t include browser polyfills for node APIs by default anymore,
         * so we need to provide them ourselves.
         * @see https://github.com/postcss/postcss/issues/1509#issuecomment-772097567
         * @see https://github.com/gatsbyjs/gatsby/issues/31475
         * @see https://github.com/gatsbyjs/gatsby/issues/31179#issuecomment-844588682
         */
        customizeWebpackConfig: (config) => {
          config.resolve = {
            ...config.resolve,
            fallback: {
              ...config.resolve.fallback,
              path: require.resolve("path-browserify")
            }
          };
        }
      }
    },
    "gatsby-plugin-netlify", // make sure to keep it last in the array
  ],
}
