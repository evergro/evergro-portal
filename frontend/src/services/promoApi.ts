import type {
  AddressClass,
  Campaign,
  GuideQuestion,
  IntroSlide,
  MemberPromo,
  PlanOffer,
  PlanRecommendation,
  TierId,
  FaqItem,
  HouseLayout,
  PricingBundle,
  PricingTier,
  PromoStep,
} from "@/types"

const wait = <T>(value: T) => Promise.resolve(structuredClone(value))

const campaign: Campaign = {
  slug: "spring-special",
  name: "Spring Special",
  headline: "First cut",
  highlight: "free",
  tagline: "Have your lawn looking its best, with your friendly neighbourhood landscaper.",
  terms: "One of your first four weekly cuts is on us (25% off month one). Valid for the first 100 new customers. T&Cs apply.",
  badges: ["Professional", "Fully insured"],
  discountPercent: 25,
  heroImage:
    "https://images.unsplash.com/photo-1690068023694-053da714f95f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1100",
  bannerTitle: "Spring Special: your first cut is free",
  bannerText: "Answer a few questions and get the plan that fits your lawn.",
}

// Areas we can price automatically, areas we quote by hand, anything else is waitlisted.
const serviceAreas = {
  skycity: ["sky city", "skycity"],
  quote: ["nigel", "heidelberg", "alberton"],
}

const tiers: PricingTier[] = [
  { id: "essential", name: "Essential", description: "Grass outside the gate", zone: "outside" },
  { id: "standard", name: "Standard", description: "Outside the gate and the front yard", zone: "front" },
  { id: "complete", name: "Complete", description: "Grass everywhere, including the back", zone: "back" },
]

const bundles: PricingBundle[] = [
  {
    id: "lawn",
    name: "Lawn Care",
    tagline: "Cut and trim",
    includes: ["Lawn cutting", "Edge trimming"],
    prices: { essential: 200, standard: 400, complete: 600 },
  },
  {
    id: "lawn-weeds",
    name: "Lawn + Weeds",
    tagline: "Cut, trim and weed control",
    includes: ["Lawn cutting", "Edge trimming", "Weed control"],
    prices: { essential: 300, standard: 500, complete: 700 },
  },
  {
    id: "full",
    name: "Full Garden",
    tagline: "The complete tidy-up",
    includes: [
      "Lawn cutting",
      "Weed control on pavements",
      "Garden bed turning",
      "Shrub trimming",
    ],
    prices: { essential: 400, standard: 600, complete: 800 },
  },
]

const layouts: HouseLayout[] = [
  {
    id: "classic",
    name: "Classic home",
    description: "Front yard and a back garden",
    house: [[60, 54, 80, 36]],
    gate: [100, 133],
    zones: [
      { id: "outside", label: "Outside the gate", rects: [[10, 136, 180, 12]] },
      { id: "front", label: "Front yard", rects: [[10, 94, 180, 38]] },
      { id: "back", label: "Back of the house", rects: [[10, 8, 180, 42]] },
    ],
  },
  {
    id: "wide-front",
    name: "Big front lawn",
    description: "Large front, small back",
    house: [[50, 40, 100, 30]],
    gate: [100, 133],
    zones: [
      { id: "outside", label: "Outside the gate", rects: [[10, 136, 180, 12]] },
      { id: "front", label: "Front yard", rects: [[10, 74, 180, 58]] },
      { id: "back", label: "Back of the house", rects: [[30, 10, 140, 26]] },
    ],
  },
  {
    id: "corner",
    name: "Corner plot",
    description: "Front yard wraps round the side",
    house: [[14, 58, 84, 34]],
    gate: [60, 133],
    zones: [
      { id: "outside", label: "Outside the gate", rects: [[10, 136, 180, 12]] },
      { id: "front", label: "Front and side yard", rects: [[10, 94, 180, 38], [104, 10, 86, 82]] },
      { id: "back", label: "Back of the house", rects: [[10, 10, 90, 44]] },
    ],
  },
  {
    id: "townhouse",
    name: "Townhouse",
    description: "Compact front and courtyard",
    house: [[40, 50, 120, 52]],
    gate: [100, 133],
    zones: [
      { id: "outside", label: "Outside the gate", rects: [[40, 136, 120, 12]] },
      { id: "front", label: "Front yard", rects: [[40, 106, 120, 26]] },
      { id: "back", label: "Back of the house", rects: [[40, 12, 120, 34]] },
    ],
  },
]

