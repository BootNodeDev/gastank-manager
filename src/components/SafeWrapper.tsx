'use client'

import {SafeProvider} from "@safe-global/safe-apps-react-sdk";

export function SafeWrapper({children}: { children: React.ReactNode }) {
  return (
    <SafeProvider>
      {children}
    </SafeProvider>
  )
}
