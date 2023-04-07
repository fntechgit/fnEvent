import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Header from "../components/Header";
import ClockComponent from "../components/ClockComponent";
import Footer from "../components/Footer";

const TemplateWrapper = ({
  children,
  location,
  summit,
  marketing
}) => {
  const [isFocus, setIsFocus] = useState(true);

  const onFocus = () => setIsFocus(true);
  const onBlur = () => setIsFocus(false);

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });

  return (
    <div id="container">
      <a className="sr-only skip-to-content" href="#content-wrapper">Skip to content</a>
      <Header location={location} />
      <ClockComponent active={isFocus} summit={summit} />
      <main id="content-wrapper">{children}</main>
      <Footer marketing={marketing} />
    </div>
  )
};

const mapStateToProps = ({ summitState }) => ({
  summit: summitState.summit
});

export default connect(mapStateToProps, {})(TemplateWrapper);