const faqs: FaqItem[] = [
  { q: "How does the free cut work?", a: "Evergro is a monthly plan. In your first month, one of your four weekly cuts is free, which works out to 25% off that month. After that you pay the normal monthly price." },
  { q: "When am I charged?", a: "You pay your first month when you subscribe, then the same date each month. We never charge per visit and there are no hidden extras." },
  { q: "Can I cancel at any time?", a: "Yes. Cancel any time through WhatsApp, email or by calling us. There are no contracts and no annual fees." },
  { q: "What if my yard is large or unusual?", a: "If we can’t price your yard automatically, we save your details and send you a custom quote within an hour during business hours." },
  { q: "Do I need to be home?", a: "No. As long as we can access the grass, we’ll take care of the rest and send photos when we’re done." },
]

const howItWorks: PromoStep[] = [
  { id: "address", label: "Enter your address and confirm your home on the map." },
  { id: "guide", label: "Answer a few quick questions about how you use your lawn." },
  { id: "plan", label: "Get the plan we recommend for you, plus two alternatives." },
  { id: "start", label: "Subscribe monthly and your free cut is applied automatically." },
]

const analysisSteps: PromoStep[] = [
  { id: "locate", label: "Locating your property" },
  { id: "measure", label: "Measuring your lawn" },
  { id: "access", label: "Checking access and boundaries" },
  { id: "price", label: "Preparing your plan" },
]

const mapConfig = { latitude: -26.33, traceZoom: 20, confirmZoom: 19, autoAreaM2: 240 }

export const getCampaign = (slug?: string) => wait({ ...campaign, slug: slug || campaign.slug })
export const getActivePromo = () => wait(campaign)
export const getPricing = () => wait({ tiers, bundles })
export const getHouseLayouts = () => wait(layouts)
export const getFaqs = () => wait(faqs)
export const getHowItWorks = () => wait(howItWorks)
export const getAnalysisSteps = () => wait(analysisSteps)
export const getMapConfig = () => wait(mapConfig)

export function classifyAddress(address: string): Promise<AddressClass> {
  const text = address.toLowerCase()
  const match = (keywords: string[]) => keywords.some((word) => text.includes(word))
  if (match(serviceAreas.skycity)) return Promise.resolve("skycity")
  if (match(serviceAreas.quote)) return Promise.resolve("quote")
  return Promise.resolve("waitlist")
}

export const submitQuoteRequest = (_payload: unknown) => wait({ saved: true })
export const joinWaitlist = (_payload: unknown) => wait({ saved: true })
export const startSubscription = (_payload: unknown) =>
  wait({ status: "active" as const, reference: `EVG-${Math.floor(100000 + Math.random() * 900000)}` })
export const createAccount = (_payload: unknown) => wait({ created: true })

// ---------------------------------------------------------------------------
// Guided onboarding: questions, plan recommendation and member promos
// ---------------------------------------------------------------------------

const introSlides: IntroSlide[] = [
  { id: "welcome", title: "Your first cut is free", text: "Join Evergro on a simple monthly plan and let a professional crew handle your lawn.", image: campaign.heroImage },
  { id: "purpose", title: "Lawn care with purpose", text: "Same crew, photos after every visit and one flat monthly price. No per-visit surprises." },
  { id: "match", title: "Let's find your plan", text: "A few quick questions so we recommend what your lawn actually needs, not what you think it needs." },
]

