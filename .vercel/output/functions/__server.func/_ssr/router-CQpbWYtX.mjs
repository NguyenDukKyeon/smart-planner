import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as setupPwaInstallPrompt, t as registerPwaServiceWorker } from "./pwa-client-Bx7kHwFb.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { c as HeadContent, d as Outlet, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$5 } from "./routes-CjcHUfGf.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CQpbWYtX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var styles_default = "/assets/styles-BmcBqO8U.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var _jsxFileName = "/app/applet/src/routes/__root.tsx";
/** Presentational so the copy and semantics can be verified without a router error trigger. */
function RootNotFoundState() {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		"aria-labelledby": "not-found-title",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 24,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					id: "not-found-title",
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Không tìm thấy trang"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 25,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Đường dẫn này không tồn tại hoặc đã được chuyển. Bạn có thể quay lại không gian học tập."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 28,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Về trang hôm nay"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 32,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 31,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 23,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 19,
		columnNumber: 5
	}, this);
}
function RootErrorState({ onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		role: "alert",
		"aria-labelledby": "root-error-title",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					id: "root-error-title",
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Không thể tải trang này"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 52,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Hãy thử tải lại nội dung hoặc quay về trang hôm nay. Dữ liệu đã lưu của bạn không bị xóa."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 55,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onRetry,
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Thử lại"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 59,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Về trang hôm nay"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 65,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 58,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 51,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 46,
		columnNumber: 5
	}, this);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RootNotFoundState, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 78,
		columnNumber: 10
	}, this);
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	if (typeof window !== "undefined") try {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	} catch {}
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RootErrorState, { onRetry: () => {
		if (typeof window !== "undefined") window.location.reload();
		else reset();
	} }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 92,
		columnNumber: 5
	}, this);
}
var Route$4 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Không gian học tập cá nhân" },
			{
				name: "description",
				content: "Lập kế hoạch học tập, theo dõi phiên tập trung và duy trì thói quen theo nhịp độ của bạn."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Không gian học tập cá nhân"
			},
			{
				property: "og:description",
				content: "Lập kế hoạch học tập, theo dõi phiên tập trung và thói quen hằng ngày."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#e0f2fe"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Study Planner"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/icons/apple-touch-icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("html", {
		lang: "vi",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("head", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HeadContent, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 155,
			columnNumber: 9
		}, this) }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 154,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Scripts, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 159,
			columnNumber: 9
		}, this)] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 157,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 153,
		columnNumber: 5
	}, this);
}
function RootComponent() {
	const { queryClient } = Route$4.useRouteContext();
	(0, import_react.useEffect)(() => {
		registerPwaServiceWorker();
		return setupPwaInstallPrompt();
	}, []);
	(0, import_react.useEffect)(() => {
		const applyAppearance = () => {
			try {
				const parsed = JSON.parse(localStorage.getItem("hocvien-appearance-preferences-v1") || "{}");
				document.documentElement.dataset.smartAnimations = parsed.animations === false ? "off" : "on";
			} catch {
				document.documentElement.dataset.smartAnimations = "on";
			}
		};
		applyAppearance();
		window.addEventListener("storage", applyAppearance);
		window.addEventListener("hocvien:appearance-updated", applyAppearance);
		return () => {
			window.removeEventListener("storage", applyAppearance);
			window.removeEventListener("hocvien:appearance-updated", applyAppearance);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 194,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Toaster, {
			richColors: true,
			position: "top-center"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 195,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 192,
		columnNumber: 5
	}, this);
}
function isPushSubscriptionJson(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return typeof candidate.endpoint === "string" && candidate.endpoint.startsWith("https://") && !!candidate.keys && typeof candidate.keys.p256dh === "string" && typeof candidate.keys.auth === "string";
}
function isWebPushPayload(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return typeof candidate.title === "string" && candidate.title.trim().length > 0 && candidate.title.length <= 120 && typeof candidate.body === "string" && candidate.body.length <= 500;
}
function sanitizeScheduledJobs(value) {
	if (!Array.isArray(value)) return [];
	const now = Date.now();
	const max = now + 26784e5;
	return value.filter((job) => {
		if (!job || typeof job !== "object") return false;
		const candidate = job;
		const sendAt = typeof candidate.sendAt === "string" ? Date.parse(candidate.sendAt) : NaN;
		return typeof candidate.id === "string" && candidate.id.length > 0 && candidate.id.length <= 120 && Number.isFinite(sendAt) && sendAt > now + 15e3 && sendAt <= max && isWebPushPayload(candidate.payload);
	}).slice(0, 100);
}
var webPushModulePromise = null;
async function loadWebPush() {
	if (!webPushModulePromise) webPushModulePromise = import("../_libs/web-push.mjs").then((n) => /* @__PURE__ */ __toESM(n.t())).then((loaded) => {
		const candidate = loaded.default ?? loaded;
		if (typeof candidate.setVapidDetails !== "function" || typeof candidate.sendNotification !== "function") throw new Error("Gói web-push không cung cấp API mong đợi.");
		return candidate;
	});
	return webPushModulePromise;
}
function getWebPushEnvironment() {
	const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
	const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
	const subject = process.env.VAPID_SUBJECT?.trim();
	if (!publicKey || !privateKey || !subject) return null;
	if (!subject.startsWith("mailto:") && !subject.startsWith("https://")) return null;
	return {
		publicKey,
		privateKey,
		subject
	};
}
function getPublicPushConfiguration() {
	const environment = getWebPushEnvironment();
	return {
		configured: Boolean(environment),
		publicKey: environment?.publicKey ?? null,
		schedulerConfigured: Boolean(process.env.QSTASH_TOKEN?.trim() && process.env.PUSH_DELIVERY_SECRET?.trim())
	};
}
async function sendWebPush(subscription, payload) {
	if (!isPushSubscriptionJson(subscription)) throw new Error("Push subscription không hợp lệ.");
	if (!isWebPushPayload(payload)) throw new Error("Nội dung thông báo không hợp lệ.");
	const environment = getWebPushEnvironment();
	if (!environment) throw new Error("Máy chủ chưa được cấu hình VAPID keys.");
	const webpush = await loadWebPush();
	webpush.setVapidDetails(environment.subject, environment.publicKey, environment.privateKey);
	await webpush.sendNotification(subscription, JSON.stringify(payload), {
		TTL: payload.urgent ? 3600 : 21600,
		urgency: payload.urgent ? "high" : "normal",
		topic: payload.tag?.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 32)
	});
}
var Route$3 = createFileRoute("/api/push/config")({ server: { handlers: { GET: async () => Response.json(getPublicPushConfiguration(), { headers: { "cache-control": "no-store" } }) } } });
function isAuthorized(request) {
	const expected = process.env.PUSH_DELIVERY_SECRET?.trim();
	if (!expected) return false;
	return request.headers.get("authorization") === `Bearer ${expected}`;
}
var Route$2 = createFileRoute("/api/push/deliver")({ server: { handlers: { POST: async ({ request }) => {
	if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
	try {
		const body = await request.json();
		if (!isPushSubscriptionJson(body.subscription) || !isWebPushPayload(body.payload)) return new Response("Invalid push payload", { status: 400 });
		await sendWebPush(body.subscription, body.payload);
		return Response.json({ ok: true });
	} catch (error) {
		const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 500;
		if (statusCode === 404 || statusCode === 410) return Response.json({ expired: true }, { status: 200 });
		return Response.json({ error: error instanceof Error ? error.message : "Push delivery failed" }, { status: 500 });
	}
} } } });
var DEFAULT_QSTASH_URL = "https://qstash.upstash.io";
function qstashConfig() {
	const token = process.env.QSTASH_TOKEN?.trim();
	if (!token) return null;
	return {
		token,
		baseUrl: (process.env.QSTASH_URL?.trim() || DEFAULT_QSTASH_URL).replace(/\/$/, "")
	};
}
function safeDestinationOrigin(request) {
	const requestUrl = new URL(request.url);
	if (requestUrl.protocol !== "https:" && requestUrl.hostname !== "localhost") throw new Error("Web Push scheduler yêu cầu HTTPS.");
	return requestUrl.origin;
}
async function cancelQstashMessages(messageIds) {
	const config = qstashConfig();
	if (!config || messageIds.length === 0) return 0;
	const validIds = messageIds.filter((messageId) => /^[A-Za-z0-9_-]+$/.test(messageId)).slice(0, 100);
	if (validIds.length === 0) return 0;
	const url = new URL(`${config.baseUrl}/v2/messages`);
	for (const messageId of validIds) url.searchParams.append("messageIds", messageId);
	url.searchParams.set("count", String(validIds.length));
	const response = await fetch(url, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${config.token}` }
	});
	if (!response.ok) {
		const details = await response.text();
		throw new Error(`QStash không thể hủy lịch cũ: ${response.status} ${details}`);
	}
	const result = await response.json();
	return typeof result.cancelled === "number" ? result.cancelled : 0;
}
async function scheduleQstashPushes(args) {
	const config = qstashConfig();
	if (!config || args.jobs.length === 0) return [];
	const deliverySecret = process.env.PUSH_DELIVERY_SECRET?.trim();
	if (!deliverySecret) throw new Error("Thiếu PUSH_DELIVERY_SECRET cho điểm nhận QStash.");
	const destination = `${safeDestinationOrigin(args.request)}/api/push/deliver`;
	const batch = args.jobs.map((job) => ({
		destination,
		body: JSON.stringify({
			subscription: args.subscription,
			payload: job.payload
		}),
		headers: {
			"Content-Type": "application/json",
			"Upstash-Not-Before": String(Math.floor(Date.parse(job.sendAt) / 1e3)),
			"Upstash-Retries": "3",
			"Upstash-Forward-Authorization": `Bearer ${deliverySecret}`,
			"Upstash-Redact-Fields": "body, header[Authorization]",
			"Upstash-Label": `study_push_${job.id.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 40)}`
		}
	}));
	const response = await fetch(`${config.baseUrl}/v2/batch`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${config.token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(batch)
	});
	if (!response.ok) {
		const details = await response.text();
		throw new Error(`QStash không thể lên lịch thông báo: ${response.status} ${details}`);
	}
	const data = await response.json();
	if (!Array.isArray(data) || data.length !== args.jobs.length) throw new Error("QStash trả về số lượng message không khớp với lịch đã gửi.");
	return data.map((item, index) => {
		if (!item.messageId) throw new Error("QStash không trả về messageId.");
		const job = args.jobs[index];
		return {
			jobId: job.id,
			messageId: item.messageId,
			sendAt: job.sendAt
		};
	});
}
function isQstashConfigured() {
	return Boolean(qstashConfig());
}
var buckets = /* @__PURE__ */ new Map();
function clientKey(request) {
	return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
}
function requestIsSameOrigin(request) {
	const requestOrigin = new URL(request.url).origin;
	const origin = request.headers.get("origin");
	if (origin && origin !== requestOrigin) return false;
	const fetchSite = request.headers.get("sec-fetch-site");
	return !fetchSite || fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";
}
function guardPushMutation(request, options) {
	if (!requestIsSameOrigin(request)) return new Response("Forbidden", { status: 403 });
	const now = Date.now();
	const windowMs = options.windowMs ?? 6e4;
	const key = `${options.scope}:${clientKey(request)}`;
	const current = buckets.get(key);
	if (!current || current.resetAt <= now) buckets.set(key, {
		count: 1,
		resetAt: now + windowMs
	});
	else if (current.count >= options.limit) return Response.json({ error: "Bạn thao tác quá nhanh. Hãy chờ một phút rồi thử lại." }, {
		status: 429,
		headers: { "retry-after": String(Math.ceil((current.resetAt - now) / 1e3)) }
	});
	else current.count += 1;
	if (buckets.size > 1e3) {
		for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
	}
	return null;
}
var Route$1 = createFileRoute("/api/push/schedule")({ server: { handlers: {
	POST: async ({ request }) => {
		const blocked = guardPushMutation(request, {
			scope: "push-schedule",
			limit: 12
		});
		if (blocked) return blocked;
		try {
			const body = await request.json();
			if (!isPushSubscriptionJson(body.subscription)) return Response.json({ error: "Push subscription không hợp lệ." }, { status: 400 });
			const jobs = sanitizeScheduledJobs(body.jobs);
			const cancelled = await cancelQstashMessages(Array.isArray(body.previousMessageIds) ? body.previousMessageIds.filter((id) => typeof id === "string").slice(0, 100) : []);
			const response = {
				scheduled: await scheduleQstashPushes({
					request,
					subscription: body.subscription,
					jobs
				}),
				cancelled,
				schedulerConfigured: isQstashConfigured()
			};
			return Response.json(response);
		} catch (error) {
			return Response.json({ error: error instanceof Error ? error.message : "Không thể lên lịch Web Push." }, { status: 500 });
		}
	},
	DELETE: async ({ request }) => {
		const blocked = guardPushMutation(request, {
			scope: "push-cancel",
			limit: 20
		});
		if (blocked) return blocked;
		const body = await request.json().catch(() => ({}));
		const cancelled = await cancelQstashMessages(Array.isArray(body.messageIds) ? body.messageIds.filter((id) => typeof id === "string").slice(0, 100) : []);
		return Response.json({ cancelled });
	}
} } });
var Route = createFileRoute("/api/push/test")({ server: { handlers: { POST: async ({ request }) => {
	const blocked = guardPushMutation(request, {
		scope: "push-test",
		limit: 5
	});
	if (blocked) return blocked;
	try {
		const body = await request.json();
		if (!isPushSubscriptionJson(body.subscription) || !isWebPushPayload(body.payload)) return Response.json({ error: "Dữ liệu Web Push không hợp lệ." }, { status: 400 });
		await sendWebPush(body.subscription, body.payload);
		return Response.json({ ok: true });
	} catch (error) {
		const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 500;
		const expired = statusCode === 404 || statusCode === 410;
		return Response.json({
			error: expired ? "Đăng ký thông báo đã hết hạn. Hãy tắt rồi bật lại Web Push." : error instanceof Error ? error.message : "Không thể gửi thông báo thử.",
			expired
		}, { status: expired ? 410 : 500 });
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	ApiPushConfigRoute: Route$3.update({
		id: "/api/push/config",
		path: "/api/push/config",
		getParentRoute: () => Route$4
	}),
	ApiPushDeliverRoute: Route$2.update({
		id: "/api/push/deliver",
		path: "/api/push/deliver",
		getParentRoute: () => Route$4
	}),
	ApiPushScheduleRoute: Route$1.update({
		id: "/api/push/schedule",
		path: "/api/push/schedule",
		getParentRoute: () => Route$4
	}),
	ApiPushTestRoute: Route.update({
		id: "/api/push/test",
		path: "/api/push/test",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
