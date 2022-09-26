const axios = require('axios');
const path = require('path');
const fs = require("fs");
const webpack = require('webpack');
const {createFilePath} = require('gatsby-source-filesystem');
const {fmImagesToRelative} = require('gatsby-remark-relative-images');
const {ClientCredentials} = require('simple-oauth2');
const URI = require('urijs');
const sizeOf = require('image-size');

const colorsFilepath = 'src/content/colors.json';
const disqusFilepath = 'src/content/disqus-settings.json';
const marketingFilepath = 'src/content/marketing-site.json';
const homeFilepath = 'src/content/home-settings.json';
const settingsFilepath = 'src/content/settings.json';

const myEnv = require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const getAccessToken = async (config, scope) => {
  const client = new ClientCredentials(config);

  try {
    return await client.getToken({ scope });
  } catch (error) {
    console.log('Access Token error', error);
  }
};

const SSR_getMarketingSettings = async (baseUrl, summitId) => {
  const params = {
    per_page: 100,
  };

  return await axios.get(
    `${baseUrl}/api/public/v1/config-values/all/shows/${summitId}`,
    { params }
  )
    .then(response => {
      return response.data.data
    })
    .catch(e => console.log('ERROR: ', e));
};

const SSR_getEvents = async (baseUrl, summitId, accessToken, page = 1, results = []) => {
  console.log(`SSR_getEvents page ${page} results ${results.length}`)
  return await axios.get(
    `${baseUrl}/api/v1/summits/${summitId}/events/published`,
    {
      params: {
        access_token: accessToken,
        per_page: 50,
        page: page,
        expand: 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags',
      }
    }).then(({ data }) => {
      console.log(`SSR_getEvents  then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)
      if (data.current_page < data.last_page) {
        return SSR_getEvents(baseUrl, summitId, accessToken, data.current_page + 1, [...results, ...data.data]);
      }

      return [...results, ...data.data];
    })
    .catch(e => console.log('ERROR: ', e));
};

const SSR_getSpeakers = async (baseUrl, summitId, accessToken, filter = null, page = 1, results = []) => {
  console.log(`SSR_getSpeakers page ${page} results ${results.length}`)
  const params = {
    access_token: accessToken,
    per_page: 30,
    page: page,
  };

  if (filter) {
    params['filter[]'] = filter;
  }

  return await axios.get(
    `${baseUrl}/api/v1/summits/${summitId}/speakers/on-schedule`,
    { params }
  )
    .then(({ data }) => {
      console.log(`SSR_getSpeakers  then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)
      if (data.current_page < data.last_page) {
        return SSR_getSpeakers(baseUrl, summitId, accessToken, filter, data.current_page + 1, [...results, ...data.data]);
      }

      return [...results, ...data.data];
    })
    .catch(e => console.log('ERROR: ', e));
};

const SSR_getSummit = async (baseUrl, summitId) => {
  const params = {
    expand: 'event_types,tracks,track_groups,presentation_levels,locations.rooms,locations.floors,order_extra_questions.values,schedule_settings,schedule_settings.filters,schedule_settings.pre_filters',
    t: Date.now()
  };

  return await axios.get(
    `${baseUrl}/api/public/v1/summits/${summitId}`,
    { params }
  )
    .then(({ data }) => data)
    .catch(e => console.log('ERROR: ', e));
};

const SSR_getSummitExtraQuestions = async (baseUrl, summitId, accessToken) => {

    let apiUrl = URI(`${baseUrl}/api/v1/summits/${summitId}/order-extra-questions`);
    apiUrl.addQuery('filter[]', 'class==MainQuestion');
    apiUrl.addQuery('filter[]', 'usage==Ticket');
    apiUrl.addQuery('expand', '*sub_question_rules,*sub_question,*values')
    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('order', 'order');
    apiUrl.addQuery('page', 1);
    apiUrl.addQuery('per_page', 100);

    return await axios.get(apiUrl.toString())
        .then(({data}) => data.data)
        .catch(e => console.log('ERROR: ', e));
};

