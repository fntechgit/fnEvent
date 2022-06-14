import i18n from '../../i18n';

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
        text: i18n.t('order_status.complete'),
        icon: 'fa-check-circle',
        className: 'complete',
    },
    [STATUS_INCOMPLETE]: {
        type: STATUS_INCOMPLETE,
        text: i18n.t('order_status.incomplete'),
        icon: 'fa-exclamation-circle',
        className: 'warning'
    },
    [STATUS_PENDING]: {
        type: STATUS_PENDING,
        text: i18n.t('order_status.pending'),
        icon: 'fa-fw',
        className: 'pending',
    },
    [STATUS_CANCELLED]: {
        type: STATUS_CANCELLED,
        text: i18n.t('order_status.cancelled'),
        icon: 'fa-fw',
        className: 'cancelled',
    },
    [STATUS_ERROR]: {
        type: STATUS_ERROR,
        text: i18n.t('order_status.error'),
        icon: 'fa-fw',
        className: 'cancelled',
    },
    [STATUS_PROCESSING]: {
        type: STATUS_PROCESSING,
        text: i18n.t('order_status.processing'),
        icon: 'fa-fw',
        className: 'pending',
    },
    [STATUS_PROCESSING]: {
        text: i18n.t('order_status.past'),
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