const questions: GuideQuestion[] = [
  {
    id: "goal",
    kind: "options",
    title: "What is your lawn mostly for?",
    subtitle: "Pick the one that matters most.",
    options: [
      { id: "family", label: "Kids and pets playing", hint: "It gets used every day" },
      { id: "show", label: "Looking good for guests", hint: "Neighbours, visitors, pride" },
      { id: "sell", label: "Selling or renting", hint: "Curb appeal is the goal" },
      { id: "tidy", label: "Just keeping it under control", hint: "No fuss, no overgrowth" },
    ],
    why: "A lawn that is played on wears faster and hides ticks and weeds. A lawn on show needs sharp edges. We care about the job it has to do, not just its length.",
    edge: { title: "We plan around your goal", text: "Most gardeners quote the same cut for everyone. Evergro builds the plan around how you use your yard." },
  },
  {
    id: "growth",
    kind: "options",
    title: "Two weeks after a cut, how does it look?",
    subtitle: "Think about the last time it was mowed.",
    options: [
      { id: "slow", label: "Barely changed", hint: "Slow growth" },
      { id: "medium", label: "Noticeably longer", hint: "Needs another cut soon" },
      { id: "fast", label: "Shaggy again", hint: "Grows fast" },
    ],
    why: "Grass should never lose more than a third of its height in one cut. Fast growers cut fortnightly get scalped and turn yellow. Weekly little cuts keep it thick and green.",
    edge: { title: "Right cut, right rhythm", text: "A one-off gardener cuts when you call. We keep a set schedule, so the lawn is never allowed to get away from you." },
  },
  {
    id: "weeds",
    kind: "options",
    title: "How many weeds and bare patches?",
    subtitle: "Look along pavements, walls and paving cracks.",
    options: [
      { id: "few", label: "Hardly any" },
      { id: "some", label: "Some along the edges" },
      { id: "lots", label: "Lots, and patchy grass" },
    ],
    why: "Weeds steal water and food from your grass. Mowing alone spreads their seeds, so a lawn with weeds needs weed control, not just more cutting.",
    edge: { title: "Fixed at the source", text: "Cut-only services leave weeds to multiply. Our weed control is built into the plan, not an upsell on the day." },
  },
  {
    id: "beds",
    kind: "options",
    title: "What about beds and shrubs?",
    subtitle: "Anything that needs trimming or turning.",
    options: [
      { id: "none", label: "None, just grass" },
      { id: "few", label: "A few shrubs or a bed" },
      { id: "many", label: "Plenty of garden" },
    ],
    why: "A neat lawn next to overgrown beds still looks neglected. Doing both on the same visit saves you a second callout and a second bill.",
    edge: { title: "One crew, one visit", text: "No juggling a mower guy and a garden guy. Our insured crew handles it all in one trip." },
  },
  {
    id: "areas",
    kind: "areas",
    title: "Where is the grass?",
    subtitle: "Tap the areas you want us to look after.",
    options: [],
    why: "The size of the area we cut is what drives the price. We would rather you only pay for grass that matters to you.",
    edge: { title: "Pay for what you use", text: "Start small and add the back garden later. You are never locked in to a bigger plan than you need." },
  },
  {
    id: "today",
    kind: "options",
    title: "Who looks after it today?",
    subtitle: "Be honest, no judgement.",
    options: [
      { id: "me", label: "I do it myself", hint: "Weekends disappear" },
      { id: "person", label: "A gardener, but unreliable" },
      { id: "nobody", label: "Nobody, it is overdue" },
    ],
    why: "Most people tell us the biggest cost of DIY is time, and the biggest cost of an informal gardener is never knowing if they will show up.",
    edge: { title: "Reliable, insured and on record", text: "Every visit is scheduled, photographed and sent to you on WhatsApp. If we miss one, we reschedule it at no cost." },
  },
]

const cadenceOf = (c: "weekly" | "fortnightly") => (c === "weekly" ? 4 : 2)
const FERTILISER_MONTHLY = 180

