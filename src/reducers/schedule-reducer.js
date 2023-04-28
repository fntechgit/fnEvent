import {
    filterEventsByAccessLevel,
    getFilteredEvents,
    preFilterEvents,
    syncFilters
} from "../utils/schedule";

import summitData from "data/summit.json";

const summitTimeZoneId = summitData.time_zone_id;  // TODO use reducer data

const INITIAL_STATE = {
    events: [],
    filters: [],
    view: 'calendar',
    timezone: 'show',
    colorSource: 'track',
    is_my_schedule: false,
    only_events_with_attendee_access: false,
};

const scheduleReducer = (state = INITIAL_STATE, action) => {
    const {type, payload} = action;

    switch (type) {
        case `SCHED_GET_USER_PROFILE`:
        case `SCHED_RELOAD_USER_PROFILE`: {
            const {allEvents, events} = state;
            // payload is userProfile
            const allFilteredEvents = filterEventsByAccessLevel(allEvents, payload);
            const filteredEvents = filterEventsByAccessLevel(events, payload);
            return {...state, events: filteredEvents, allEvents: allFilteredEvents};
        }
        case 'SCHED_RELOAD_SCHED_DATA':
        case `SCHED_SYNC_DATA`: {
            const {
                color_source,
                pre_filters,
                all_events,
                filters,
                only_events_with_attendee_access,
                is_my_schedule,
                userProfile,
                isLoggedUser
            } = payload; // data from JSON

            const filterByAccessLevel = only_events_with_attendee_access && isLoggedUser;
            const filterByMySchedule = is_my_schedule && isLoggedUser;
            const allFilteredEvents = preFilterEvents(all_events, pre_filters, summitTimeZoneId, userProfile, filterByAccessLevel, filterByMySchedule);
            const newFilters = syncFilters(filters, state.filters);
            const events = getFilteredEvents(allFilteredEvents, newFilters, summitTimeZoneId);

            return {...state, allEvents: allFilteredEvents, filters: newFilters, colorSource: color_source.toLowerCase(), events, is_my_schedule, only_events_with_attendee_access};
        }
        case `SCHED_UPDATE_FILTER`: {
           
            const { type : filterType, values } = payload;
            const { filters, allEvents } = state;
            // update the filters with new values
            const newFilters = {
            ...filters,
                    [filterType]: {
                ...filters[filterType],
                        values
                }
            };

            return {...state,
                filters : newFilters ,
                // refilter events
                events: getFilteredEvents(allEvents, newFilters, summitTimeZoneId)}
        }
        case `SCHED_UPDATE_FILTERS`: {
            const {filters, view} = payload;
            const {allEvents} = state;

            // update events
            const events = getFilteredEvents(allEvents, filters, summitTimeZoneId);

            return {...state, filters, events, view}
        }
        case `SCHED_CHANGE_VIEW`: {
            const {view} = payload;
            return {...state, view}
        }
        case `SCHED_CHANGE_TIMEZONE`: {
            const {timezone} = payload;
            return {...state, timezone}
        }
        case `SCHED_ADD_TO_SCHEDULE`: {
            const event = payload;
            const {allEvents, filters} = state;

            allEvents.push(event);
            const events = getFilteredEvents(allEvents, filters, summitTimeZoneId);

            return {...state, allEvents, events};

        }
        case `SCHED_REMOVE_FROM_SCHEDULE`: {
            const event = payload;
            const {allEvents: allEventsCurrent, filters} = state;

            const allEvents = allEventsCurrent.filter(ev => ev.id !== event.id);
            const events = getFilteredEvents(allEvents, filters, summitTimeZoneId);

            return {...state, allEvents, events};

        }
        default:
            return state;
    }
};

export default scheduleReducer
