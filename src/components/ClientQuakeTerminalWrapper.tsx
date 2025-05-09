"use client"

import dynamic from 'next/dynamic'

// Use dynamic import for QuakeTerminal to prevent SSR issues
// The loading=null ensures no loading state is shown
const QuakeTerminal = dynamic(() => import('@/components/QuakeTerminal'), {
  ssr: false,
  loading: () => null
})

// This component ensures we only render the QuakeTerminal on the client
export default function ClientQuakeTerminalWrapper() {
  return <QuakeTerminal />
}
