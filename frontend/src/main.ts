import { createApp } from "vue";
import { frappeRequest, setConfig } from "frappe-ui";
import App from "./App.vue";
import router from "./router";
import { loadDevelopmentBoot } from "@/config/boot";
import { goToLogin } from "@/config/session";
import "./index.css";

setConfig("resourceFetcher", frappeRequest);
setConfig("fallbackErrorHandler", (error: any) => {
  if ([401, 403].includes(error?.response?.status)) goToLogin();
});

// Mount after the first route resolves, so a promo page never renders the portal header (and its profile call) for a moment.
const app = createApp(App).use(router);
loadDevelopmentBoot()
  .then(() => router.isReady())
  .then(() => app.mount("#root"));
