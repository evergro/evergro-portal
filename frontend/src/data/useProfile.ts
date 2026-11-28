import { createResource } from "frappe-ui";
import { config } from "@/config/env";
import { getCustomer } from "@/services/api";
import type { Customer } from "@/types";

export function useProfile() {
  return createResource<Customer>({
    url: `${config.apiPath}.get_profile`,
    method: "GET",
    cache: ["portal", "profile"],
    auto: true,
    // One flag, VITE_USE_MOCK_API, switches the whole app to the mocks
    ...(config.useMockApi ? { resourceFetcher: getCustomer } : {}),
  });
}
