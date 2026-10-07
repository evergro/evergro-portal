<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { AppState, NavActions, Screen } from '../types/navigation'

const props = defineProps<{ state: AppState; actions: NavActions }>()

interface Profile {
  full_name: string
  email: string
  phone: string | null
  birthday: string | null
  customer_since: string | null
  has_image: boolean
}

interface Address {
  name: string
  image?: string
  address_title?: string
  address_type?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  custom_gate_code?: string
  custom_dog?: string
  custom_lawn_size?: string
}

interface Invoice {
  name: string
  posting_date: string
  grand_total: number
  status: string
  outstanding_amount: number
}

interface PaymentMethod {
  name: string
  brand: string
  card_type?: string
  last4: string
  exp_month: string
  exp_year: string
  custom_default: number
}

const profile = ref<Profile | null>(null)
const addresses = ref<Address[]>([])
const invoices = ref<Invoice[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const loading = ref(true)

function privateImageUrl(doctype: string, name: string) {
  return `/api/method/portal.api.portal.get_private_image?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`
}
const settings: {
  title: string
  rows: {
    label: string
    icon: string
    screen?: Screen
    value?: string
    logout?: boolean
  }[]
}[] = [
  {
    title: 'My account',
    rows: [
      { label: 'Personal info', icon: '👤', screen: 'account-personal' },
      { label: 'My properties', icon: '⌂', screen: 'account-addresses' },
      { label: 'Payment methods', icon: '▣', screen: 'account-payment' },
      { label: 'Billing history', icon: '□', screen: 'account-billing' },
    ],
  },
  {
    title: 'Plan & settings',
    rows: [
      { label: 'My plan', icon: '🌿', screen: 'account-plan', value: 'Weekly' },
      {
        label: 'Notification settings',
        icon: '◷',
        screen: 'account-notifications',
      },
    ],
  },
  {
    title: 'More',
    rows: [
      { label: 'Refer a friend', icon: '★', screen: 'referral' },
      { label: 'Help & support', icon: '?', screen: 'support' },
      { label: 'Log out', icon: '↪', logout: true },
    ],
  },
]

const notifications = [
  { label: 'Visit reminders', values: [true, false, true] },
  { label: 'Crew on the way', values: [true, false, false] },
  { label: 'Visit completed', values: [true, false, false] },
  { label: 'Invoice & payment', values: [true, true, false] },
  { label: 'Promos & offers', values: [false, false, false] },
]

async function api<T>(method: string): Promise<T> {
  const response = await fetch(`/api/method/portal.api.portal.${method}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`${method} failed: ${response.status}`)
  }

  const data = await response.json()
  return data.message
}

async function loadAccountData() {
  loading.value = true

  try {
    const [profileData, addressData, invoiceData, paymentData] =
      await Promise.all([
        api<Profile>('get_profile'),
        api<Address[]>('get_addresses'),
        api<Invoice[]>('get_invoices'),
        api<PaymentMethod[]>('get_payment_methods'),
      ])

    profile.value = profileData
    addresses.value = addressData
    invoices.value = invoiceData
    paymentMethods.value = paymentData
  } catch (error) {
    console.error('Failed to load account data:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function addressText(address: Address) {
  return [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ')
}

function cardExpiry(payment: PaymentMethod) {
  return `${String(payment.exp_month).padStart(2, '0')}/${payment.exp_year}`
}

onMounted(loadAccountData)
</script>
<template>
  <div v-if="state.screen === 'account-personal'" class="px-4 pb-8 pt-4">
    <div class="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div
        v-for="field in [
          { label: 'Full name', value: profile?.full_name },
          { label: 'Phone', value: profile?.phone },
          { label: 'Email', value: profile?.email },
          { label: 'Birthday', value: profile?.birthday ? formatDate(profile.birthday) : 'Not provided' },
        ]"
        :key="field.label"
        class="border-b border-gray-100 px-4 py-3.5 last:border-0"
      >
        <p class="text-xs font-bold text-gray-400">
          {{ field.label.toUpperCase() }}
        </p>
        <p class="mt-0.5 text-sm">
          {{ field.value || '—' }}
        </p>
      </div>
    </div>

    <button
      class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white"
    >
      Save changes
    </button>
  </div>
  <div
    v-else-if="state.screen === 'account-addresses'"
    class="px-4 pb-8 pt-4"
  >
    <div
      v-if="addresses.length"
      v-for="address in addresses"
      :key="address.name"
      class="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <!-- Property image -->
      <div class="relative h-48 w-full bg-[#E6F0EB]">
        <img
          v-if="address.image"
          :src="privateImageUrl('Address', address.name)"
          :alt="address.address_title || 'Property'"
          draggable="false"
          @contextmenu.prevent
          class="h-full w-full select-none object-cover"
        />

        <div
          v-else
          class="flex h-full w-full items-center justify-center"
        >
          <span class="text-5xl">🏡</span>
        </div>

        <!-- Property type/title -->
        <div
          class="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#073B24] shadow-sm backdrop-blur"
        >
          {{ address.address_title || address.address_type || 'Property' }}
        </div>

        <!-- Edit button -->
        <button
          class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#073B24] shadow-sm backdrop-blur"
        >
          Edit
        </button>
      </div>

      <!-- Property details -->
      <div class="p-4">
        <p class="text-sm font-semibold text-gray-900">
          {{ address.address_title || 'My Property' }}
        </p>

        <p class="mt-1 text-sm leading-5 text-gray-500">
          {{ addressText(address) }}
        </p>

        <!-- Property information -->
        <div
          v-if="
            address.custom_gate_code ||
            address.custom_dog ||
            address.custom_lawn_size
          "
          class="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3"
        >
          <div
            v-if="address.custom_gate_code"
            class="rounded-xl bg-gray-50 px-3 py-2"
          >
            <p class="text-[10px] font-bold uppercase text-gray-400">
              Gate
            </p>
            <p class="mt-0.5 text-xs font-medium text-gray-700">
              {{ address.custom_gate_code }}
            </p>
          </div>

          <div
            v-if="address.custom_dog"
            class="rounded-xl bg-gray-50 px-3 py-2"
          >
            <p class="text-[10px] font-bold uppercase text-gray-400">
              Dog
            </p>
            <p class="mt-0.5 text-xs font-medium text-gray-700">
              {{ address.custom_dog }}
            </p>
          </div>

          <div
            v-if="address.custom_lawn_size"
            class="rounded-xl bg-gray-50 px-3 py-2"
          >
            <p class="text-[10px] font-bold uppercase text-gray-400">
              Lawn
            </p>
            <p class="mt-0.5 text-xs font-medium text-gray-700">
              {{ address.custom_lawn_size }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="mb-3 rounded-2xl bg-white p-5 text-center text-sm text-gray-500 shadow-sm"
    >
      No properties found.
    </div>

    <button
      class="w-full rounded-2xl border-2 border-[#073B24] py-3.5 text-sm font-semibold text-[#073B24]"
    >
      + Add another property
    </button>
  </div>
  <div v-else-if="state.screen === 'account-payment'" class="px-4 pb-8 pt-4">
    <div
      v-for="payment in paymentMethods"
      :key="payment.name"
      class="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <div
        class="flex items-center gap-3 rounded-xl border-2 p-3"
        :class="payment.custom_default
          ? 'border-[#073B24]'
          : 'border-gray-100'"
      >
        <span
          class="rounded bg-blue-600 px-2 text-[9px] font-bold text-white"
        >
          {{ payment.brand || payment.card_type || 'CARD' }}
        </span>

        <div class="flex-1">
          <p class="text-sm font-semibold">
            •••• •••• •••• {{ payment.last4 }}
          </p>

          <p class="text-xs text-gray-400">
            Expires {{ cardExpiry(payment) }}
          </p>
        </div>

        <span
          v-if="payment.custom_default"
          class="rounded-full bg-[#E6F0EB] px-2 py-1 text-[10px] font-bold text-[#073B24]"
        >
          Default
        </span>
      </div>

      <div class="mt-2 flex gap-2">
        <button class="flex-1 rounded-xl border py-2 text-xs">
          Change card
        </button>

        <button class="flex-1 rounded-xl border py-2 text-xs">
          Remove
        </button>
      </div>
    </div>

    <div
      v-if="!paymentMethods.length"
      class="mb-3 rounded-2xl bg-white p-5 text-center text-sm text-gray-500 shadow-sm"
    >
      No payment methods found.
    </div>

    <button
      class="w-full rounded-2xl border-2 border-[#073B24] py-3.5 text-sm font-semibold text-[#073B24]"
    >
      + Add new card
    </button>
  </div>
  <div v-else-if="state.screen === 'account-billing'" class="px-4 pb-8 pt-4">
    <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div
        v-for="invoice in invoices"
        :key="invoice.name"
        class="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F0EB]"
        >
          □
        </span>

        <div class="flex-1">
          <p class="text-sm font-semibold">
            {{ invoice.name }}
          </p>

          <p class="text-xs text-gray-400">
            {{ formatDate(invoice.posting_date) }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-bold text-[#073B24]">
            {{ formatMoney(invoice.grand_total) }}
          </p>

          <p
            class="text-[10px] font-bold"
            :class="invoice.outstanding_amount > 0
              ? 'text-[#DC2626]'
              : 'text-[#16A34A]'"
          >
            {{ invoice.outstanding_amount > 0 ? 'Outstanding' : 'Paid' }}
          </p>
        </div>

        <button class="text-xs font-bold text-[#073B24]">
          PDF
        </button>
      </div>

      <div
        v-if="!invoices.length"
        class="p-5 text-center text-sm text-gray-500"
      >
        No invoices found.
      </div>
    </div>
  </div>
  <div v-else-if="state.screen === 'account-plan'" class="px-4 pb-8 pt-4">
    <div class="mb-4 rounded-3xl bg-gradient-to-br from-[#073B24] to-[#0F5C3A] p-5 text-white"><span
        class="rounded-full bg-[#E5D403] px-2 py-0.5 text-xs font-bold text-[#073B24]">Active plan</span>
      <h3 class="mt-2 font-[Outfit] text-xl font-bold">Weekly Maintenance</h3>
      <p class="text-sm text-white/70">Lawn Mowing · Every week</p>
      <div class="mt-4 flex justify-between border-t border-white/20 pt-4">
        <div>
          <p class="text-xs text-white/60">Your price</p><b>R 250 / visit</b>
        </div>
        <div>
          <p class="text-xs text-white/60">Next billing</p><b>1 Oct 2024</b>
        </div>
      </div>
    </div>
    <div class="flex gap-2.5"><button
        class="flex-1 rounded-2xl border-2 border-[#B45309] py-3 text-sm font-semibold text-[#B45309]">Pause
        plan</button><button
        class="flex-1 rounded-2xl border-2 border-[#DC2626] py-3 text-sm font-semibold text-[#DC2626]">Cancel
        plan</button></div>
  </div>
  <div v-else-if="state.screen === 'account-notifications'" class="px-4 pb-8 pt-4">
    <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div class="grid grid-cols-4 border-b px-4 py-2"><span /><span v-for="head in ['Push', 'SMS', 'WA']" :key="head"
          class="text-center text-xs font-bold text-gray-400">{{ head }}</span></div>
      <div v-for="item in notifications" :key="item.label"
        class="grid grid-cols-4 items-center border-b px-4 py-3 last:border-0"><span class="text-xs font-medium">{{
          item.label }}</span>
        <div v-for="(on, i) in item.values" :key="i" class="flex justify-center">
          <div class="flex h-5 w-9 items-center rounded-full p-0.5"
            :class="on ? 'justify-end bg-[#073B24]' : 'justify-start bg-gray-200'"><span
              class="h-4 w-4 rounded-full bg-white shadow" /></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="pb-8">
    <div class="flex flex-col items-center pb-5 pt-6">
      <div
        class="mb-3 h-20 w-20 overflow-hidden rounded-full border-[3px] border-[#E5D403]"
      >
        <img
          v-if="profile?.has_image"
          :src="privateImageUrl('Contact', profile.full_name)"
          :alt="profile.full_name"
          draggable="false"
          @contextmenu.prevent
          class="h-full w-full select-none object-cover"
        />

        <span
          v-else
          class="flex h-full w-full items-center justify-center bg-[#073B24] text-lg font-bold text-white"
        >
          {{
            profile?.full_name
              ?.split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map(name => name[0]?.toUpperCase())
              .join('') || 'EG'
          }}
        </span>
      </div>

      <p class="font-[Outfit] text-lg font-bold">
        {{ profile?.full_name || 'Customer' }}
      </p>

      <p class="text-xs text-gray-400">
        Evergro customer since {{ formatDate(profile?.customer_since) }}
      </p>

      <span
        class="mt-2 rounded-full bg-[#E6F0EB] px-3 py-1 text-xs font-bold text-[#073B24]"
      >
        Weekly Maintenance
      </span>
    </div>

    <div v-for="section in settings" :key="section.title" class="mb-4">
      <p class="mb-1.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        {{ section.title }}
      </p>

      <div class="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <button
          v-for="row in section.rows"
          :key="row.label"
          @click="row.logout ? props.actions.logout() : row.screen && props.actions.goTo(row.screen)"
          class="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left last:border-0"
        >
          <span class="w-6 text-center">{{ row.icon }}</span>
          <span class="flex-1 text-sm font-medium">{{ row.label }}</span>
          <span class="text-sm text-gray-400">{{ row.value }}</span>
          <span>›</span>
        </button>
      </div>
    </div>
  </div>
</template>
