"use client"

import { useSyncExternalStore } from "react"
import { getClientId } from "@/lib/client-id"

const emptySubscribe = () => () => {}

export function useClientId() {
  return useSyncExternalStore(
    emptySubscribe,
    () => getClientId(),
    () => ""
  )
}
