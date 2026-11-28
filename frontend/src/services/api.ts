// The one place views import data functions from. Screens that are not migrated yet are still served by the mocks.
// When a screen gets its composable in src/data (specs 005 to 013), stop exporting its mock function from here.
export * from "./mockApi";
export * from "./promoApi";