const SSR_getVoteablePresentations = async (baseUrl, summitId, accessToken, page = 1, results = []) => {
  console.log(`SSR_getVoteablePresentations page ${page} results ${results.length}`)
  return await axios.get(
    `${baseUrl}/api/v1/summits/${summitId}/presentations/voteable`,
    {
      params: {
        access_token: accessToken,
        per_page: 50,
        page: page,
        filter: 'published==1',
        expand: 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags',
      }
    }).then(({ data }) => {
      console.log(`SSR_getVoteablePresentations  then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

      if (data.current_page < data.last_page) {
        return SSR_getVoteablePresentations(baseUrl, summitId, accessToken, data.current_page + 1, [...results, ...data.data]);
      }
      return [...results, ...data.data];
    })
    .catch(e => console.log('ERROR: ', e));
};

exports.onPreBootstrap = async () => {
  const summitId = process.env.GATSBY_SUMMIT_ID;
  const summitApiBaseUrl = process.env.GATSBY_SUMMIT_API_BASE_URL;
  const marketingData = await SSR_getMarketingSettings(process.env.GATSBY_MARKETING_API_BASE_URL, process.env.GATSBY_SUMMIT_ID);
  const colorSettings = fs.existsSync(colorsFilepath) ? JSON.parse(fs.readFileSync(colorsFilepath)) : {};
  const disqusSettings = fs.existsSync(disqusFilepath) ? JSON.parse(fs.readFileSync(disqusFilepath)) : {};
  const marketingSite = fs.existsSync(marketingFilepath) ? JSON.parse(fs.readFileSync(marketingFilepath)) : {};
  const homeSettings = fs.existsSync(homeFilepath) ? JSON.parse(fs.readFileSync(homeFilepath)) : {};
  const globalSettings = fs.existsSync(settingsFilepath) ? JSON.parse(fs.readFileSync(settingsFilepath)) : {};

  const config = {
    client: {
      id: process.env.GATSBY_OAUTH2_CLIENT_ID_BUILD,
      secret: process.env.GATSBY_OAUTH2_CLIENT_SECRET_BUILD
    },
    auth: {
      tokenHost: process.env.GATSBY_IDP_BASE_URL,
      tokenPath: process.env.GATSBY_OAUTH_TOKEN_PATH
    },
    options: {
      authorizationMethod: 'header'
    }
  };

  const accessToken = await getAccessToken(config, process.env.GATSBY_BUILD_SCOPES).then(({ token }) => token.access_token);

  // Marketing Settings
  marketingData.map(({ key, value }) => {
    if (key.startsWith('color_')) colorSettings[key] = value;
    if (key.startsWith('disqus_')) disqusSettings[key] = value;
    if (key.startsWith('summit_')) marketingSite[key] = value;

    if (key === 'schedule_default_image') homeSettings.schedule_default_image = value;
    if (key === 'registration_in_person_disclaimer') marketingSite[key] = value;
    if (key === 'ACTIVITY_CTA_TEXT') marketingSite[key] = value;
  });

  // Set the size property on marketing settings masonry if it's needed
  const migrateMasonry = (masonry) => {
      const sizeRequired = masonry.some(i => !i.hasOwnProperty("size"));
      if (sizeRequired) {
          return masonry.map((i) => {
              isSingle = masonry.some(img => sizeOf(`./static${img.images[0].image}`).height > sizeOf(`./static${i.images[0].image}`).height);
              return { ...i, size: isSingle ? 1: 2 }
          })
      }
      return masonry;
  }

  Object.keys(marketingSite).map((key) => {
      if (key === 'sponsors') marketingSite[key] = migrateMasonry(marketingSite[key]);
  });

  globalSettings.lastBuild = Date.now();

  fs.writeFileSync(colorsFilepath, JSON.stringify(colorSettings), 'utf8');
  fs.writeFileSync(disqusFilepath, JSON.stringify(disqusSettings), 'utf8');
  fs.writeFileSync(marketingFilepath, JSON.stringify(marketingSite), 'utf8');
  fs.writeFileSync(homeFilepath, JSON.stringify(homeSettings), 'utf8');
  fs.writeFileSync(settingsFilepath, JSON.stringify(globalSettings), 'utf8');

  let sassColors = '';
  Object.entries(colorSettings).forEach(([key, value]) => sassColors += `$${key} : ${value};\n`);
  fs.writeFileSync('src/styles/colors.scss', sassColors, 'utf8');

  // Show Events
  const allEvents = await SSR_getEvents(summitApiBaseUrl, summitId, accessToken);
  console.log(`allEvents ${allEvents.length}`);
  fs.writeFileSync('src/content/events.json', JSON.stringify(allEvents), 'utf8');

  // Show Speakers
  const allSpeakers = await SSR_getSpeakers(summitApiBaseUrl, summitId, accessToken);
  console.log(`allSpeakers ${allSpeakers.length}`);
  fs.writeFileSync('src/content/speakers.json', JSON.stringify(allSpeakers), 'utf8');

  // Voteable Presentations

  const allVoteablePresentations = await SSR_getVoteablePresentations(summitApiBaseUrl, summitId, accessToken);
  console.log(`allVoteablePresentations ${allVoteablePresentations.length}`);
  fs.writeFileSync('src/content/voteable_presentations.json', JSON.stringify(allVoteablePresentations), 'utf8');

  // Get Summit Extra Questions
  const extraQuestions = await SSR_getSummitExtraQuestions(summitApiBaseUrl, summitId, accessToken);
  console.log(`extraQuestions ${extraQuestions.length}`);
  fs.writeFileSync('src/content/extra-questions.json', JSON.stringify(extraQuestions), 'utf8');
};

// makes Summit logo optional for graphql queries
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type Summit implements Node {
      logo: String
    }
  `;
  createTypes(typeDefs)
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  /**
   * Gatsby v4 Upgrade NOTE: This is no longer needed in `gatsby-remark-relative-images` v2.
   * @see https://www.npmjs.com/package/gatsby-remark-relative-images#v2-breaking-changes
   */
  // fmImagesToRelative(node); // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
};

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  const summit = await SSR_getSummit(process.env.GATSBY_SUMMIT_API_BASE_URL, process.env.GATSBY_SUMMIT_ID);

  const summitObject = { summit };
  fs.writeFileSync('src/content/summit.json', JSON.stringify(summitObject), 'utf8');

  const nodeContent = JSON.stringify(summit);

  const nodeMeta = {
    ...summit,
    id: createNodeId(`summit-${summit.id}`),
    summit_id: summit.id,
    parent: null,
    children: [],
    internal: {
      type: `Summit`,
      mediaType: `application/json`,
      content: nodeContent,
      contentDigest: createContentDigest(summit)
    }
  };

  const node = Object.assign({}, summit, nodeMeta);
  createNode(node)
};


exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;


  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()));
      return Promise.reject(result.errors)
    }

    const posts = result.data.allMarkdownRemark.edges;

    posts.forEach((edge) => {
      const id = edge.node.id;
      if (edge.node.fields.slug.match(/custom-pages/)) {
        edge.node.fields.slug = edge.node.fields.slug.replace('/custom-pages/', '/');
      }
      createPage({
        path: edge.node.fields.slug,
        component: path.resolve(
          `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
        ),
        // additional data can be passed via context
        context: {
          id,
        },
      })
    })
  })
};

exports.onCreateWebpackConfig = ({ actions, plugins, loaders }) => {
  actions.setWebpackConfig({
    resolve: {
      /**
       * Webpack removed automatic polyfills for these node APIs in v5,
       * so we need to patch them in the browser.
       * @see https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#webpack-5-node-configuration-changed-nodefs-nodepath-
       * @see https://viglucci.io/how-to-polyfill-buffer-with-webpack-5
       */
      fallback: {
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/')
      }
    },
    // canvas is a jsdom external dependency
    externals: ['canvas'],
    plugins: [
      plugins.define({
        'global.GENTLY': false,
        'global.BLOB': false
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ]
  })
};
