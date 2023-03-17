import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

import HeroComponent from '../components/HeroComponent';

const MaintenancePageTemplate = ({
  title,
  subtitle
}) => {
  return (
    <HeroComponent
      title={title}
      subtitle={subtitle}
    />
  );
}

MaintenancePageTemplate.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
}

const MaintenancePage = ({ data }) => {
  const {
    markdownRemark: {
      frontmatter: {
        title,
        subtitle
      }
    }
  } = data;

  return (
    <MaintenancePageTemplate
      title={title}
      subtitle={subtitle}
    />
  )
};


MaintenancePage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
};

export default MaintenancePage;

export const maintenancePageQuery = graphql`
  query MaintenancePageTemplate($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        subtitle
      }
    }
  }
`;
