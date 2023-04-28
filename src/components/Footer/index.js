import * as React from "react";
import { connect } from "react-redux";
import FooterTemplate from "./template";

import footerContent from "../../content/footer/index.json";

const Footer = ({ summit, marketing }) => (
  <FooterTemplate
    data={footerContent}
    summit={summit}
    marketing={marketing}
  />
);

const mapStateToProps = ({ summitState }) => ({
  summit: summitState.summit
});

export default connect(mapStateToProps)(Footer);
