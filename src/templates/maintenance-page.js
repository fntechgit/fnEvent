import React from 'react';
import PropTypes from 'prop-types';
import maintenanceMode from '../content/maintenance.json';

import Layout from '../components/Layout';
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

const MaintenancePage = () => {
  const {
    title,
    subtitle
  } = maintenanceMode;

  return (
    <Layout>
      <MaintenancePageTemplate
        title={title}
        subtitle={subtitle}
      />
    </Layout>
  )
};

export default MaintenancePage;