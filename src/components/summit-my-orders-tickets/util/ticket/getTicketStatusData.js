import {
    STATUS_CANCELLED,
    STATUS_COMPLETE,
    STATUS_INCOMPLETE,
    STATUS_PAST,
    STATUS_UNASSIGNED,
} from "../../global/constants";

export const statusData = {
    [STATUS_UNASSIGNED]: {
        type: STATUS_UNASSIGNED,
        text: 'Unassigned',
        icon: 'fa-exclamation-circle',
        className: 'unset',
    },
    [STATUS_INCOMPLETE]: {
        type: STATUS_INCOMPLETE,
        text: 'Required details needed',
        icon: 'fa-exclamation-circle',
        className: 'warning',
    },
    [STATUS_COMPLETE]: {
        type: STATUS_COMPLETE,
        text: 'Ready to use',
        icon: 'fa-check-circle',
        className: 'complete'
    },
    [STATUS_CANCELLED]: {
        type: STATUS_CANCELLED,
        text: 'Cancelled',
        className: 'cancel',
    },
    [STATUS_PAST]: {
        type: STATUS_PAST,
        text: 'Past',
        icon: 'fa-fw',
        className: 'past',
    }
};

export const statusToKeyMap = {
    'Incomplete': STATUS_INCOMPLETE,
    'Complete': STATUS_COMPLETE,
    'Cancelled': STATUS_CANCELLED
};

export const getTicketStatusKey = (ticket, isSummitPast) => {
    if (!ticket.is_active) return STATUS_CANCELLED;

    if (ticket.owner_id === 0) return STATUS_UNASSIGNED;

    if (isSummitPast) return STATUS_PAST;

    if (!ticket.owner.first_name || !ticket.owner.last_name) return STATUS_INCOMPLETE;

    if (ticket.owner && ticket.owner.status === 'Incomplete') return STATUS_INCOMPLETE;

    if (ticket.owner && ticket.owner.status === 'Complete') return STATUS_COMPLETE;

    return statusToKeyMap[ticket.status];
};

export const getTicketStatusData = (ticket, isSummitPast) => statusData[getTicketStatusKey(ticket, isSummitPast)];
