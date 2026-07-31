import { d as todayISO } from "./date-utils-CFRHucsE.mjs";
import { A as findLessonPosition, T as buildFlexiblePlan, k as findLessonById } from "./planner-2Pf6y40b.mjs";
import { t as registerPwaServiceWorker } from "./pwa-client-Bx7kHwFb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/web-push-schedule-CcQxeb5P.js
var SCHEDULE_IDS_KEY = "smart-study-web-push-qstash-message-ids-v1";
function urlBase64ToUint8Array(base64String) {
	const base64 = (base64String + "=".repeat((4 - base64String.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const output = new Uint8Array(new ArrayBuffer(rawData.length));
	for (let index = 0; index < rawData.length; index += 1) output[index] = rawData.charCodeAt(index);
	return output;
}
function toSubscriptionJson(subscription) {
	const json = subscription.toJSON();
	if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("Trình duyệt không trả về đầy đủ khóa Web Push.");
	return {
		endpoint: json.endpoint,
		expirationTime: json.expirationTime,
		keys: {
			p256dh: json.keys.p256dh,
			auth: json.keys.auth
		}
	};
}
function getStoredMessageIds() {
	if (typeof window === "undefined") return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(SCHEDULE_IDS_KEY) || "[]");
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
	} catch {
		return [];
	}
}
function saveMessageIds(ids) {
	if (typeof window === "undefined") return;
	localStorage.setItem(SCHEDULE_IDS_KEY, JSON.stringify(ids.slice(0, 100)));
}
async function fetchConfig() {
	const response = await fetch("/api/push/config", { headers: { accept: "application/json" } });
	if (!response.ok) throw new Error("Không thể đọc cấu hình Web Push từ máy chủ.");
	return await response.json();
}
async function getWebPushCapability() {
	const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
	const config = await fetchConfig().catch(() => ({
		configured: false,
		schedulerConfigured: false,
		publicKey: null
	}));
	if (!supported) return {
		supported: false,
		secureContext: typeof window !== "undefined" && window.isSecureContext,
		configured: config.configured,
		schedulerConfigured: config.schedulerConfigured,
		publicKey: config.publicKey,
		permission: "unsupported",
		subscribed: false
	};
	const subscription = await (await registerPwaServiceWorker())?.pushManager.getSubscription();
	return {
		supported: true,
		secureContext: window.isSecureContext,
		configured: config.configured,
		schedulerConfigured: config.schedulerConfigured,
		publicKey: config.publicKey,
		permission: Notification.permission,
		subscribed: Boolean(subscription)
	};
}
async function subscribeToWebPush() {
	const config = await fetchConfig();
	if (!config.configured || !config.publicKey) throw new Error("Máy chủ chưa có VAPID keys. Hãy cấu hình biến môi trường trước.");
	if (!window.isSecureContext) throw new Error("Web Push chỉ hoạt động trên HTTPS hoặc localhost.");
	const registration = await registerPwaServiceWorker();
	if (!registration) throw new Error("Không thể đăng ký service worker.");
	const existing = await registration.pushManager.getSubscription();
	if (existing) return existing;
	const permission = await Notification.requestPermission();
	if (permission !== "granted") throw new Error(permission === "denied" ? "Trình duyệt đang chặn thông báo. Hãy cho phép trong cài đặt trang web." : "Bạn chưa cấp quyền thông báo.");
	return registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(config.publicKey)
	});
}
async function getCurrentPushSubscription() {
	return (await registerPwaServiceWorker())?.pushManager.getSubscription() ?? null;
}
async function sendWebPushTest(payload) {
	const subscription = await getCurrentPushSubscription();
	if (!subscription) throw new Error("Thiết bị này chưa đăng ký Web Push.");
	const response = await fetch("/api/push/test", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			subscription: toSubscriptionJson(subscription),
			payload
		})
	});
	const result = await response.json().catch(() => ({}));
	if (!response.ok) {
		if (result.expired) await subscription.unsubscribe().catch(() => false);
		throw new Error(result.error || "Không thể gửi thông báo thử.");
	}
}
async function syncScheduledWebPush(jobs) {
	const subscription = await getCurrentPushSubscription();
	if (!subscription) throw new Error("Thiết bị này chưa đăng ký Web Push.");
	const response = await fetch("/api/push/schedule", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			subscription: toSubscriptionJson(subscription),
			jobs,
			previousMessageIds: getStoredMessageIds()
		})
	});
	const result = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(result.error || "Không thể đồng bộ lịch Web Push.");
	saveMessageIds(result.scheduled.map((item) => item.messageId));
	return result;
}
async function unsubscribeFromWebPush() {
	const messageIds = getStoredMessageIds();
	if (messageIds.length > 0) await fetch("/api/push/schedule", {
		method: "DELETE",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ messageIds })
	}).catch(() => void 0);
	saveMessageIds([]);
	const subscription = await getCurrentPushSubscription();
	if (subscription) await subscription.unsubscribe();
}
function localDateTimeISO(dateISO, hhmm) {
	if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
	const date = /* @__PURE__ */ new Date(`${dateISO}T${hhmm}:00`);
	return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function addJob(jobs, id, sendAt, payload) {
	if (!sendAt || Date.parse(sendAt) <= Date.now() + 6e4) return;
	jobs.push({
		id,
		sendAt,
		payload
	});
}
function buildScheduledWebPushJobs(args) {
	const { state, subjects, preferences } = args;
	if (!preferences.enabled) return [];
	const horizonDays = Math.min(14, Math.max(1, args.horizonDays ?? 7));
	const start = todayISO();
	const days = buildFlexiblePlan({
		subjects,
		completed: state.completedLessons,
		meta: state.studyMeta,
		settings: state.plannerSettings,
		fromISO: start,
		horizonDays
	});
	const jobs = [];
	for (const day of days) {
		const lesson = day.queue.newLessons[0] ?? (day.queue.reviewLessons[0] ? findLessonById(day.queue.reviewLessons[0].lessonId, subjects) : void 0);
		if (lesson && preferences.morningEnabled) {
			const position = findLessonPosition(subjects, lesson.id);
			addJob(jobs, `morning-${day.dateISO}-${lesson.id}`, localDateTimeISO(day.dateISO, preferences.morningTime), {
				title: "Bài học trong kế hoạch hôm nay",
				body: `${position?.subject.name ?? lesson.sourceSubject}: ${lesson.title} · khoảng ${lesson.plannedDurationMinutes} phút.`,
				tag: `study-${day.dateISO}`,
				lessonId: lesson.id,
				url: `/?view=today&focusLesson=${encodeURIComponent(lesson.id)}`
			});
		}
		if (lesson && preferences.eveningEnabled) {
			const position = findLessonPosition(subjects, lesson.id);
			addJob(jobs, `evening-${day.dateISO}-${lesson.id}`, localDateTimeISO(day.dateISO, preferences.eveningTime), {
				title: "Đến giờ bắt đầu học",
				body: `${position?.subject.name ?? lesson.sourceSubject}: ${lesson.title} · bắt đầu bằng một phiên ngắn nếu cần.`,
				tag: `evening-${day.dateISO}`,
				lessonId: lesson.id,
				url: `/?view=today&focusLesson=${encodeURIComponent(lesson.id)}`
			});
		}
		if (preferences.enableStreakGuard) addJob(jobs, `streak-${day.dateISO}`, localDateTimeISO(day.dateISO, preferences.endOfDayTime), {
			title: "Kiểm tra tiến độ học hôm nay",
			body: "Mở kế hoạch để xem bài còn lại và duy trì nhịp học đều đặn.",
			tag: `streak-${day.dateISO}`,
			url: "/?view=today",
			urgent: true
		});
		for (const habit of state.habitDefinitions) {
			if (habit.archived) continue;
			const reminder = state.reminders[habit.id];
			if (!reminder?.enabled) continue;
			const mondayIndex = ((/* @__PURE__ */ new Date(`${day.dateISO}T12:00:00`)).getDay() + 6) % 7;
			const target = habit.dailyTargets[mondayIndex] ?? habit.target;
			if (target <= 0) continue;
			addJob(jobs, `habit-${day.dateISO}-${habit.id}`, localDateTimeISO(day.dateISO, reminder.time), {
				title: `Nhắc thói quen: ${habit.name}`,
				body: habit.kind === "counter" ? `Mục tiêu hôm nay: ${target}.` : "Đánh dấu khi bạn hoàn thành.",
				tag: `habit-${habit.id}-${day.dateISO}`,
				url: "/?view=today#habits"
			});
		}
	}
	return jobs.sort((a, b) => a.sendAt.localeCompare(b.sendAt)).slice(0, 100);
}
//#endregion
export { syncScheduledWebPush as a, subscribeToWebPush as i, getWebPushCapability as n, unsubscribeFromWebPush as o, sendWebPushTest as r, buildScheduledWebPushJobs as t };
