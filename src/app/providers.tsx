'use client'

import {ConnectKitProvider} from 'connectkit'
import * as React from 'react'
import {WagmiConfig} from 'wagmi'
import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider} from '@chakra-ui/react'


import {config} from '../wagmi'

export function Providers({children}: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <CacheProvider>
      <ChakraProvider>
        <WagmiConfig config={config}>
          <ConnectKitProvider>
            {mounted && children}
          </ConnectKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </CacheProvider>
  )
}
