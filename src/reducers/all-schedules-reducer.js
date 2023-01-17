import scheduleReducer from './schedule-reducer';
import eventsData from '../content/events.json';
import eventsIDXData from '../content/events.idx.json';
import {filterEventsByTags} from '../utils/schedule';
import {LOGOUT_USER} from "openstack-uicore-foundation/lib/security/actions";
import {UPDATE_FILTER, UPDATE_FILTERS, CHANGE_VIEW, CHANGE_TIMEZONE, RELOAD_SCHED_DATA , RELOAD_USER_PROFILE} from '../actions/schedule-actions'
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions-definitions";
import {GET_EVENT_DATA} from '../actions/event-actions';
import {ADD_TO_SCHEDULE, REMOVE_FROM_SCHEDULE, GET_USER_PROFILE} from "../actions/user-actions";

const scheduleEvents = filterEventsByTags(eventsData);

const DEFAULT_STATE = {
    allEvents: eventsData,
    allIDXEvents : eventsIDXData,
    allScheduleEvents: scheduleEvents,
    schedules: []
};

const allSchedulesReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action;

    switch (type) {
        case RESET_STATE:
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case RELOAD_USER_PROFILE:
        case GET_USER_PROFILE: {
            // reload the data filtering by user profile
            const {userProfile} = payload?.response ?? payload;
            // filter events by access level
            const {schedules} = state;

            const newSchedules = schedules.map(sched => {
                if (sched.only_events_with_attendee_access) {
                    return scheduleReducer(sched, {payload: userProfile, type: `SCHED_${type}`});
                }
                return sched;
            })

            return {...state, schedules: newSchedules};
        }
        case SYNC_DATA:
        case RELOAD_SCHED_DATA:
        {
            const {eventsData: allScheduleEvents, summitData, isLoggedUser, userProfile, eventsIDXData } = payload;

            const schedules = summitData?.schedule_settings?.map(sched => {

                const {key} = sched;
                const scheduleState = state.schedules.find(s => s.key === key);

                // translate filters and pre_filters
                const newFilters = sched.filters.reduce((result, item) => {
                    result[item.type.toLowerCase()] = {label: item.label, enabled: item.is_enabled, values: [], options: []};
                    return result;
                }, {});

                const newPreFilters = sched.pre_filters.reduce((result, item) => {
                    result[item.type.toLowerCase()] = {values: item.values};
                    return result;
                }, {});

                const newData = {...sched, all_events: allScheduleEvents, filters: newFilters, pre_filters: newPreFilters};

                const schedState = scheduleReducer(scheduleState, {type: `SCHED_${type}`, payload: {...newData, isLoggedUser, userProfile }});

                return {
                    key,
                    ...schedState
                };

            }) || [];

            return {...DEFAULT_STATE,
                allEvents:allScheduleEvents,
                schedules,
                allIDXEvents: eventsIDXData,
                allScheduleEvents: filterEventsByTags(allScheduleEvents)
            };
        }
        case GET_EVENT_DATA: {
            const {allEvents} = state;
            // check first if we have api response
            const event = payload.response || payload.event;
            const index = state.allEvents.findIndex((e) => e.id === event.id);
            const updatedEvents = [...allEvents];

            if (index >= 0) {
                // update the event on reducer
                updatedEvents[index] = {...event};
            } else {
                // add the event to reducer
                updatedEvents.push(event);
            }
            return {...state, allEvents: updatedEvents};
        }
        case CHANGE_TIMEZONE:
        case CHANGE_VIEW:
        case UPDATE_FILTERS:
        case UPDATE_FILTER: {
            const {key} = payload;
            const {schedules} = state;

            const newSchedules = schedules.map(sched => {
                if (sched.key === key) {
                    return scheduleReducer(sched, {...action, type: `SCHED_${type}`});
                }
                return sched;
            })

            return {...state, schedules: newSchedules};
        }
        case REMOVE_FROM_SCHEDULE:
        case ADD_TO_SCHEDULE: {
            const {schedules, allEvents} = state;
            const event = allEvents.find(ev => ev.id === payload.id);

            const newSchedules = schedules.map(sched => {
                if (sched.is_my_schedule) {
                    return scheduleReducer(sched, {...action, type: `SCHED_${type}`});
                }
                return sched;
            })

            return {...state, schedules: newSchedules};
        }
        default:
            return state;
    }
};

export default allSchedulesReducer
