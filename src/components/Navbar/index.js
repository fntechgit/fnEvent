import * as React from "react";
import { useMemo } from "react";
import { connect } from "react-redux";
import NavbarTemplate from "./template";

import {
  updateProfile,
  updateProfilePicture
} from "../../actions/user-actions";

import { userHasAccessLevel, VirtualAccessLevel } from "@utils/authorizedGroups";
import { getDefaultLocation } from "@utils/loginUtils";

import { PHASES } from "@utils/phasesUtils";
import { PAGE_RESTRICTIONS } from "../../cms/config/collections/configurationsCollection/navbar";

import navbarContent from "content/navbar/index.json";

const Navbar = ({
  location,
  summitPhase,
  summit,
  isLoggedUser,
  idpLoading,
  idpProfile,
  userProfile,
  updateProfile,
  updateProfilePicture,
  eventRedirect,
  logo
}) => {

  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
    userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false
  , [userProfile]);

  const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);

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

  return (
    <NavbarTemplate
      data={navbarContent.items.filter(showItem)}
      summit={summit}
      summitPhase={summitPhase}
      isLoggedUser={isLoggedUser}
      idpLoading={idpLoading}
      idpProfile={idpProfile}
      hasVirtualBadge={hasVirtualBadge}
      updateProfile={updateProfile}
      updateProfilePicture={updateProfilePicture}
      defaultPath={defaultPath}
      logo={logo}
    />
  )
};


const mapStateToProps = ({
  clockState,
  settingState,
  summitState,
  userState
}) => ({
  summitPhase: clockState.summit_phase,
  summit: summitState.summit,
  userProfile: userState.userProfile,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect
});

export default connect(mapStateToProps, {
  updateProfile,
  updateProfilePicture
})(Navbar);
