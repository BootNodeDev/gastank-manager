import {useConnect} from "wagmi";
import {useEffect} from "react";

const AUTOCONNECTED_CONNECTOR_IDS = ['safe']

export function useAutoConnect() {
  const {connectors, connect} = useConnect()

  useEffect(() => {
    AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
      const connectorInstance = connectors.find(({ id, ready }) => id === connector && ready)

      if (connectorInstance) {
        connect({ connector: connectorInstance })
      }
    })
  }, [connect, connectors])
}
