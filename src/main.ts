import { mount } from "svelte";
import App from "./App.svelte";

// Register Service Worker for PWA offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });
  });
}

const app = mount(App, {
  target: document.getElementById("root")!,
});

export default app;
