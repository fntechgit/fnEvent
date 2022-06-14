import moment from "moment-timezone";
import { epochToMomentTimeZone , getFromLocalStorage, putOnLocalStorage }
  from "openstack-uicore-foundation/lib/utils/methods";
import { isString } from "lodash";
import { getEnvVariable, SCHEDULE_EXCLUDING_TAGS } from "./envVariables";
import {getUserAccessLevelIds, isAuthorizedUser} from './authorizedGroups';

const groupByDay = (events) => {
  let groupedEvents = [];
  events.forEach(ev => {
    const day = moment.unix(ev.start_date).format("MM/DD/YYYY");
    const currentValue = groupedEvents[day] || [];
    groupedEvents[day] = [ev, ...currentValue];
  });

  return groupedEvents;
};

const sortSchedule = (events) => {
  return events.map(day => {
    return day.sort((a, b) => a.id - b.id);
  });
};

export const sortEvents = (events) => {
  let sortedEvents = groupByDay(events);
  sortedEvents = sortSchedule(sortedEvents);
  return sortedEvents;
};

const userHasAccessToEvent = (event, userAccessLevels) => {
  const trackAccessLevelIds = event?.track?.allowed_access_levels.map(aal => aal.id) || [];

  if (trackAccessLevelIds.length > 0) {
    return trackAccessLevelIds.some(tal => userAccessLevels.includes(tal));
  }
  // if the event has not access level set , then is open for everyone
  return true;
}

export const filterEventsByAccessLevel = (events, userProfile) => {
  // if user is on auth groups... dont filter
  if(isAuthorizedUser(userProfile?.groups ?? [])) return events;
  const userAccessLevels = getUserAccessLevelIds(userProfile?.summit_tickets ?? []);

  // if user has no access levels we can't show any event.
  if (userAccessLevels.length === 0) return [];

  return events.filter(ev => userHasAccessToEvent(ev, userAccessLevels));
};

export const filterEventsByTags = (events) => {
  const excludingTagsVar = getEnvVariable(SCHEDULE_EXCLUDING_TAGS);
  const excludingTags = excludingTagsVar?.split("|") || null;

  return excludingTags
      ? events.filter(ev => !ev.tags?.map(t => t.tag).some(tag => excludingTags.includes(tag)))
      : events;
};

const filterMyEvents = (myEvents, events) => {
  const myEventsIds = myEvents?.map(ev => ev.id) || [];
  return events.filter(ev =>  myEventsIds.includes(ev.id));
};

export const preFilterEvents = (events, filters, summitTimezone, userProfile, filterByAccessLevel, filterByMySchedule) => {
  const {schedule_summit_events = []} = userProfile || {};
  let result = [...events];

  if (filterByMySchedule) {
    result = filterMyEvents(schedule_summit_events, result);
  }

  if (filterByAccessLevel) {
    result = filterEventsByAccessLevel(result, userProfile);
  }

  return getFilteredEvents(result, filters, summitTimezone);
};

export const getFilteredEvents = (events, filters, summitTimezone) => {

  return events.filter((ev) => {
    let valid = true;
    if (filters.date?.values.length > 0) {
      const dateString = epochToMomentTimeZone(
        ev.start_date,
        summitTimezone
      ).format("YYYY-MM-DD");
      valid = filters.date.values.includes(dateString);
      if (!valid) return false;
    }

    if (filters.level?.values.length > 0) {
      valid = filters.level.values.some(l => l.toString().toLowerCase() === ev.level.toLowerCase());
      if (!valid) return false;
    }

    if (filters.track?.values.length > 0) {
      valid = filters.track.values.some( id => parseInt(id) === ev.track.id);
      if (!valid) return false;
    }

    if (filters.speakers?.values.length > 0) {
      const filteredSpeakers = filters.speakers.values.map( id => parseInt(id));
      valid =
        ev.speakers?.some((s) => filteredSpeakers.includes(s.id)) ||
          filteredSpeakers.includes(ev.moderator?.id);
      if (!valid) return false;
    }

    if (filters.tags?.values.length > 0) {
      valid = ev.tags?.some((t) => filters.tags.values.includes(t.id));
      if (!valid) return false;
    }

    if (filters.venues?.values.length > 0) {
      valid = filters.venues.values.some( id => parseInt(id) === ev.location?.id);
      if (!valid) return false;
    }

    if (filters.track_groups?.values.length > 0) {
      const filteredTrackGroups = filters.track_groups.values.map(id => parseInt(id));
      valid = ev.track?.track_groups.some((tg) =>
          filteredTrackGroups.includes(tg)
      );
      if (!valid) return false;
    }

    if (filters.event_types?.values.length > 0) {
      valid = filters.event_types.values.some(id => parseInt(id) === ev.type.id);
      if (!valid) return false;
    }

    if (filters.company?.values.length > 0) {
      const lowerCaseCompanies = filters.company.values.map(c => c.toLowerCase());
      valid =
        ev.speakers?.some((s) =>
          lowerCaseCompanies.includes(s.company?.toLowerCase())
        ) ||
        lowerCaseCompanies.includes(ev.moderator?.company?.toLowerCase()) ||
        ev.sponsors?.some((s) =>
          lowerCaseCompanies.includes(s.name.toLowerCase())
        );
      if (!valid) return false;
    }

    if (filters.title?.values && isString(filters.title.values)) {
      valid = ev.title
        .toLowerCase()
        .includes(filters.title.values.toLowerCase());
      if (!valid) return false;
    }

    if (filters.abstract?.values && isString(filters.abstract.values)) {
      valid = ev.description
          .toLowerCase()
          .includes(filters.abstract.values.toLowerCase());
      if (!valid) return false;
    }

    if (filters.custom_order?.values && parseInt(filters.custom_order.values) > 0) {
      valid = parseInt( ev.custom_order)  === parseInt(filters.custom_order.values)
      if (!valid) return false;
    }

    return true;
  });
};

export const syncFilters = (newFilters, currentFilters) => {
  // new filters are the source of truth
  Object.entries(newFilters).forEach(([key, value]) => {
    value.values = [];
    value.options = [];

    if(currentFilters.hasOwnProperty(key)) {
      // copy over values and options if they exists
      const filter = currentFilters[key];
      if(filter.hasOwnProperty("values"))
        value.values = filter.values;
      if(filter.hasOwnProperty("options"))
        value.options = filter.options;
    }
  });
  return newFilters;
}

export const savePendingAction = (action) => {
  putOnLocalStorage('pendingAction', JSON.stringify(action));
}

export const getPendingAction = () => {
  const pendingAction = getFromLocalStorage('pendingAction', true );
  return pendingAction ? JSON.parse(pendingAction) : null
}