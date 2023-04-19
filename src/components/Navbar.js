import React, {useMemo, useState} from "react";
import { connect } from "react-redux";
import LogoutButton from "./LogoutButton";
import Link from "./Link";
import ProfilePopupComponent from "./ProfilePopupComponent";
import { updateProfilePicture, updateProfile } from "../actions/user-actions";
import { getDefaultLocation } from "../utils/loginUtils";
import { userHasAccessLevel, VirtualAccessLevel } from "../utils/authorizedGroups";

import { PHASES } from "../utils/phasesUtils";
import { PAGE_RESTRICTIONS } from "../cms/config/collections/configurationsCollection/navbar";

import content from "../content/navbar/index.json";

import styles from "../styles/navbar.module.scss";

const Navbar = ({
  isLoggedUser,
  idpProfile,
  logo,
  idpLoading,
  summit,
  updateProfilePicture,
  updateProfile,
  location,
  summitPhase,
  eventRedirect,
  userProfile,
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

  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
          userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false,
      [userProfile]);

  const isCustomPage = (path) => {
    return !isMarketingPage(path) &&
           !isShowPage(path) &&
           !isProfilePage(path) &&
           !isMySchedulePage(path) &&
           !isExtraQuestionsPage(path);
  }

  const isMySchedulePage = (path) => {
    return path.startsWith("/a/my-schedule");
  }

  const isProfilePage = (path) => {
    return path.startsWith("/a/profile");
  }

  const isExtraQuestionsPage = (path) => {
    return path.startsWith("/a/extra-questions");
  }

  const isMarketingPage = (path) => {
      return path === '/';
  }

  const isLobbyPage = (path) => {
    return path === '/a' || path === '/a/';
  }

  const isActivityPage = (path) => {
    return path.startsWith("/a/event");
  }

  const isSponsorPage = (path) => {
    return path.startsWith("/a/sponsor");
  }

  const isSchedulePage = (path) => {
    return path.startsWith("/a/schedule");
  }

  const isShowPage = (path) => {
    return isLobbyPage(path) || // lobby
        isActivityPage(path) || // activity
        isSponsorPage(path) || // expo hall or sponsor page
        isSchedulePage(path);// schedule
  }

  // we assume that all pages under /a/* requires auth except /a/schedule
  // item.requiresAuth allows to mark specific pages that are not under /a/* pattern.
  const showItem = (item) => {
    // check if we have location defined, if so use the path name , else if window is defined use the window.location
    // as a fallback
    const currentPath = location ? location.pathname: (typeof window !== "undefined" ? window.location.pathname: "");
    const passPageRestriction = !item.pageRestriction ||
        item.link === currentPath || // if we are on the same page then show it
        item.pageRestriction.includes(PAGE_RESTRICTIONS.any) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.activity) && isActivityPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.marketing) && isMarketingPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.lobby) && isLobbyPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.show) && isShowPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.customPage) && isCustomPage(currentPath))
    ;

    return item.display &&
           (!item.requiresAuth || isLoggedUser) &&
           (!item.showOnlyAtShowTime || summitPhase >= PHASES.DURING) &&
           passPageRestriction;
  };

  const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);
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
            {content.items.filter(showItem).map((item, index) => (
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

const mapStateToProps = ({ summitState, clockState, settingState, userState }) => ({
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect,
  userProfile: userState.userProfile
});

export default connect(mapStateToProps, {
  updateProfilePicture,
  updateProfile,
})(Navbar);
