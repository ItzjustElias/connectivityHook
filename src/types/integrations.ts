import { ConnectivityState } from './index';

export interface ConnectivityActions {
    type: 'CONNECTIVITY_UPDATE';
    payload: Partial<ConnectivityState>;
}

export type ConnectivitySelector<T> = (state: ConnectivityState) => T;