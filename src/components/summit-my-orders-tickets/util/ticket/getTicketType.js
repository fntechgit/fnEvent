export const getTicketType = (ticket, summit) => summit.ticket_types.find(type => type.id == ticket.ticket_type_id);