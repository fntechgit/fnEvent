import { useState } from "react";
import { STATUS_CANCELLED, STATUS_UNASSIGNED } from "../../global/constants";
import { useSummitDetails } from "../summit/useSummitDetails";
import { getTicketRole } from "./getTicketRole";
import { getTicketStatusData } from "./getTicketStatusData";

export const useTicketDetails = ({ ticket, summit }) => {
    const {
        isPast,
        isStarted,
        isReassignable,
        formattedDate,
        formattedReassignDate,
        daysUntilReassignDeadline
    } = useSummitDetails({ summit });
    const [showPopup, setShowPopup] = useState(false);

    if (!summit || !ticket) return null;

    const status = getTicketStatusData(ticket, isPast);
    const role = getTicketRole(ticket);
    const type = summit.ticket_types.find(type => type.id == ticket.ticket_type_id);

    const isActive = ticket.is_active && status.type !== STATUS_CANCELLED;
    const isUnassigned = status.type === STATUS_UNASSIGNED;
    const isRefundable = ticket.final_amount > 0 && ticket.final_amount > ticket.refunded_amount;

    const togglePopup = () => setShowPopup(!showPopup);

    const handleClick = () => {
        if (!isActive) return;
        if (!isUnassigned && !isReassignable) return;

        togglePopup();
    };

    const handlePopupClose = () => togglePopup();

    return {
        status,
        role,
        type,
        isSummitPast: isPast,
        isSummitStarted: isStarted,
        isActive,
        isUnassigned,
        isReassignable,
        isRefundable,
        formattedDate,
        formattedReassignDate,
        daysUntilReassignDeadline,
        showPopup,
        setShowPopup,
        togglePopup,
        handleClick,
        handlePopupClose
    }
};