export const calculateOrderTotals = ({ order, summit, tickets }) => {
    if (!order || !summit || !tickets) return {};

    const { refunded_amount, discount_amount, taxes_amount, amount, reservation } = order;
    const { ticket_types } = summit;

    const ticketSummary = [];
    let purchaseTicketTotal = 0;

    tickets.forEach(ticket => {
        let idx = ticketSummary.findIndex(o => o.ticket_type_id == (ticket.type_id ? ticket.type_id : ticket.ticket_type_id));
        let ticketType = ticket_types.find(tt => tt.id == (ticket.type_id ? ticket.type_id : ticket.ticket_type_id));

        if (idx >= 0) {
            ticketSummary[idx].qty++;
        } else {
            let name = ticket_types.find(q => q.id === (ticket.type_id ? ticket.type_id : ticket.ticket_type_id)).name;
            ticketSummary.push({ ticket_type_id: (ticket.type_id ? ticket.type_id : ticket.ticket_type_id), ticket_type: ticketType, name, qty: 1 })
        }

        purchaseTicketTotal = purchaseTicketTotal + ticketType.cost;
    });

    const purchaseTotal = purchaseTicketTotal;
    const discountTotal = reservation?.discount_amount ? reservation.discount_amount.toFixed(2) : discount_amount?.toFixed(2);
    const refundTotal = reservation?.refunded_amount ? reservation.refunded_amount.toFixed(2) : refunded_amount?.toFixed(2);
    const taxesTotal = reservation?.taxes_amount ? reservation.taxes_amount.toFixed(2) : taxes_amount?.toFixed(2);
    const amountTotal = reservation?.amount ? reservation.amount.toFixed(2) : amount ? amount.toFixed(2) : purchaseTotal.toFixed(2);

    return { discountTotal, refundTotal, taxesTotal, amountTotal, ticketSummary };
};