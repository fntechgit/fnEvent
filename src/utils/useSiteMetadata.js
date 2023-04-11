import { graphql, useStaticQuery } from "gatsby";

const siteMetadataQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;

const useSiteMetadata = () => {
  const {
    site: {
      siteMetadata
    }
  } = useStaticQuery(siteMetadataQuery);
  return siteMetadata;
};

export default useSiteMetadata;
