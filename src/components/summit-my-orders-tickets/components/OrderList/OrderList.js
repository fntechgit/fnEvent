import React from "react"
import { useDispatch, useSelector } from 'react-redux';
import Pager from '../../../Pager/index';
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { getUserOrders } from "../../store/actions/order-actions";
import { OrderListItem } from './OrderListItem';

import './order-list.scss';

export const OrderList = ({ className }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        memberOrders: orders,
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total
    } = useSelector(state => state.orderState || {});

    const handlePageChange = (page) => dispatch(getUserOrders({ page, perPage }));

    const hasOrders = orders.length > 0;
    const hasMultiplePages = total > perPage;

    if (!hasOrders) return null;

    return (
        <>
            <h2 className="order-list__title">
                {t("orders.title")}
            </h2>

            <ul className={classNames('order-list', className)}>
                {orders.map(order => (
                    <OrderListItem key={order.id} order={order} />
                ))}
            </ul>

            {hasMultiplePages && (
                <div className="order-list__pagination">
                    
                    <div className="row">
                        <div className="col-md-8">
                            <Pager
                                totPages={lastPage}
                                currentPage={currentPage}
                                items={orders}
                                pageClicked={(ele) => {
                                    handlePageChange(ele);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};