module.exports = {
  siteMetadata: {
    title: 'Virtual Event',
    description: 'Virtual event',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
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
      resolve: `gatsby-plugin-sass`,
      options: {
        cssLoaderOptions: {
          esModule: false,
          modules: {
            namedExport: false,
          },
        },
      },
    },
    {
      // keep as first gatsby-source-filesystem plugin for gatsby image support
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/static/img`,
        name: 'uploads',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/img`,
        name: 'images',
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-relative-images',
            options: {
              name: 'uploads',
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 2048,
            },
          },
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              destinationDir: 'static',
            },
          },
        ],
      },
    },

    /**
     * This plugin has been deprecated.
     * Gatsby now natively supports client paths.
     * @see https://www.gatsbyjs.com/plugins/gatsby-plugin-create-client-paths/
     * @see https://www.gatsbyjs.com/docs/how-to/routing/client-only-routes-and-user-authentication/#handling-client-only-routes-with-gatsby
     */
    // {
    //   resolve: `gatsby-plugin-create-client-paths`,
    //   options: { prefixes: [`/auth/*`, `/a/*`] },
    // },

    {
      resolve: 'gatsby-plugin-netlify-cms',
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
        enableIdentityWidget: false,

        /**
         * Fixes Module not found: Error: Can't resolve 'path' bug.
         * Webpack 5 doesn't include browser polyfills for node APIs by default anymore,
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
      },
    },

    /**
     * If we are not using `gatsby-plugin-purgecss`, can we remove it from our dependencies?
     */
    // {
    //   resolve: 'gatsby-plugin-purgecss', // purges all unused/unreferenced css rules
    //   options: {
    //     develop: true, // Activates purging in npm run develop
    //     purgeOnly: ['/all.sass'], // applies purging only on the bulma css file
    //   },
    // }, // must be after other CSS plugins
    'gatsby-plugin-netlify', // make sure to keep it last in the array
  ],
}
