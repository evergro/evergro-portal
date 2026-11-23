export type VisitStatus = "Completed" | "Upcoming" | "Skipped" | "Rescheduled";

export interface Visit {
  id: string;
  date: string;
  month: string;
  day: number;
  timeWindow: string;
  property: string;
  service: string;
  status: VisitStatus;
  arrival?: string;
  finish?: string;
  summary?: string;
  notes?: string;
  reason?: string;
  newDate?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  tasks?: string[];
  team?: string;
  teamNote?: string;
}

export interface Property {
  id: string;
  address: string;
  photo: string;
  lastVisit: string;
  plan: { name: string; frequency: string; pricePerVisit: number };
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Due" | "Overdue";
  type: "Invoice" | "Payment";
}

export interface PaymentCard {
  type: "Visa" | "Mastercard";
  last4: string;
  expiry: string;
  cardholder: string;
}

export interface CheckoutLineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutOrder {
  invoiceNumber: string;
  propertyAddress: string;
  billingAddress: string;
  serviceDate: string;
  customer: Customer;
  lineItems: CheckoutLineItem[];
  discountLabel: string;
  discountAmount: number;
  savedCards: PaymentCard[];
}

export interface NotificationSettings {
  reminders: boolean;
  completed: boolean;
  invoices: boolean;
  promotions: boolean;
  referrals: boolean;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  since: string;
  avatar: string;
}

export interface Referral {
  name: string;
  month: string;
  status: "Signed up" | "Pending";
  reward: number;
}

export interface ReferralSummary {
  code: string;
  url: string;
  goal: number;
  rewardPerReferral: number;
  bonus: number;
  referrals: Referral[];
}

export interface Campaign {
  slug: string;
  name: string;
  headline: string;
  highlight: string;
  terms: string;
  tagline: string;
  badges: string[];
  discountPercent: number;
  heroImage: string;
  bannerTitle: string;
  bannerText: string;
}

export type AddressClass = "skycity" | "quote" | "waitlist";
export type TierId = "essential" | "standard" | "complete";
export type ZoneId = "outside" | "front" | "back";

export interface PricingTier {
  id: TierId;
  name: string;
  description: string;
  zone: ZoneId;
}

export interface PricingBundle {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
  prices: Record<TierId, number>;
}

export interface LayoutZone {
  id: ZoneId;
  label: string;
  rects: [number, number, number, number][];
}

export interface HouseLayout {
  id: string;
  name: string;
  description: string;
  house: [number, number, number, number][];
  gate: [number, number];
  zones: LayoutZone[];
}

export interface PromoStep {
  id: string;
  label: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

// ---- Guided onboarding ----
export type Cadence = "weekly" | "fortnightly";

export interface GuideOption {
  id: string;
  label: string;
  hint?: string;
}

export interface GuideQuestion {
  id: string;
  /** "options" renders a list of choices; "areas" renders the yard diagram. */
  kind: "options" | "areas";
  title: string;
  subtitle: string;
  options: GuideOption[];
  /** Educates the customer on why we ask. */
  why: string;
  /** Why Evergro beats the alternative at this stage. */
  edge: { title: string; text: string };
}

export interface IntroSlide {
  id: string;
  title: string;
  text: string;
  image?: string;
}

export interface PlanOffer {
  id: string;
  name: string;
  tagline: string;
  cadence: Cadence;
  cutsPerMonth: number;
  bundleId: string;
  includes: string[];
  fertiliser: boolean;
  monthly: number;
  firstMonth: number;
  saving: number;
}

export interface PlanRecommendation {
  offers: PlanOffer[];
  recommendedId: string;
  reasons: string[];
}

export interface MemberPromo {
  id: string;
  badge: string;
  title: string;
  text: string;
  cta: string;
  confirmation: string;
}
