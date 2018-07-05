import * as React from 'react';
import { IOrder, EnumOrderSide } from 'app/api/types';
import { ProfileBrief } from 'app/components/common/profile-brief/index';
import { Benchmark } from 'app/components/common/benchmark';
import {
    PropertyList,
    IPropertyItemConfig,
} from 'app/components/common/property-list';
import { ConfirmationPanel } from 'app/components/common/confirmation-panel/index';
import { PricePerHour } from 'app/components/common/price-per-hour';
import formatSeconds from 'app/utils/format-seconds';
import { EnumOrderStatus } from 'app/api';
import { InsuficcientFunds } from './sub/insuficcient-funds';

interface IProps {
    className?: string;
    order: IOrder;
    validationPassword: string;
    onSubmit: (password: string) => void;
    onNavigateBack: () => void;
    onNavigateDeposit: () => void;
    isBuyingAvailable: boolean;
}

class OrderPropertyList extends PropertyList<IOrder> {}

export class OrderView extends React.Component<IProps, never> {
    public static orderViewConfig: Array<IPropertyItemConfig<keyof IOrder>> = [
        {
            key: 'id',
            name: 'ID',
        },
        {
            key: 'durationSeconds',
            name: 'Duration',
            render: (seconds: number) =>
                seconds ? formatSeconds(seconds) : '--',
        },
        {
            key: 'orderSide',
            name: 'Type',
            render: (orderType: number) =>
                orderType === EnumOrderSide.bid ? 'Bid' : 'Ask',
        },
        {
            key: 'orderStatus',
            name: 'Status',
            render: (status: number) =>
                status === EnumOrderStatus.active ? 'Active' : 'Not Active',
        },
    ];

    public render() {
        const p = this.props;
        return (
            <div className="order-view">
                <ProfileBrief
                    className="order-view__creator"
                    profile={p.order.creator}
                />
                <OrderPropertyList
                    title="Details"
                    className="order-view__details"
                    dataSource={p.order}
                    config={OrderView.orderViewConfig}
                />
                {p.order.orderSide === EnumOrderSide.ask ? (
                    p.isBuyingAvailable ? (
                        <ConfirmationPanel
                            className="order-view__confirmation"
                            onSubmit={p.onSubmit}
                            validationMessage={p.validationPassword}
                            labelSubmit="Buy"
                            labelHeader="Accept order"
                        />
                    ) : (
                        <InsuficcientFunds
                            onBack={p.onNavigateBack}
                            onDeposit={p.onNavigateDeposit}
                        />
                    )
                ) : null}
                <Benchmark
                    title="Resource parameters"
                    className="order-view__benchmark"
                    data={p.order.benchmarkMap}
                />
                <div className="order-view__price">
                    <h4 className="order-view__header">Price</h4>
                    <PricePerHour usdWeiPerSeconds={p.order.usdWeiPerSeconds} />
                </div>
            </div>
        );
    }
}

export default OrderView;
