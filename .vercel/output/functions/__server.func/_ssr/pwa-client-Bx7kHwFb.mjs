import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pwa-client-Bx7kHwFb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var deferredInstallPrompt = null;
var listeners = /* @__PURE__ */ new Set();
function emit() {
	listeners.forEach((listener) => listener());
}
async function registerPwaServiceWorker() {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
	try {
		return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
	} catch (error) {
		console.error("Service worker registration failed", error);
		return null;
	}
}
function setupPwaInstallPrompt() {
	if (typeof window === "undefined") return () => {};
	const handleBeforeInstall = (event) => {
		event.preventDefault();
		deferredInstallPrompt = event;
		emit();
	};
	const handleInstalled = () => {
		deferredInstallPrompt = null;
		emit();
	};
	window.addEventListener("beforeinstallprompt", handleBeforeInstall);
	window.addEventListener("appinstalled", handleInstalled);
	return () => {
		window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
		window.removeEventListener("appinstalled", handleInstalled);
	};
}
function isStandalonePwa() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
function usePwaInstall() {
	const [, forceUpdate] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const listener = () => forceUpdate((value) => value + 1);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);
	const install = (0, import_react.useCallback)(async () => {
		if (!deferredInstallPrompt) return false;
		await deferredInstallPrompt.prompt();
		const choice = await deferredInstallPrompt.userChoice;
		deferredInstallPrompt = null;
		emit();
		return choice.outcome === "accepted";
	}, []);
	return {
		canInstall: Boolean(deferredInstallPrompt) && !isStandalonePwa(),
		installed: isStandalonePwa(),
		install
	};
}
//#endregion
export { setupPwaInstallPrompt as n, usePwaInstall as r, registerPwaServiceWorker as t };
