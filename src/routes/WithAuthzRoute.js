import React, {useEffect, useState, useMemo} from "react";
import {connect} from "react-redux";
import {navigate} from "gatsby";
import { pick }  from "@reach/router/lib/utils";
import { getUserProfile, requireExtraQuestions } from "../actions/user-actions";
import HeroComponent from "../components/HeroComponent";
import { userHasAccessLevel, VirtualAccessLevel } from "../utils/authorizedGroups";

const pathsRequiringVirtualBadge = [
    { path: "/a/" },
    { path: "/a/event/:eventId" },
    { path: "/a/posters" },
    { path: "/a/sponsors" },
    { path: "/a/posters/:trackGroupId" },
    { path: "/a/poster/:presentationId/" },
];

/**
 *
 * @param children
 * @param isLoggedIn
 * @param location
 * @param userProfile
 * @param hasTicket
 * @param isAuthorized
 * @param getUserProfile
 * @returns {JSX.Element|null|*}
 * @constructor
 */
const WithAuthzRoute = ({
   children,
   isLoggedIn,
   location,
   userProfile,
   hasTicket,
   isAuthorized,
   getUserProfile
}) => {
    const [fetchedUserProfile, setFetchedUserProfile] = useState(false);

    const locationRequiresVirtualBadge = useMemo(() =>
        !!pick(pathsRequiringVirtualBadge, location.pathname),
        [location]);

    // we store this calculation to use it later
    const hasVirtualBadge = useMemo(() =>
        userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false,
        [userProfile.summit_tickets]);

    const userIsReady = () => {
        // we have an user profile
        return !!userProfile;
    };

    const userIsAuthz = isAuthorized || (
                            hasTicket && (
                                !locationRequiresVirtualBadge ||
                                locationRequiresVirtualBadge && hasVirtualBadge
                            )
                        );

    const checkingCredentials = () => {
        return !userIsAuthz && !fetchedUserProfile;
    };

    useEffect(() => {
        if (!isLoggedIn) return;

        if (!userProfile) {
            getUserProfile();
            return;
        }
        // if the user is not authz and we accessing a private route , get fresh data to recheck
        // authz condition ( new tickets / new groups ) after every render of the route
        if (!fetchedUserProfile && !userIsAuthz) {
            setFetchedUserProfile(true)
            getUserProfile();
        }
    }, [fetchedUserProfile, isLoggedIn, hasTicket, isAuthorized, userProfile, getUserProfile, userIsAuthz]);

    if (!isLoggedIn) {
        navigate("/", {state: {backUrl: `${location.pathname}`,},});
        return null;
    }

    // we are checking credentials if userProfile is being loading yet or
    // if we are re-fetching the user profile to check new data ( user currently is not a authz
    if (!userIsReady() || checkingCredentials()) {
        return <HeroComponent title="Checking credentials..."/>;
    }

    // has no ticket -> redirect
    if (!userIsAuthz) {
        const options = { state: { error: !hasTicket ? 'no-ticket' : 'no-virtual-access' } };
        return <HeroComponent title="Checking credentials..." redirectTo="/authz/ticket" options={options}/>;
    }

    return children;
};

const mapStateToProps = ({userState}) => ({
    userProfile: userState.userProfile,
    isAuthorized: userState.isAuthorized,
    hasTicket: userState.hasTicket,
});

export default connect(mapStateToProps, {
    getUserProfile,
    requireExtraQuestions,
})(WithAuthzRoute);
