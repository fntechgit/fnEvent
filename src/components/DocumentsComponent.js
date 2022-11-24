import React from "react";
import Link from "../components/Link";
import styles from "../styles/documents.module.scss";

/**
 * This Component is used by activites and by sponsors
 * please check on both places before change it
 * @param event
 * @returns {JSX.Element|null}
 * @constructor
 */
const DocumentsComponent = ({ event }, sponsorPage = false) => {

  const getMaterials = (event) => {
    const allMaterials = [
      ...(event.links || []),
      ...(event.videos || []),
      ...(event.slides || []),
      ...(event.media_uploads || []),
    ];
    return allMaterials
        // on sponsors , materials does not has the property display_on_site
      .filter((m) => m.hasOwnProperty('display_on_site') ? m.display_on_site : true)
      .sort((a, b) => a.order - b.order);
  };

  const sortedMaterials = sponsorPage ? event : getMaterials(event);
  if (sortedMaterials.length === 0) return null;

  return (
    <div>
      <div className={`${styles.docsContainer}`} style={{ marginTop: "1em" }}>
        <div className={`navbar-brand ${styles.title}`}>Media/Links</div>
        <hr />
        {sortedMaterials.map((material, index) => {
          let faIcon = "fa-link";
          switch (material.class_name || material.type) {
            case "PresentationSlide":
            case "Slide":
              faIcon = "fa-file-o";
              break;
            case "PresentationVideo":
            case "Video":
              faIcon = "fa-video-camera";
              break;
            case "PresentationMediaUpload":
              faIcon = "fa-file-o";
              break;
            default:
              break;
          }

          const link =
            material.class_name === "PresentationMediaUpload"
              ? material.public_url
              : material.link;

          return (
            <React.Fragment key={index}>
              {material.class_name === "PresentationSlide" ||
              material.class_name === "PresentationMediaUpload" ||
              material.type === "Slide" ? (
                <div
                  className={`${styles.documentColumn} columns is-mobile is-vcentered`}
                  key={index}
                >
                  <div className="column is-2 is-offset-1">
                    <i className={`fa ${faIcon} icon is-large`} />
                  </div>
                  <div className={`column is-6 ${styles.documentName}`}>
                    <span>{material.name}</span>
                  </div>
                  <div className="column is-2 has-text-right">
                    <Link to={link}>
                      <i className="fa fa-download icon is-large" />
                    </Link>
                  </div>
                  <div className="column is-1" />
                </div>
              ) : (
                <div
                  className={`${styles.documentColumn} columns is-mobile is-vcentered`}
                  key={index}
                >
                  <div className="column is-2 is-offset-1">
                    <i className={`fa ${faIcon} icon is-large`} />
                  </div>
                  <div className={`column is-8 ${styles.documentName}`}>
                    <Link to={link}>
                      <span>{material.name}</span>
                    </Link>
                  </div>
                  <div className="column is-1" />
                </div>
              )}
              <hr />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsComponent;
