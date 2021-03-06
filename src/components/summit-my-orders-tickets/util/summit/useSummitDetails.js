import { getDaysBetweenDates, getFormattedDate } from "../helpers";
import { useNow } from "../timer";
import { checkSummitPast } from "./checkSummitPast";
import { checkSummitStarted } from "./checkSummitStarted";
import { getSummitFormattedDate } from "./getSummitFormattedDate";
import { getSummitLocation } from "./getSummitLocation";
import { getSummitReassignDate } from "./getSummitReassignDate";

export const useSummitDetails = ({ summit }) => {
    const now = useNow();

    if (!summit) return {};

    const location = getSummitLocation(summit);
    const formattedDate = getSummitFormattedDate(summit);
    const reassignDate = getSummitReassignDate(summit);
    const formattedReassignDate = getFormattedDate(reassignDate, summit.time_zone.name);
    const daysUntilReassignDeadline = getDaysBetweenDates(now, reassignDate, summit.time_zone.name)?.length;

    const isPast = checkSummitPast(summit, now);
    const isStarted = checkSummitStarted(summit, now);
    const isReassignable = reassignDate > now;

    return {
        name: summit?.name,
        now,
        location,
        formattedDate,
        reassignDate,
        formattedReassignDate,
        daysUntilReassignDeadline,
        isPast,
        isStarted,
        isReassignable
    };
};