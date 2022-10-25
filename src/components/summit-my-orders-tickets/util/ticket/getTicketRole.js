export const getTicketRole = (ticket) => {

    if (!ticket.badge) return null;

    const { features } = ticket.badge;

    if (features.length > 0)
        return features.map(feature => feature.name).join(', ');

    return 'Attendee';
};