import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AsyncState from "./AsyncState.vue";

function render(resource: Partial<{ data: unknown; loading: boolean; error: unknown; reload: () => void }>) {
  return mount(AsyncState, {
    props: { resource: { data: null, loading: false, error: null, reload: vi.fn(), ...resource } },
    slots: { default: "<p>Content</p>" },
  });
}

describe("AsyncState", () => {
  it("shows loading while there is no data yet", () => {
    expect(render({ loading: true }).text()).toContain("Loading");
  });

  it("shows the content when there is data", () => {
    expect(render({ data: { name: "Eve" } }).text()).toContain("Content");
  });

  it("shows the empty text for an empty list", () => {
    expect(render({ data: [] }).text()).toContain("Nothing here yet.");
  });

  it("shows the error and the retry button calls reload", async () => {
    const reload = vi.fn();
    const wrapper = render({ error: new Error("boom"), reload });
    expect(wrapper.text()).toContain("Something went wrong");
    await wrapper.find("button").trigger("click");
    expect(reload).toHaveBeenCalledOnce();
  });
});
