export const config = {
  useMockApi: import.meta.env.VITE_USE_MOCK_API === "true",
  apiPath: "portal.api.portal",
  promoApiPath: "portal.api.promo",
} as const;
