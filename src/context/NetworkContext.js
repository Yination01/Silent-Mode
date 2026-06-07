import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  networkType: null,
});

export const useNetwork = () => useContext(NetworkContext);

export function NetworkProvider({ children }) {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    networkType: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        networkType: state.type,
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
}