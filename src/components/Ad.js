import React from "react";
import PropTypes from "prop-types";
import Link from "./Link";
import { GatsbyImage } from "gatsby-plugin-image";

import styles from "../styles/advertise.module.scss";

const Ad = ({
  link,
  text,
  image,
  imageSrc,
  alt,
  wrapperClass
}) => (
  <div className={wrapperClass}>
    {!link && image && <GatsbyImage image={image} alt={alt ?? ""} />}
    {!link && imageSrc && <img src={imageSrc} alt={alt ?? ""} />}

    {!text && link && image &&
    <Link to={link}>
      <GatsbyImage image={image} alt={alt ?? ""} />
    </Link>
    }
    {!text && link && imageSrc &&
    <Link to={link}>
      <img src={imageSrc} alt={alt ?? ""} />
    </Link>
    }

    {text && link && image &&
    <>
      <GatsbyImage image={image} alt={alt ?? ""} />
      <Link className={styles.link} to={link}>
        <button className={`${styles.button} button is-large`}>
          <b>{text}</b>
        </button>
      </Link>
    </>
    }
    {text && link && imageSrc &&
    <>
      <img src={imageSrc} alt={alt ?? ""} />
      <Link className={styles.link} to={link}>
        <button className={`${styles.button} button is-large`}>
          <b>{text}</b>
        </button>
      </Link>
    </>
    }
  </div>
);

Ad.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
  image: PropTypes.object,
  imageSrc: PropTypes.string,
  alt: PropTypes.string,
  wrapperClass: PropTypes.string
};

Ad.defaultProps = {
  wrapperClass: ""
};

export default Ad;
