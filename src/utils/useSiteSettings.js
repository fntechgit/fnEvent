import { graphql, useStaticQuery } from "gatsby";

const siteSettingsQuery = graphql`
  query {
    siteSettingsJson {
      favicons {
        favicon16
        favicon32
        favicon180
      }
      widgets {
        chat {
          defaultScope
          showHelp
          showQA
        }
        schedule {
          allowClick
        }
      }
    }
  }
`;

const useSiteSettings = () => {
  const { siteSettingsJson } = useStaticQuery(siteSettingsQuery);
  return siteSettingsJson;
};

export default useSiteSettings;
