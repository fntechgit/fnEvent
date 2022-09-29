export const getSummitReassignDate = (summit) => {
    if (!summit) return null;

    return summit.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date
        ? summit.reassign_ticket_till_date
        : summit.end_date;
}
