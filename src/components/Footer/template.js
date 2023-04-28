import * as React from "react";
import FooterMarketing from "../FooterMarketing";
import Link from "../Link";

import styles from "../../styles/footer.module.scss";

const FooterTemplate = ({ data, summit, marketing }) => {
  if (marketing) {
    return (
      <FooterMarketing />
    );
  } else {
    return (
      <React.Fragment>
        {data.columns.filter(col => col.display === false).length === data.columns.length ?
          <React.Fragment>
            {data.logo.display && data.social.display ?
              <footer className="footer">
                <div className={`${styles.footerColummns} columns`}>
                  <div className="column is-one-quarter">
                  {summit?.logo &&
                    <img alt="logo" src={summit.logo} style={{ marginTop: '10px' }} />
                  }
                  </div>
                  {data.social.display &&
                    <div className="column is-one-quarter is-offset-half">
                      <h4>{data.social.title}</h4>
                      <div className={styles.socialContainer}>
                        {data.social.networks.map((net, index) => (
                          net.display &&
                          <Link to={net.link} key={index}>
                            <i className={`fa icon is-large ${net.icon}`}></i>
                          </Link>
                        ))}
                      </div>
                    </div>
                  }
                </div>
              </footer>
              : null
            }
          </React.Fragment>
          :
          <footer className="footer">
            {data.logo.display && summit?.logo ?
              <div className="columns">
                <div className="column is-one-quarter">
                  <img alt="logo" src={summit.logo} style={{ margin: '10px 0 4rem' }} />
                </div>
              </div>
              : null
            }
            <div className={`${styles.footerColummns} columns`}>
              <div className="column is-three-quarters">
                <div className="columns" style={{ flexWrap: 'wrap' }}>
                  {data.columns.map((col, index) => {
                    return (
                      col.display &&
                      <div className={`column is-3 ${index > 0 && index % 3 !== 0 && index !== 0 ? 'is-offset-1' : ''}`} key={index}>
                        <h4>
                          {col.title}
                        </h4>
                        <ul>
                          {col.items.map((item, index) => (
                            <li key={`item-${index}`}>
                              <Link to={item.link} className={styles.link} key={index}>
                                <h5>{item.title}</h5>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
              {data.social.display &&
                <div className="column is-one-quarter">
                  <h4>{data.social.title}</h4>
                  <div className={styles.socialContainer}>
                    {data.social.networks.map((net, index) => (
                      net.display &&
                      <Link to={net.link} className={styles.link} key={index}>
                        <i className={`fa icon is-large ${net.icon}`} />
                      </Link>
                    ))}
                  </div>
                </div>
              }
            </div>
          </footer>
        }
        <div className={styles.legalsBar}>
          {data.legal.map((item, index) => {
            return (
              <Link to={item.link} className={styles.link} key={index}>
                <span className={styles.legalItem}>
                  {item.title}
                </span>
              </Link>
            )
          })}
          <span className={styles.copyright}>
            All Rights Reserved &copy; {new Date().getFullYear()}
          </span>
        </div>
      </React.Fragment>
    );
  }
};

export default FooterTemplate;
