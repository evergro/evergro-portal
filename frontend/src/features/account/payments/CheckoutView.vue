<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import { getCheckoutOrder, payCheckoutOrder } from "@/services/mockApi";
import type { CheckoutOrder, Customer } from "@/types";

type CardChoice = "saved" | "new";

const order = ref<CheckoutOrder>();
const details = ref<Customer>();
const billingAddress = ref("");
const editingDetails = ref(false);
const cardChoice = ref<CardChoice>("saved");
const agreed = ref(false);
const loading = ref(true);
const loadError = ref("");
const paying = ref(false);
const paid = ref(false);

const subtotal = computed(
  () =>
    order.value?.lineItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    ) ?? 0,
);
const total = computed(() =>
  Math.max(0, subtotal.value - (order.value?.discountAmount ?? 0)),
);
const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("ZAR", "R");

onMounted(async () => {
  try {
    const checkout = await getCheckoutOrder();
    order.value = checkout;
    details.value = { ...checkout.customer };
    billingAddress.value = checkout.billingAddress;
  } catch {
    loadError.value = "We couldn’t load this invoice. Please try again.";
  } finally {
    loading.value = false;
  }
});

function saveDetails() {
  editingDetails.value = false;
}

async function pay() {
  if (!order.value || !agreed.value) return;
  paying.value = true;
  await payCheckoutOrder(order.value.invoiceNumber);
  paying.value = false;
  paid.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div
    v-if="loading"
    class="mx-auto max-w-6xl animate-pulse px-4 pt-8 md:px-8 md:pt-10"
    aria-label="Loading checkout"
  >
    <div class="h-5 w-28 rounded-full bg-primary/10" />
    <div class="mt-4 h-10 w-72 max-w-full rounded-2xl bg-primary/10" />
    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <div class="h-96 rounded-3xl bg-white card-shadow" />
      <div class="h-96 rounded-3xl bg-white card-shadow" />
    </div>
  </div>
  <div
    v-else-if="loadError"
    class="mx-auto max-w-lg px-4 py-16 text-center md:px-8"
  >
    <AppCard>
      <p class="text-xl font-black text-primary">Invoice unavailable</p>
      <p class="mt-2 text-sm leading-6 text-stone-600">{{ loadError }}</p>
      <router-link to="/portal/account/payments/transactions" class="mt-6 block">
        <AppButton variant="secondary">Back to transactions</AppButton>
      </router-link>
    </AppCard>
  </div>
  <div
    v-else-if="order && details"
    class="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10"
  >
    <div v-if="paid" class="mx-auto max-w-xl py-10 md:py-20">
      <AppCard class="text-center">
        <span
          class="mx-auto grid size-16 place-items-center rounded-full bg-primary text-white"
        >
          <AppIcon name="check" :size="28" />
        </span>
        <p
          class="mt-6 text-xs font-bold tracking-[0.16em] text-primary/45 uppercase"
        >
          Payment received
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-primary">
          Your garden is booked.
        </h1>
        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">
          We’ve emailed your receipt for {{ order.invoiceNumber }}. Your Evergro
          team will see you on {{ order.serviceDate }}.
        </p>
        <router-link to="/portal/schedule" class="mt-7 block">
          <AppButton>View your schedule</AppButton>
        </router-link>
      </AppCard>
    </div>

    <template v-else>
      <div class="mb-8 max-w-2xl">
        <p
          class="text-xs font-bold tracking-[0.16em] text-primary/45 uppercase"
        >
          Secure checkout
        </p>
        <h1
          class="mt-2 text-3xl font-black tracking-tight text-primary md:text-4xl"
        >
          Complete your payment
        </h1>
        <p class="mt-3 text-sm leading-6 text-stone-600">
          Review your garden service and choose how you’d like to pay.
        </p>
      </div>

      <form
        class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-8"
        @submit.prevent="pay"
      >
        <div class="space-y-6">
          <AppCard>
            <div
              class="flex items-start justify-between gap-4 border-b border-primary/8 pb-5"
            >
              <div>
                <p class="text-lg font-black text-primary">Your service</p>
                <p class="mt-1 text-sm text-stone-500">
                  {{ order.invoiceNumber }} · {{ order.serviceDate }}
                </p>
              </div>
              <span
                class="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary"
                >Once-off</span
              >
            </div>

            <div class="divide-y divide-primary/7">
              <div
                v-for="item in order.lineItems"
                :key="item.id"
                class="flex gap-4 py-5"
              >
                <span
                  class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-sm font-black text-primary"
                  >{{ item.quantity }}</span
                >
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-primary">{{ item.name }}</p>
                  <p class="mt-1 text-sm leading-5 text-stone-500">
                    {{ item.description }}
                  </p>
                </div>
                <p class="shrink-0 font-bold text-primary">
                  {{ formatMoney(item.unitPrice * item.quantity) }}
                </p>
              </div>
            </div>

            <div class="border-t border-primary/8 pt-5">
              <div
                class="flex justify-between text-sm text-stone-600"
              >
                <span>Subtotal</span>
                <span class="font-semibold text-primary">{{
                  formatMoney(subtotal)
                }}</span>
              </div>
              <div
                class="mt-3 flex justify-between text-sm text-emerald-700"
              >
                <span>{{ order.discountLabel }}</span>
                <span class="font-bold"
                  >− {{ formatMoney(order.discountAmount) }}</span
                >
              </div>
              <div
                class="mt-5 flex items-end justify-between border-t border-primary/8 pt-5"
              >
                <div>
                  <p class="text-sm font-bold text-primary">Total due today</p>
                  <p class="mt-1 text-xs text-stone-400">
                    No recurring or annual charge
                  </p>
                </div>
                <p class="text-2xl font-black tracking-tight text-primary">
                  {{ formatMoney(total) }}
                </p>
              </div>
            </div>
          </AppCard>

          <div
            class="flex items-start gap-3 rounded-2xl border border-primary/8 bg-primary-soft/60 p-4"
          >
            <AppIcon
              name="map"
              :size="19"
              class="mt-0.5 shrink-0 text-primary"
            />
            <div>
              <p class="text-xs font-bold tracking-wide text-primary/45 uppercase">
                Service address
              </p>
              <p class="mt-1 text-sm font-semibold text-primary">
                {{ order.propertyAddress }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-6 lg:sticky lg:top-6">
          <AppCard>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-lg font-black text-primary">Your details</p>
                <p class="mt-1 text-sm text-stone-500">
                  For your receipt and service updates
                </p>
              </div>
              <button
                type="button"
                class="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-primary-soft"
                @click="editingDetails = !editingDetails"
              >
                {{ editingDetails ? "Cancel" : "Edit" }}
              </button>
            </div>

            <div v-if="editingDetails" class="mt-5 space-y-4">
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Full name</span
                >
                <input
                  v-model="details.name"
                  required
                  class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-sm text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Email address</span
                >
                <input
                  v-model="details.email"
                  required
                  type="email"
                  class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-sm text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Mobile number</span
                >
                <input
                  v-model="details.phone"
                  required
                  type="tel"
                  class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-sm text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Billing address</span
                >
                <textarea
                  v-model="billingAddress"
                  required
                  rows="2"
                  class="w-full resize-none rounded-2xl border border-primary/12 bg-stone-50 px-4 py-3 text-sm text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8"
                />
              </label>
              <AppButton variant="secondary" @click="saveDetails"
                >Save details</AppButton
              >
            </div>

            <dl v-else class="mt-5 space-y-4">
              <div>
                <dt class="text-xs font-bold text-primary/45">Name</dt>
                <dd class="mt-1 text-sm font-semibold text-primary">
                  {{ details.name }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-primary/45">Email</dt>
                <dd class="mt-1 break-all text-sm font-semibold text-primary">
                  {{ details.email }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-primary/45">Mobile</dt>
                <dd class="mt-1 text-sm font-semibold text-primary">
                  {{ details.phone }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-primary/45">
                  Billing address
                </dt>
                <dd class="mt-1 text-sm leading-5 font-semibold text-primary">
                  {{ billingAddress || details.email }}
                </dd>
              </div>
            </dl>
          </AppCard>

          <AppCard>
            <div>
              <p class="text-lg font-black text-primary">Payment method</p>
              <p class="mt-1 text-sm text-stone-500">
                Choose a saved card or use a new one
              </p>
            </div>

            <div class="mt-5 space-y-3">
              <label
                v-for="savedCard in order.savedCards"
                :key="savedCard.last4"
                class="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition"
                :class="
                  cardChoice === 'saved'
                    ? 'border-primary bg-primary-soft/70 ring-1 ring-primary'
                    : 'border-primary/10 bg-white'
                "
              >
                <input
                  v-model="cardChoice"
                  type="radio"
                  value="saved"
                  class="size-4 accent-primary"
                />
                <span
                  class="grid size-10 place-items-center rounded-xl bg-primary text-xs font-black text-white"
                  >{{ savedCard.type === "Visa" ? "VISA" : "MC" }}</span
                >
                <span class="flex-1">
                  <span class="block text-sm font-bold text-primary"
                    >•••• {{ savedCard.last4 }}</span
                  >
                  <span class="mt-0.5 block text-xs text-stone-500"
                    >Expires {{ savedCard.expiry }}</span
                  >
                </span>
                <span
                  class="hidden text-xs font-bold text-primary/45 sm:block"
                  >Saved card</span
                >
              </label>

              <label
                class="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition"
                :class="
                  cardChoice === 'new'
                    ? 'border-primary bg-primary-soft/70 ring-1 ring-primary'
                    : 'border-primary/10 bg-white'
                "
              >
                <input
                  v-model="cardChoice"
                  type="radio"
                  value="new"
                  class="size-4 accent-primary"
                />
                <span
                  class="grid size-10 place-items-center rounded-xl border border-primary/10 bg-white text-primary"
                >
                  <span class="text-xl leading-none">+</span>
                </span>
                <span class="text-sm font-bold text-primary">Add a new card</span>
              </label>
            </div>

            <div
              v-if="cardChoice === 'new'"
              class="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-stone-50 p-4"
            >
              <label class="col-span-2 block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Card number</span
                >
                <input
                  required
                  inputmode="numeric"
                  placeholder="1234 5678 9012 3456"
                  class="min-h-12 w-full rounded-xl border border-primary/12 bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >Expiry</span
                >
                <input
                  required
                  placeholder="MM / YY"
                  class="min-h-12 w-full rounded-xl border border-primary/12 bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold text-primary/60"
                  >CVV</span
                >
                <input
                  required
                  inputmode="numeric"
                  placeholder="123"
                  class="min-h-12 w-full rounded-xl border border-primary/12 bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <label
              class="mt-5 flex cursor-pointer items-start gap-3 border-t border-primary/8 pt-5"
            >
              <input
                v-model="agreed"
                required
                type="checkbox"
                class="mt-0.5 size-5 rounded accent-primary"
              />
              <span class="text-xs leading-5 text-stone-600">
                I authorise Evergro Landscapers to charge
                <strong class="text-primary">{{ formatMoney(total) }}</strong>
                for this invoice.
              </span>
            </label>

            <div class="mt-5">
              <AppButton type="submit" :disabled="!agreed || paying">
                <AppIcon v-if="!paying" name="lock" :size="17" />
                {{ paying ? "Processing securely…" : `Pay ${formatMoney(total)}` }}
              </AppButton>
            </div>

            <div
              class="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400"
            >
              <AppIcon name="lock" :size="14" />
              Encrypted and processed securely
            </div>
          </AppCard>
        </div>
      </form>
    </template>
  </div>
</template>
