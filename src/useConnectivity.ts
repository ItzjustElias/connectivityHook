import { useContext } from 'react';
import { ConnectivityContext } from './context';
import { ConnectivityState } from './types/index';

export const useConnectivity = (): ConnectivityState => {
  return useContext(ConnectivityContext);
};