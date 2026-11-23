import { reactive, watch } from "vue"
import type { AddressClass, TierId } from "@/types"

interface PromoState {
  campaign: string
  address: string
  addressClass: AddressClass | null
  lawnArea: number | null
  areaMethod: "traced" | "auto" | null
  details: { name: string; email: string; phone: string }
  layoutId: string
  tierId: TierId
  bundleId: string
  answers: Record<string, string>
  planId: string
  password: string
  paid: { reference: string; amount: number; planName: string; monthly: number } | null
}

const KEY = "evergro-promo-flow"
const blank = (): PromoState => ({
  campaign: "spring-special",
  address: "",
  addressClass: null,
  lawnArea: null,
  areaMethod: null,
  details: { name: "", email: "", phone: "" },
  layoutId: "",
  tierId: "standard",
  bundleId: "full",
  answers: {},
  planId: "",
  password: "",
  paid: null,
})

function load(): PromoState {
  try {
    const saved = sessionStorage.getItem(KEY)
    return saved ? { ...blank(), ...JSON.parse(saved) } : blank()
  } catch {
    return blank()
  }
}

// Module-level so every step of the onboarding shares one state.
const state = reactive<PromoState>(load())
watch(state, (value) => sessionStorage.setItem(KEY, JSON.stringify({ ...value, password: "" })), { deep: true })

export function usePromoFlow() {
  function reset() {
    Object.assign(state, blank())
  }
  return { state, reset }
}
