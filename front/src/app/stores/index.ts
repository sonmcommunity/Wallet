import { useStrict } from 'mobx';
import { IOrder, IDeal, IWorker } from 'app/api/types';
import { HistoryListStore } from './history-list';
import { HistoryFilterStore } from './history-filter';
import { MainStore } from './main';
import { SendStore } from './send';
import { WithdrawStore } from './withdraw';
import { ValidatorsStore } from './validators';
import { UiStore } from './ui';
import { AddTokenStore } from './add-token';
import { OnlineStore } from './online-store';
import { ProfileFilterStore } from './profile-filter';
import { DealFilterStore } from './deal-filter';
import { OrderFilterStore } from './order-filter';
import { OrderCreateStore } from './order-create';
import { ILocalizator, IHasLocalizator } from 'app/localization';
import { ProfileList } from './profile-list';
import { OrdersList } from './orders-list';
import { DealList } from './deal-list';
import { WorkerList } from './worker-list';
import { WorkerFilterStore } from './worker-filter';
import { Api } from 'app/api';
import { EnumHistorySourceMode } from './types';
import { IListStore } from './list-store';
import { unwrapApiResult } from '../api/utils/unwrap-api-result';
import { OrderDetails } from './order-details';
import { DealDetails } from './deal-details';
import { KycListStore } from './kyc-list';
import { ProfileDetails } from './profile-details';
import { MyProfilesStore } from './my-profiles';
import { CurrencyStore } from './currency';
import { WalletStore } from './wallet';
import { GasPriceStore } from './gas-price';
import { IProfileBrief } from 'app/entities/account';

useStrict(true);

export class RootStore implements IHasLocalizator {
    public readonly walletHistoryList: HistoryListStore;
    public readonly walletHistoryFilter: HistoryFilterStore;
    public readonly dwHistoryList: HistoryListStore;
    public readonly dwHistoryFilter: HistoryFilterStore;
    public readonly main: MainStore;
    public readonly send: SendStore;
    public readonly deposit: SendStore;
    public readonly withdraw: WithdrawStore;
    public readonly ui: UiStore;
    public readonly addToken: AddTokenStore;
    public readonly profileList: IListStore<IProfileBrief>;
    public readonly dealList: IListStore<IDeal>;
    public readonly workerList: IListStore<IWorker>;
    public readonly workerFilter: WorkerFilterStore;
    public readonly ordersList: IListStore<IOrder>;
    public readonly orderCreate: OrderCreateStore;
    public readonly validators: ValidatorsStore;
    public readonly profileFilter: ProfileFilterStore;
    public readonly dealFilter: DealFilterStore;
    public readonly orderFilter: OrderFilterStore;
    public readonly orderDetails: OrderDetails;
    public readonly dealDetails: DealDetails;
    public readonly kycList: KycListStore;
    public readonly profileDetails: ProfileDetails;
    public readonly currency: CurrencyStore;
    public readonly myProfiles: MyProfilesStore;
    public readonly wallet: WalletStore;
    public readonly gasPrice: GasPriceStore;

    constructor(localizator: ILocalizator) {
        this.localizator = localizator;

        // should be first cause used in all stores;
        this.ui = new UiStore(this);

        this.walletHistoryFilter = new HistoryFilterStore(
            EnumHistorySourceMode.wallet,
        );
        this.walletHistoryList = new HistoryListStore(
            {
                filter: this.walletHistoryFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.history,
            },
            true,
        );

        this.dwHistoryFilter = new HistoryFilterStore(
            EnumHistorySourceMode.market,
        );

        this.dwHistoryList = new HistoryListStore(
            {
                filter: this.dwHistoryFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.history,
            },
            true,
        );

        this.gasPrice = new GasPriceStore({
            localizator,
            errorProcessor: this.ui,
        });

        this.wallet = new WalletStore({
            localizator,
            errorProcessor: this.ui,
        });

        this.currency = new CurrencyStore(this, {
            localizator,
            errorProcessor: this.ui,
        });

        this.myProfiles = new MyProfilesStore(this, {
            localizator,
            errorProcessor: this.ui,
            profileApi: Api.profile,
            marketApi: {
                fetchMarketBalance: unwrapApiResult(Api.getMarketBalance),
                fetchMarketStats: Api.deal.fetchStats,
            },
        });

        this.main = new MainStore(this, { localizator: this.localizator });

        this.send = new SendStore(this, this.localizator, {
            getPrivateKey: Api.getPrivateKey,
            send: Api.send,
        });

        this.deposit = new SendStore(
            this,
            this.localizator,
            {
                getPrivateKey: Api.getPrivateKey,
                send: Api.deposit,
            },
            true,
            '150000',
        );

        this.withdraw = new WithdrawStore(
            this,
            this.localizator,
            {
                getPrivateKey: Api.getPrivateKey,
                send: Api.withdraw,
            },
            true,
            '150000',
        );

        this.validators = new ValidatorsStore(this, {
            localizator: this.localizator,
            errorProcessor: this.ui,
            api: {
                fetchValidators: unwrapApiResult(Api.getValidators),
            },
        });

        this.profileFilter = new ProfileFilterStore();

        this.addToken = new AddTokenStore(this, this.localizator);
        this.profileList = new ProfileList(
            {
                filter: this.profileFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.profile,
            },
        );

        this.orderFilter = new OrderFilterStore(this);

        this.ordersList = new OrdersList(
            {
                filter: this.orderFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.order,
            },
        );

        this.orderCreate = new OrderCreateStore(this, {
            localizator,
            errorProcessor: this.ui,
            profileApi: Api.profile,
        });

        this.dealFilter = new DealFilterStore(this);

        this.dealList = new DealList(
            {
                filter: this.dealFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.deal,
            },
        );

        this.workerFilter = new WorkerFilterStore(this);

        this.workerList = new WorkerList(
            {
                filter: this.workerFilter,
            },
            {
                localizator,
                errorProcessor: this.ui,
                api: Api.worker,
            },
        );

        this.orderDetails = new OrderDetails(this, {
            localizator,
            errorProcessor: this.ui,
            api: Api.order,
        });

        this.dealDetails = new DealDetails(this, {
            localizator,
            errorProcessor: this.ui,
            api: Api.deal,
        });

        this.kycList = new KycListStore(this, {
            localizator,
            errorProcessor: this.ui,
        });

        this.profileDetails = new ProfileDetails(this, {
            localizator,
            errorProcessor: this.ui,
            api: Api.profile,
        });
    }

    public get isPending() {
        return OnlineStore.getAccumulatedFlag(
            'isPending',
            this.walletHistoryList,
            this.dwHistoryList,
            this.main,
            this.send,
            this.deposit,
            this.withdraw,
            this.addToken,
            this.orderDetails,
            this.dealDetails,
            this.orderCreate,
        );
    }

    public get isOffline() {
        return OnlineStore.getAccumulatedFlag(
            'isOffline',
            this.walletHistoryList,
            this.dwHistoryList,
            this.main,
            this.send,
            this.addToken,
            this.deposit,
            this.withdraw,
        );
    }

    public readonly localizator: ILocalizator;
}
