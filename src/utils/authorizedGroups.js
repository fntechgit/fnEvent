import {
  getEnvVariable,
  AUTHZ_USER_GROUPS,
} from "./envVariables";

export const VirtualAccessLevel = 'VIRTUAL';

export const isAuthorizedUser = (groups) => {
  let authorizedGroups = getEnvVariable(AUTHZ_USER_GROUPS);
  authorizedGroups =
    authorizedGroups && authorizedGroups !== ""
      ? authorizedGroups.split(" ")
      : [];
  return groups
    ? groups.some((group) => authorizedGroups.includes(group.code))
    : false;
};

export const userHasAccessLevel = (summitTickets, accessLevel) => {
    if (summitTickets) {
        return summitTickets
            .some(t => t?.badge?.type?.access_levels.map(al => al.name).includes(accessLevel));
    }

    return false;
};

export const getUserAccessLevelIds = (summitTickets) => {
    return summitTickets?.reduce((result, item) => {
        const newAccessLevels = item?.badge?.type?.access_levels?.map(al => al.id).filter(aln => !result.includes(aln)) || [];
        return [...result, ...newAccessLevels];
    }, []) || [];
};

export const isAuthorizedBadge = (event, summitTickets) => {
    let allowed = true;
    const userAccessLevels = getUserAccessLevelIds(summitTickets);
    const trackAccessLevelIds = event?.track?.allowed_access_levels.map(aal => aal.id) || [];

    if (trackAccessLevelIds.length > 0) {
        allowed = trackAccessLevelIds.some(tal => userAccessLevels.includes(tal));
    }

    return allowed;
};

export const filterEventsByAccessLevels = (originalEvents , user) => {
    if (isAuthorizedUser(user.groups)) {
        return originalEvents;
    }
    let summitTickets = user.summit_tickets;
    return originalEvents.filter((ev) => {
        return isAuthorizedBadge(ev, summitTickets);
    });
}
