import React from 'react';
import PropTypes from 'prop-types';
import maintenanceMode from '../content/maintenance.json';

import HeroComponent from '../components/HeroComponent';

import '../styles/bulma.scss';

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
    <MaintenancePageTemplate
      title={title}
      subtitle={subtitle}
    />
  )
};

export default MaintenancePage;