export const getTicketRole = (ticket) => {
    const { features } = ticket.badge;

    if (features.length > 0)
        return features.map(feature => feature.name).join(', ');

    return null;
};