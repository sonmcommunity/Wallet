import { observable, action, computed } from 'mobx';
import { IAlert, AlertType } from './types';
import { RootStore } from 'app/stores';
import { Api } from 'app/api';
import {
    IConnectionInfo,
    defaultConnectionInfo,
} from 'app/entities/connection';
import { asyncAction } from 'mobx-utils';

const SUCCESS_ALERT_DELAY_CLOSE = 30000;

export class UiStore {
    protected static alertIdx = 0;

    protected rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.connectionInfo = defaultConnectionInfo;
        this.init();
    }

    @asyncAction
    protected *init() {
        const result = yield Api.getConnectionInfo();
        if (result.data) {
            this.connectionInfo = result.data;
        }
    }

    @observable public mapIdToAlert: Map<string, IAlert> = new Map();

    @observable.ref protected connectionInfo: IConnectionInfo;

    protected getNextId() {
        return `${new Date()}-${UiStore.alertIdx++}`;
    }

    @action
    public processError(e: Error) {
        this.addAlert({
            type: AlertType.error,
            message: e.message,
            id: this.getNextId(),
        });
    }

    @action
    public addAlert(alert: Partial<IAlert>): string {
        if (alert.message && this.mapIdToAlert.has(alert.message)) {
            this.mapIdToAlert.delete(alert.message);
        }

        const full: IAlert = {
            id: alert.id || this.getNextId(),
            message: alert.message || 'Empty message',
            type: alert.type || AlertType.error,
        };

        this.mapIdToAlert.set(full.id, full);

        if (alert.type === AlertType.success) {
            setTimeout(
                () => this.closeAlert(full.id),
                SUCCESS_ALERT_DELAY_CLOSE,
            );
        }

        return full.id;
    }

    @action.bound
    public closeAlert(id: string) {
        this.mapIdToAlert.delete(id);
    }

    @computed
    get alertList() {
        return Array.from(this.mapIdToAlert.values());
    }

    @computed
    public get disabledMenuItems() {
        const result = [];
        if (this.rootStore.myProfiles.accountList.length === 0) {
            result.push('Market');
        }
        return result;
    }

    @computed
    public get isLivenet() {
        return !this.connectionInfo.isTest;
    }

    @computed
    public get ethNodeUrl() {
        return this.connectionInfo.ethNodeURL;
    }

    @computed
    public get sidechainNodeUrl() {
        return this.connectionInfo.snmNodeURL;
    }
}

export default UiStore;

export * from './types';
