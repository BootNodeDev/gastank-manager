'use client'

import {useAccount, useChainId, useEnsName} from 'wagmi'
import {useAutoConnect} from "../hooks/useAutoConnect";
import {useState} from "react";
import {addChecksum, downloadObjectAsJson} from "../utils/checksum";
import {useSafeAppsSDK} from '@safe-global/safe-apps-react-sdk'
import {ChainInfo} from "@safe-global/safe-apps-sdk";
import {getAddress, encodeFunctionData} from "viem";
import {AbiFunction} from "abitype";
import {GAS_TANK_MODULE_ADDRESS} from "../constants";

// This function is used to apply some parsing to some value types
export const parseInputValue = (input: any, value: string): any => {
  // If there is a match with this regular expression we get an array value like the following
  // ex: ['uint16', 'uint', '16']. If no match, null is returned
  const isBooleanInput = input.type === 'bool'

  if (value.charAt(0) === '[') {
    const parsed = JSON.parse(value.replace(/"/g, '"'))

    if (input.type === 'bool[]') {
      return parsed.map((value: boolean | string) => {
        if (typeof value == 'string') {
          return value.toLowerCase() === 'true'
        }

        return value
      })
    }

    return parsed
  }

  if (isBooleanInput) {
    return value.toLowerCase() === 'true'
  }

  // if (isNumberInput && value) {
  //   // From web3 1.2.5 negative string numbers aren't correctly padded with leading 0's.
  //   // To fix that we pad the numeric values here as the encode function is expecting a string
  //   // more info here https://github.com/ChainSafe/web3.js/issues/3772
  //   const bitWidth = input.type.match(paramTypeNumber)[2]
  //   return toBN(value).toString(10, bitWidth)
  // }

  return value
}

const NON_VALID_CONTRACT_METHODS = ['receive', 'fallback']

export const encodeToHexData = (
  contractMethod: AbiFunction,
  contractFieldsValues: any,
): string | undefined => {
  const contractMethodName = contractMethod?.name
  const contractFields = contractMethod?.inputs || []

  const isValidContractMethod =
    contractMethodName && !NON_VALID_CONTRACT_METHODS.includes(contractMethodName)

  if (isValidContractMethod) {
    try {
      const parsedValues = contractFields.map((contractField, index) => {
        const contractFieldName = contractField.name || index
        const cleanValue = contractFieldsValues[contractFieldName] || ''

        return parseInputValue(contractField, cleanValue)
      })
      return encodeFunctionData({abi: [{...contractMethod, type: 'function'}], args: parsedValues, functionName: contractMethodName})
    } catch (error) {
      console.log('Error encoding current form values to hex data: ', error)
    }
  }
}

const convertToProposedTransactions = (
  batchFile: {
    transactions: Array<Record<string, any>>
  },
  chainInfo: ChainInfo,
): {id: number; raw: Record<string, string>} | Array<{id: number; raw: Record<string, string>}> => {
  return batchFile.transactions.map((transaction, index) => {
    if (transaction.data) {
      return {
        id: index,
        contractInterface: null,
        description: {
          to: transaction.to,
          value: transaction.value,
          customTransactionData: transaction.data,
          nativeCurrencySymbol: chainInfo.nativeCurrency.symbol,
          networkPrefix: chainInfo.shortName,
        },
        raw: {
          to: transaction.to,
          value: transaction.value,
          data: transaction.data || '',
        },
      }
    }

    return {
      id: index,
      contractInterface: !!transaction.contractMethod
        ? {methods: [transaction.contractMethod]}
        : null,
      description: {
        to: transaction.to,
        value: transaction.value,
        contractMethod: transaction.contractMethod,
        contractMethodIndex: '0',
        contractFieldsValues: transaction.contractInputsValues,
        nativeCurrencySymbol: chainInfo.nativeCurrency.symbol,
        networkPrefix: chainInfo.shortName,
      },
      raw: {
        to: getAddress(transaction.to),
        value: transaction.value,
        data:
          transaction.data ||
          encodeToHexData(transaction.contractMethod, transaction.contractInputsValues) ||
          '0x',
      },
    }
  })
}

export function GasTankModule() {
  const {address} = useAccount()
  const chainId = useChainId()
  const {data: ensName} = useEnsName({address})
  const {sdk} = useSafeAppsSDK()
  useAutoConnect()

  const [enableGTJSON, setEnableGTJSON] = useState(() => {
      const gtJSON = {
        "version": "1.0",
        chainId: `${chainId}`,
        "createdAt": Date.now(),
        "meta": {
          "name": "enable-gasTank-module",
          "description": "Enable GasTank Module",
          "txBuilderVersion": "1.16.2",
          "createdFromSafeAddress": address,
          "createdFromOwnerAddress": "",
        },
        "transactions": [
          {
            "to": address,
            "value": "0",
            "data": null,
            "contractMethod": {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "module",
                  "type": "address"
                }
              ],
              "name": "enableModule",
              "payable": false
            },
            "contractInputsValues": {
              "module": GAS_TANK_MODULE_ADDRESS,
            }
          }
        ]
      }

      return addChecksum(gtJSON)
    }
  )

  const handleRegenerate = async () => {
    setEnableGTJSON((gtJSON: Record<string, any>) => addChecksum({
      ...gtJSON,
      createdAt: Date.now(),
    }))
  }

  const handleDownload = () => {
    downloadObjectAsJson(enableGTJSON)
  }

  const handleEnable = async () => {
    try {
      const info = await sdk.safe.getInfo()
      const chainInfo = await sdk.safe.getChainInfo()
      console.table({info, chainInfo})
      const convertedTxs = convertToProposedTransactions(enableGTJSON, chainInfo);
      // @ts-ignore
      await sdk.txs.send({txs: [...convertedTxs].map(({ raw }) => raw) })
    } catch (e) {
      console.error('GT Manager', e)
    }
  }

  return (
    <div>
      {ensName ?? address}
      {ensName ? ` (${address})` : null}
      <br />
      <button onClick={handleRegenerate}>Regenerate JSON</button>
      <pre>
      {enableGTJSON ? JSON.stringify(enableGTJSON, null, 2) : null}
    </pre>
      <br />
      {enableGTJSON ? <button onClick={handleDownload}>Download JSON</button> : null}
      <br />
      {enableGTJSON ? <button onClick={handleEnable}>Enable GasTank Module</button> : null}
    </div>
  )
}
