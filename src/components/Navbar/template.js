import React, { useState } from "react";

import Link from "../Link";
import ProfilePopupComponent from "../ProfilePopupComponent";
import LogoutButton from "../LogoutButton";

import styles from "../../styles/navbar.module.scss";

const NavbarTemplate = ({
  data,
  location,
  summitPhase,
  summit,
  isLoggedUser,
  idpLoading,
  idpProfile,
  updateProfile,
  updateProfilePicture,
  defaultPath,
  logo
}) => {
  const [active, setActive] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleHamburger = () => {
    // toggle the active boolean in the state
    setActive(!active);
  };

  const handleTogglePopup = () => {
    if (showProfile) {
      document.body.classList.remove("is-clipped");
    } else {
      document.body.classList.add("is-clipped");
    }
    setShowProfile(!showProfile);
  };

  const navBarActiveClass = active ? styles.isActive : "";

  return (
    <React.Fragment>
      <nav
        className={`${styles.navbar}`}
        role="navigation"
        aria-label="main navigation"
      >
        <div className={styles.navbarBrand}>
          <Link
            to={isLoggedUser ? defaultPath : "/"}
            className={styles.navbarItem}
          >
            {logo && <img src={logo} alt={summit.name} />}
          </Link>

          <button
            className={`link ${styles.navbarBurger} ${styles.burger} ${navBarActiveClass}`}
            aria-label="menu"
            aria-expanded="false"
            data-target="navbar"
            onClick={() => toggleHamburger()}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <div
          id="navbar"
          className={`${styles.navbarMenu} ${navBarActiveClass}`}
        >
          <div className={styles.navbarStart} />
          <div className={styles.navbarEnd}>
            {data.map((item, index) => (
              <div className={styles.navbarItem} key={index}>
                <Link to={item.link} className={styles.link}>
                  <span>{item.title}</span>
                </Link>
              </div>
            ))}
            {isLoggedUser && (
              <div className={styles.navbarItem}>
                <button className="link" onClick={() => handleTogglePopup()}>
                  <img
                    alt="profile pic"
                    className={styles.profilePic}
                    src={idpProfile?.picture}
                  />
                </button>
                {showProfile && (
                  <ProfilePopupComponent
                    userProfile={idpProfile}
                    showProfile={showProfile}
                    idpLoading={idpLoading}
                    changePicture={updateProfilePicture}
                    changeProfile={updateProfile}
                    closePopup={() => handleTogglePopup()}
                  />
                )}
              </div>
            )}
            <LogoutButton styles={styles} isLoggedUser={isLoggedUser} />
          </div>
        </div>
      </nav>
    </React.Fragment>
  );
};

export default NavbarTemplate;
