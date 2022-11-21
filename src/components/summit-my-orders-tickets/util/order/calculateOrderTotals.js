export const calculateOrderTotals = ({ order, summit, tickets }) => {
    if (!order || !summit || !tickets) return {};

    const { refunded_amount, discount_amount, taxes_amount, amount, reservation } = order;
    const { ticket_types } = summit;

    const ticketSummary = [];
    let purchaseTicketTotal = 0;

    Object.keys(order.tickets_excerpt_by_ticket_type).map((ticket) => {
        let ticketType = ticket_types.find(tt => tt.name === ticket);
        ticketSummary.push({ ticket_type_id: ticketType.id, ticket_type: ticketType, name: ticket, qty: order.tickets_excerpt_by_ticket_type[ticket] })
        purchaseTicketTotal = purchaseTicketTotal + (ticketType.cost * order.tickets_excerpt_by_ticket_type[ticket]);
    })

    const purchaseTotal = purchaseTicketTotal;
    const discountTotal = reservation?.discount_amount ? reservation.discount_amount.toFixed(2) : discount_amount?.toFixed(2);
    const refundTotal = reservation?.refunded_amount ? reservation.refunded_amount.toFixed(2) : refunded_amount?.toFixed(2);
    const taxesTotal = reservation?.taxes_amount ? reservation.taxes_amount.toFixed(2) : taxes_amount?.toFixed(2);
    const amountTotal = reservation?.amount ? reservation.amount.toFixed(2) : amount ? amount.toFixed(2) : purchaseTotal.toFixed(2);

    return { discountTotal, refundTotal, taxesTotal, amountTotal, ticketSummary };
};