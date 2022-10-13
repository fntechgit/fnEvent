import React, {useMemo, useState} from "react";
import { connect } from "react-redux";
import LogoutButton from "./LogoutButton";
import Link from "./Link";
import ProfilePopupComponent from "./ProfilePopupComponent";
import { updateProfilePicture, updateProfile } from "../actions/user-actions";
import { getDefaultLocation } from "../utils/loginUtils";
import Content from "../content/navbar.json";
import { PHASES } from "../utils/phasesUtils";

import styles from "../styles/navbar.module.scss";
import { userHasAccessLevel, VirtualAccessLevel } from "../utils/authorizedGroups";
const PAGE_RESTRICTION_ACTIVITY = 'ACTIVITY';
const PAGE_RESTRICTION_MARKETING = 'MARKETING';
const PAGE_RESTRICTION_LOBBY = 'LOBBY';
const PAGE_RESTRICTION_ANY = 'ANY';
const PAGE_RESTRICTION_SHOW = 'SHOW';
const PAGE_RESTRICTION_CUSTOM_PAGE = 'CUSTOM_PAGE';

const Navbar = ({
  isLoggedUser,
  idpProfile,
  logo,
  idpLoading,
  summit,
  updateProfilePicture,
  updateProfile,
  location,
  summit_phase,
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
        item.pageRestriction.includes(PAGE_RESTRICTION_ANY) ||
        (item.pageRestriction.includes(PAGE_RESTRICTION_ACTIVITY) && isActivityPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTION_MARKETING) && isMarketingPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTION_LOBBY) && isLobbyPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTION_SHOW) && isShowPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTION_CUSTOM_PAGE) && isCustomPage(currentPath))
    ;

    return item.display &&
           (!item.requiresAuth || isLoggedUser) &&
           (!item.showOnlyAtShowTime || summit_phase >= PHASES.DURING) &&
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
            data-target="navbarBasicExample"
            onClick={() => toggleHamburger()}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <div
          id="navbarBasicExample"
          className={`${styles.navbarMenu} ${navBarActiveClass}`}
        >
          <div className={styles.navbarStart} />
          <div className={styles.navbarEnd}>
            {Content.items.filter(showItem).map((item, index) => (
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
  summit_phase: clockState.summit_phase,
  eventRedirect: settingState.siteSettings.eventRedirect,
  userProfile: userState.userProfile,
});

export default connect(mapStateToProps, {
  updateProfilePicture,
  updateProfile,
})(Navbar);
