import type {
  CheckoutOrder,
  Customer,
  NotificationSettings,
  PaymentCard,
  Property,
  ReferralSummary,
  Transaction,
  Visit,
} from "@/types"

const lawnPhoto =
  "https://images.unsplash.com/photo-1636301587190-88cbb412fea0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"
const gardenPhoto =
  "https://images.unsplash.com/photo-1658595060302-20219e956ad0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"

const customer: Customer = {
  name: "Ntando Mazibuko",
  email: "ntandomazibuko@example.co.za",
  phone: "082 555 0143",
  birthday: "2001-12-18",
  since: "March 2022",
  avatar: "NM",
  image: null,
}

const visits: Visit[] = [
  {
    id: "v1",
    date: "18 June 2025",
    month: "June 2025",
    day: 18,
    timeWindow: "09:00–11:00",
    property: "24 Jacaranda Lane, Parkview",
    service: "Garden maintenance",
    status: "Rescheduled",
    reason: "Heavy rain is forecast in your area.",
    newDate: "20 June 2025",
  },
  {
    id: "v2",
    date: "04 June 2025",
    month: "June 2025",
    day: 4,
    timeWindow: "09:10–10:35",
    property: "24 Jacaranda Lane, Parkview",
    service: "Lawn care",
    status: "Completed",
    arrival: "09:10",
    finish: "10:35",
    summary:
      "Mowed and edged the lawn, pruned shrubs and cleared all garden waste.",
    notes:
      "The lawn is looking healthy. We recommend feeding again next month.",
    tasks: ["Mowed lawn", "Edged borders", "Blew paths and driveway", "Trimmed hedges"],
    team: "Jake & Team",
    teamNote: "Gate latched after service",
    beforePhoto: gardenPhoto,
    afterPhoto: lawnPhoto,
  },
  {
    id: "v3",
    date: "21 May 2025",
    month: "May 2025",
    day: 21,
    timeWindow: "10:00–12:00",
    property: "24 Jacaranda Lane, Parkview",
    service: "Garden maintenance",
    status: "Completed",
    arrival: "10:04",
    finish: "11:42",
    summary: "Mowed, edged and tidied garden beds.",
    tasks: ["Mowed lawn", "Edged borders", "Tidied garden beds"],
    team: "Jake & Team",
    teamNote: "Dog toys moved to patio",
    beforePhoto: gardenPhoto,
    afterPhoto: lawnPhoto,
  },
  {
    id: "v4",
    date: "07 May 2025",
    month: "May 2025",
    day: 7,
    timeWindow: "09:00–11:00",
    property: "24 Jacaranda Lane, Parkview",
    service: "Lawn care",
    status: "Skipped",
    reason: "Access gate was locked when our team arrived.",
  },
]

const properties: Property[] = [
  {
    id: "parkview",
    address: "24 Jacaranda Lane, Parkview",
    photo: lawnPhoto,
    lastVisit: "04 June 2025",
    plan: {
      name: "Garden Care",
      frequency: "Every 2 weeks",
      pricePerVisit: 650,
    },
  },
  {
    id: "rosebank",
    address: "8 Oxford Road, Rosebank",
    photo: gardenPhoto,
    lastVisit: "21 May 2025",
    plan: { name: "Lawn Essentials", frequency: "Monthly", pricePerVisit: 480 },
  },
]

const transactions: Transaction[] = [
  {
    id: "INV-1048",
    date: "01 June 2025",
    amount: 650,
    status: "Due",
    type: "Invoice",
  },
  {
    id: "PAY-1032",
    date: "20 May 2025",
    amount: 650,
    status: "Paid",
    type: "Payment",
  },
  {
    id: "INV-1016",
    date: "01 May 2025",
    amount: 650,
    status: "Paid",
    type: "Invoice",
  },
]

const card: PaymentCard = {
  type: "Visa",
  last4: "1234",
  expiry: "08/28",
  cardholder: "THANDI MOKOENA",
}

const checkoutOrder: CheckoutOrder = {
  invoiceNumber: "INV-1048",
  propertyAddress: "24 Jacaranda Lane, Parkview",
  billingAddress: "24 Jacaranda Lane, Parkview, Johannesburg, 2193",
  serviceDate: "20 June 2025",
  customer,
  lineItems: [
    {
      id: "garden-care",
      name: "Pro Garden Care",
      description: "Complete lawn and garden service",
      quantity: 1,
      unitPrice: 850,
    },
    {
      id: "hedge-trim",
      name: "Hedge shaping",
      description: "Front and side boundary hedges",
      quantity: 1,
      unitPrice: 280,
    },
    {
      id: "waste",
      name: "Green waste removal",
      description: "Collection and responsible disposal",
      quantity: 1,
      unitPrice: 120,
    },
  ],
  discountLabel: "Neighbourhood loyalty",
  discountAmount: 125,
  savedCards: [card],
}

const notificationDefaults: NotificationSettings = {
  reminders: true,
  completed: true,
  invoices: true,
  promotions: false,
  referrals: true,
}

const wait = <T>(value: T) => Promise.resolve(structuredClone(value))

export const getCustomer = () => wait(customer)
export const updateCustomer = (value: Customer) => wait(value)
export const getVisits = () => wait(visits)
export const getVisit = (id: string) => wait(visits.find((visit) => visit.id === id))
export const getNextVisit = () => wait(visits[0])
export const getLastVisit = () =>
  wait(visits.find((visit) => visit.status === "Completed")!)
export const getProperties = () => wait(properties)
export const getProperty = (id: string) =>
  wait(properties.find((property) => property.id === id))
export const getTransactions = () => wait(transactions)
export const getActiveCard = () => wait(card)
export const getCheckoutOrder = () => wait(checkoutOrder)
export const payCheckoutOrder = (invoiceNumber: string) =>
  wait({ invoiceNumber, status: "Paid" as const })
export const getNotificationSettings = () => wait(notificationDefaults)
export const saveNotificationSettings = (settings: NotificationSettings) =>
  wait(settings)
export const getReferral = () =>
  wait<ReferralSummary>({
    code: "THANDI250",
    url: "evergro.co.za/refer/THANDI250",
    goal: 5,
    rewardPerReferral: 150,
    bonus: 500,
    referrals: [
      { name: "Priya Naidoo", month: "Sep 2024", status: "Signed up", reward: 150 },
      { name: "David Chen", month: "Oct 2024", status: "Signed up", reward: 150 },
      { name: "Sipho Dlamini", month: "Nov 2024", status: "Pending", reward: 150 },
    ],
  })
export const getSupport = () =>
  wait({ phone: "082 925 4447", whatsapp: "27829254447" })
