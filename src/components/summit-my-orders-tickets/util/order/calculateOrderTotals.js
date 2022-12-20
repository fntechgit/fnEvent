import { formatCurrency } from "../helpers";

export const calculateOrderTotals = ({ order, summit, tickets }) => {
    if (!order || !summit || !tickets) return {};

    const { refunded_amount, discount_amount, taxes_amount, amount } = order;
    const { ticket_types } = summit;

    const ticketSummary = [];
    let purchaseTicketTotal = 0;

    const currencyObject = { currency: order.currency };

    Object.keys(order.tickets_excerpt_by_ticket_type).map((ticket) => {
        let ticketType = ticket_types.find(tt => tt.name === ticket);
        ticketSummary.push({ ticket_type_id: ticketType.id, ticket_type: ticketType, name: ticket, qty: order.tickets_excerpt_by_ticket_type[ticket] })
        purchaseTicketTotal = purchaseTicketTotal + (ticketType.cost * order.tickets_excerpt_by_ticket_type[ticket]);
    })

    const purchaseTotal = formatCurrency(purchaseTicketTotal, currencyObject);

    const discountTotal = formatCurrency(discount_amount, currencyObject);
    const refundTotal = formatCurrency(refunded_amount, currencyObject);
    const taxesTotal = formatCurrency(taxes_amount, currencyObject);
    const amountTotal = order.hasOwnProperty("amount") ? formatCurrency(amount, currencyObject) : formatCurrency(purchaseTotal, currencyObject);

    return { discountTotal, refundTotal, taxesTotal, amountTotal, ticketSummary };
};