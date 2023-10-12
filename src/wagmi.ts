import {getDefaultConfig} from 'connectkit'
import {configureChains, Connector, createConfig} from 'wagmi'
import {SafeConnector} from 'wagmi/connectors/safe'
import {goerli, mainnet} from "@wagmi/chains";
import {publicProvider} from "wagmi/providers/public";
import {MetaMaskConnector} from "@wagmi/connectors/metaMask";
import {InjectedConnector} from "@wagmi/connectors/injected";

const walletConnectProjectId = 'dd643f67fa8d1b7bdd83e4c8965b911d'

const defaultChains = [goerli, mainnet];
const { chains, publicClient } = configureChains(defaultChains, [publicProvider()]);
const connectors: Connector[] = [
  new SafeConnector({ chains }),
  // new MetaMaskConnector({ chains }),
  // new InjectedConnector({
  //   chains,
  //   options: {
  //     name: 'Injected',
  //     shimDisconnect: true,
  //   },
  // }),
];

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'GasTank Module',
    walletConnectProjectId,
    connectors,
    publicClient,
  })
)
