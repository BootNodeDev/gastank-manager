'use client'

import {useAccount, useChainId} from 'wagmi'
import {useAutoConnect} from "../hooks/useAutoConnect";
import {useState} from "react";
import {addChecksum} from "../utils/checksum";
import {useSafeAppsSDK} from '@safe-global/safe-apps-react-sdk'
import {ChainInfo} from "@safe-global/safe-apps-sdk";
import {getAddress, encodeFunctionData} from "viem";
import {AbiFunction} from "abitype";
import {GAS_TANK_MODULE_ADDRESS} from "../constants";
import {
  Center,
  Box,
  Button,
  Code,
  Container,
  Flex,
  Input,
  Stack,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import {Link} from "@chakra-ui/next-js";
import {ExternalLinkIcon} from "@chakra-ui/icons";
import {goerli, mainnet, optimism} from "@wagmi/chains";

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
): {
  id: number;
  raw: Record<string, string>
} | Array<{
  id: number;
  raw: Record<string, string>
}> => {
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

const chainExplorer: Record<string, string> = {
  '1': mainnet.blockExplorers.default.url,
  '10': optimism.blockExplorers.default.url,
  '5': goerli.blockExplorers.default.url,
}

export function GasTankModule() {
  const {address} = useAccount()
  const chainId = useChainId()
  const {sdk} = useSafeAppsSDK()
  useAutoConnect()

  const enableGtJson = addChecksum({
    "version": "1.0",
    chainId: `${chainId}`,
    "createdAt": Date.now(),
    "meta": {
      "name": "enable-gasTank-module",
      "description": "Enable GasTank Module",
      "txBuilderVersion": "1.16.3",
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
  })

  const [delegate, setDelegate] = useState<string>('')
  const [addDelegateGTJSON, setAddDelegateGTJSON] = useState(() => {
    const addDelegateGtJson = {
      "version": "1.0",
      chainId: `${chainId}`,
      "createdAt": Date.now(),
      "meta": {
        "name": "add-delegate-gasTank-module",
        "description": "AddDelegate GasTank Module",
        "txBuilderVersion": "1.16.3",
        "createdFromSafeAddress": address,
        "createdFromOwnerAddress": "",
      },
      "transactions": [
        {
          "to": GAS_TANK_MODULE_ADDRESS,
          "value": "0",
          "data": null,
          "contractMethod": {
            "inputs": [
              {
                "internalType": "address",
                "name": "_delegate",
                "type": "address"
              }
            ],
            "name": "addDelegate",
            "payable": false,
          },
          "contractInputsValues": {
            "_delegate": delegate,
          }
        }
      ]
    }

    return addChecksum(addDelegateGtJson)
  })

  const handleEnable = async () => {
    try {
      const chainInfo = await sdk.safe.getChainInfo()
      const convertedTxs = convertToProposedTransactions(enableGtJson, chainInfo);

      // @ts-ignore
      await sdk.txs.send({txs: [...convertedTxs].map(({raw}) => raw)})
    } catch (e) {
      console.error('GT Manager', e)
    }
  }

  const handleDelegateUpdate = (e: any) => {
    const {value} = e.target

    setDelegate(value)
    setAddDelegateGTJSON((addDelegateGtJson: Record<string, any>) => addChecksum({
      ...addDelegateGtJson,
      createdAt: Date.now(),
      delegate: value,
    }))
  }

  const handleAddDelegate = async () => {
    if (!delegate) {
      return
    }

    try {
      const info = await sdk.safe.getInfo()
      const chainInfo = await sdk.safe.getChainInfo()
      const convertedTxs = convertToProposedTransactions(addDelegateGTJSON, chainInfo);

      // @ts-ignore
      await sdk.txs.send({txs: [...convertedTxs].map(({raw}) => raw)})
    } catch (e) {
      console.error('GT Manager', e)
    }
  }

  // @ts-ignore
  return (
    <>
      <Stack spacing='48px'>
        <Center>
          <Button colorScheme="teal" onClick={handleEnable} maxW="30%">Enable GasTank Module</Button>
        </Center>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Input type="text" value={delegate} onChange={handleDelegateUpdate} />
          <Button colorScheme="teal" onClick={handleAddDelegate}>Add Delegate</Button>
        </Flex>
        <Box
          bg={useColorModeValue('gray.50', 'gray.900')}
          color={useColorModeValue('gray.700', 'gray.200')}>
          <Container
            as={Stack}
            maxW={'6xl'}
            py={4}
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            justify={{ base: 'center', md: 'space-between' }}
            align={{ base: 'center', md: 'center' }}>
            <Text>Module Address</Text>
            <Stack direction={'row'} spacing={6}>
              <Code><Text fontSize="large">{GAS_TANK_MODULE_ADDRESS}</Text></Code>
              <Box><Link href={`${chainExplorer[chainId]}/address/${GAS_TANK_MODULE_ADDRESS}`}
                         target="_blank"><ExternalLinkIcon /></Link></Box>
            </Stack>
          </Container>
        </Box>
      </Stack>
    </>
  )
}