const ladder = [
  { id: "keep", name: "Keep Tidy", tagline: "Lean and dependable", cadence: "fortnightly" as const, bundleId: "lawn", fertiliser: false },
  { id: "fresh", name: "Fresh & Weed-free", tagline: "Cut plus weed control", cadence: "fortnightly" as const, bundleId: "lawn-weeds", fertiliser: false },
  { id: "thrive", name: "Weekly Thrive", tagline: "Weekly cuts, no weeds", cadence: "weekly" as const, bundleId: "lawn-weeds", fertiliser: false },
  { id: "full", name: "Full Garden", tagline: "Weekly cuts plus beds and shrubs", cadence: "weekly" as const, bundleId: "full", fertiliser: false },
  { id: "showcase", name: "Showcase", tagline: "Everything, plus fertiliser", cadence: "weekly" as const, bundleId: "full", fertiliser: true },
]

export const getGuideQuestions = () => wait(questions)
export const getIntroSlides = () => wait(introSlides)

export function recommendPlans(answers: Record<string, string>, tierId: TierId): Promise<PlanRecommendation> {
  const weekly = answers.growth !== "slow" || answers.goal === "family"
  let score = weekly ? 2 : 0
  if (answers.weeds && answers.weeds !== "few") score += 1
  if (answers.beds === "many" || (answers.beds === "few" && answers.weeds === "lots")) score += 1
  if (answers.goal === "sell" || answers.goal === "show") score += 1
  const rung = Math.max(0, Math.min(ladder.length - 1, score))

  const start = Math.max(0, Math.min(ladder.length - 3, rung - 1))
  const offers: PlanOffer[] = ladder.slice(start, start + 3).map((item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId)!
    const cuts = cadenceOf(item.cadence)
    const cutsTotal = bundle.prices[tierId] * cuts
    const monthly = cutsTotal + (item.fertiliser ? FERTILISER_MONTHLY : 0)
    // One of four weekly cuts free = 25% off the first month's cutting.
    const saving = Math.round(cutsTotal * (campaign.discountPercent / 100))
    return {
      id: item.id,
      name: item.name,
      tagline: item.tagline,
      cadence: item.cadence,
      cutsPerMonth: cuts,
      bundleId: item.bundleId,
      includes: [...bundle.includes, ...(item.fertiliser ? ["Seasonal fertiliser"] : [])],
      fertiliser: item.fertiliser,
      monthly,
      firstMonth: monthly - saving,
      saving,
    }
  })

  const reasons: string[] = []
  if (weekly) reasons.push(answers.growth === "fast" ? "Your lawn grows fast, so weekly cuts stop it getting scalped." : "A weekly rhythm keeps a well-used lawn thick and green.")
  else reasons.push("Your lawn grows slowly, so fortnightly cuts keep it neat without overpaying.")
  if (answers.weeds && answers.weeds !== "few") reasons.push("Weed control is included, because cutting alone spreads weeds.")
  if (rung >= 3) reasons.push("Beds and shrubs are trimmed on the same visit, so you only book one crew.")
  if (answers.goal === "sell") reasons.push("Sharp edges and tidy beds give you the curb appeal buyers notice.")
  if (answers.goal === "family") reasons.push("Regular cuts keep the grass short enough for kids and pets to play safely.")
  if (answers.today === "person") reasons.push("A scheduled, insured crew replaces never knowing if your gardener will show.")
  if (answers.today === "me") reasons.push("You get your weekends back.")

  return Promise.resolve({ offers, recommendedId: ladder[rung].id, reasons: reasons.slice(0, 4) })
}

const memberPromos: MemberPromo[] = [
  {
    id: "fertiliser-50",
    badge: "Member offer",
    title: "50% off fertilisation",
    text: "Feed your lawn this season at half price. We add it to your next visit, no extra trip needed.",
    cta: "Add to my next visit",
    confirmation: "Fertilisation added at 50% off",
  },
  {
    id: "free-cut",
    badge: "Free cut",
    title: "One weekly cut on us",
    text: "Add a second property and one of its first four weekly cuts is free, 25% off your first month there.",
    cta: "Add a property",
    confirmation: "We will call you to set up your second property",
  },
]

export const getMemberPromos = () => wait(memberPromos)
