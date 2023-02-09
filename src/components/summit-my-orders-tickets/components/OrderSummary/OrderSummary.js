import React, { useRef, useState } from 'react'
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { calculateOrderTotals, getWindowScroll } from '../../util';
import { OrderSummaryTable } from './OrderSummaryTable';

import './order-summary.scss';

export const OrderSummary = ({ type = 'desktop', order, summit, tickets, className }) => {
    const previousScrollPosition = useRef(getWindowScroll());
    const { t } = useTranslation();
    const [showTable, setShowTable] = useState(false);
    const { amountTotal } = calculateOrderTotals({ order, summit, tickets });

    const isMobile = type === 'mobile';

    // TODO: Determine if we need to finish implementing a separate a `mobile` version of this component.
    const toggleTable = () => setShowTable(!showTable);

    const handleToggleClick = () => {
        if (!isMobile) return;

        if (!showTable) {
            // Update the previousScrollPosition before showing the mobile table.
            previousScrollPosition.current = getWindowScroll();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "visible";

            window.scrollTo({
                top: previousScrollPosition.current.top
            });
        }

        toggleTable();
    };

    return (
        <div className={classNames(
            `order-summary order-summary-${type}`,
            {
                'open': showTable,
                'closed': !showTable
            },
            className
        )}>
            {isMobile && (
                <div className="order-summary-mobile-title" onClick={handleToggleClick}>
                    <span>{t("order_summary.order_summary")}</span>
                    <span>
                        {amountTotal} &nbsp; <i className={`fa fa-chevron-${showTable ? 'up' : 'down'}`} aria-hidden="true"></i>
                    </span>
                </div>
            )}

            {(!isMobile || showTable) && (
                <div className="order-summary-content">
                    <OrderSummaryTable order={order} summit={summit} tickets={tickets} />
                </div>
            )}
        </div>

    );
};