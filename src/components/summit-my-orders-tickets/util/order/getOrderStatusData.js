import {
    STATUS_CANCELLED,
    STATUS_COMPLETE,
    STATUS_ERROR,
    STATUS_INCOMPLETE,
    STATUS_PAST,
    STATUS_PENDING,
    STATUS_PROCESSING
} from "../../global/constants";

export const statusData = {
    [STATUS_COMPLETE]: {
        type: STATUS_COMPLETE,
        text: 'Ticket(s) assigned and issued',
        icon: 'fa-check-circle',
        className: 'complete',
    },
    [STATUS_INCOMPLETE]: {
        type: STATUS_INCOMPLETE,
        text: 'Additional attendee details required before ticket(s) can be issued',
        icon: 'fa-exclamation-circle',
        className: 'warning'
    },
    [STATUS_PENDING]: {
        type: STATUS_PENDING,
        text: 'Pending confirmation',
        icon: 'fa-fw',
        className: 'pending',
    },
    [STATUS_CANCELLED]: {
        type: STATUS_CANCELLED,
        text: 'Cancelled',
        icon: 'fa-fw',
        className: 'cancelled',
    },
    [STATUS_ERROR]: {
        type: STATUS_ERROR,
        text: 'Payment error',
        icon: 'fa-fw',
        className: 'cancelled',
    },
    [STATUS_PROCESSING]: {
        type: STATUS_PROCESSING,
        text: 'Payment processing',
        icon: 'fa-fw',
        className: 'pending',
    },
    [STATUS_PROCESSING]: {
        type: STATUS_PAST,
        text: 'Past',
        icon: 'fa-fw',
        className: 'past',
    }
};

export const statusToKeyMap = {
    'Paid': STATUS_COMPLETE,
    'Reserved': STATUS_PENDING,
    'Cancelled': STATUS_CANCELLED,
    'Error': STATUS_ERROR,
    'Confirmed': STATUS_PROCESSING,
};

export const getOrderStatusKey = (order, isSummitPast) => {
    let status = order.status;

    if (status !== 'Paid') return statusToKeyMap[status];

    if (isSummitPast) return STATUS_PAST;

    if (order.tickets.some(ticket => (!ticket.owner || ticket.owner.status === "Incomplete"))) return STATUS_INCOMPLETE

    return STATUS_COMPLETE;

};

export const getOrderStatusData = (order, isSummitPast) => statusData[getOrderStatusKey(order, isSummitPast)];
