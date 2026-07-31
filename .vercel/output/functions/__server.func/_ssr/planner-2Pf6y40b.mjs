import { r as __toESM } from "../_runtime.mjs";
import { c as isSundayISO, d as todayISO, r as daysBetweenISO, t as addDaysISO } from "./date-utils-CFRHucsE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as X } from "../_libs/lucide-react.mjs";
import { s as Slot } from "../_libs/@radix-ui/react-collapsible+[...].mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planner-2Pf6y40b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var _jsxFileName$5 = "/app/applet/src/components/ui/dialog.tsx";
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 21,
	columnNumber: 3
}, void 0));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogOverlay, {}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 37,
	columnNumber: 5
}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogClose, {
		"aria-label": "Đóng hộp thoại",
		className: "absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$5,
			lineNumber: 51,
			columnNumber: 9
		}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "sr-only",
			children: "Đóng hộp thoại"
		}, void 0, false, {
			fileName: _jsxFileName$5,
			lineNumber: 52,
			columnNumber: 9
		}, void 0)]
	}, void 0, true, {
		fileName: _jsxFileName$5,
		lineNumber: 47,
		columnNumber: 7
	}, void 0)]
}, void 0, true, {
	fileName: _jsxFileName$5,
	lineNumber: 38,
	columnNumber: 5
}, void 0)] }, void 0, true, {
	fileName: _jsxFileName$5,
	lineNumber: 36,
	columnNumber: 3
}, void 0));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 60,
	columnNumber: 3
}, void 0);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 65,
	columnNumber: 3
}, void 0);
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 76,
	columnNumber: 3
}, void 0));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$5,
	lineNumber: 88,
	columnNumber: 3
}, void 0));
DialogDescription.displayName = DialogDescription$1.displayName;
var _jsxFileName$4 = "/app/applet/src/components/ui/tabs.tsx";
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$4,
	lineNumber: 12,
	columnNumber: 3
}, void 0));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$4,
	lineNumber: 27,
	columnNumber: 3
}, void 0));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$4,
	lineNumber: 42,
	columnNumber: 3
}, void 0));
TabsContent.displayName = Content.displayName;
var _jsxFileName$3 = "/app/applet/src/components/ui/label.tsx";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$3,
	lineNumber: 17,
	columnNumber: 3
}, void 0));
Label.displayName = Root.displayName;
var _jsxFileName$2 = "/app/applet/src/components/ui/slider.tsx";
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SliderRange, { className: "absolute h-full bg-primary" }, void 0, false, {
			fileName: _jsxFileName$2,
			lineNumber: 16,
			columnNumber: 7
		}, void 0)
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 15,
		columnNumber: 5
	}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" }, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 18,
		columnNumber: 5
	}, void 0)]
}, void 0, true, {
	fileName: _jsxFileName$2,
	lineNumber: 10,
	columnNumber: 3
}, void 0));
Slider.displayName = Slider$1.displayName;
var _jsxFileName$1 = "/app/applet/src/components/ui/button.tsx";
var buttonVariants = cva("inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-11 w-11 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 43,
		columnNumber: 7
	}, void 0);
});
Button.displayName = "Button";
var _jsxFileName = "/app/applet/src/components/ui/input.tsx";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
		type,
		className: cn("flex min-h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 8,
		columnNumber: 7
	}, void 0);
});
Input.displayName = "Input";
var PUSH_PREFERENCES_KEY = "hocvien_push_preferences_v1";
var DEFAULT_PUSH_PREFERENCES = {
	enabled: false,
	soundEnabled: false,
	volume: .6,
	morningEnabled: true,
	morningTime: "07:00",
	eveningEnabled: true,
	eveningTime: "19:30",
	endOfDayTime: "22:00",
	enableStreakGuard: false,
	snoozeMinutes: 10
};
var audioCtx = null;
function getAudioContext() {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
		if (AudioCtxClass) audioCtx = new AudioCtxClass();
	}
	if (audioCtx?.state === "suspended") audioCtx.resume();
	return audioCtx;
}
/** Chỉ phát âm thanh khi người dùng bấm xem trước trong giao diện. */
function playPushNotificationChime(urgent = false, volume = .6) {
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const now = ctx.currentTime;
		const boundedVolume = Math.min(1, Math.max(.1, volume));
		(urgent ? [
			{
				frequency: 880,
				offset: 0,
				duration: .15,
				gain: .35
			},
			{
				frequency: 1046.5,
				offset: .12,
				duration: .18,
				gain: .4
			},
			{
				frequency: 1318.5,
				offset: .25,
				duration: .35,
				gain: .45
			}
		] : [{
			frequency: 659.25,
			offset: 0,
			duration: .4,
			gain: .3
		}, {
			frequency: 880,
			offset: .15,
			duration: .8,
			gain: .35
		}]).forEach((note) => {
			const oscillator = ctx.createOscillator();
			const gain = ctx.createGain();
			oscillator.type = urgent ? "triangle" : "sine";
			oscillator.frequency.setValueAtTime(note.frequency, now + note.offset);
			gain.gain.setValueAtTime(.001, now + note.offset);
			gain.gain.linearRampToValueAtTime(note.gain * boundedVolume, now + note.offset + .02);
			gain.gain.exponentialRampToValueAtTime(.001, now + note.offset + note.duration);
			oscillator.connect(gain);
			gain.connect(ctx.destination);
			oscillator.start(now + note.offset);
			oscillator.stop(now + note.offset + note.duration);
		});
	} catch {}
}
function normalizePushPreferences(value) {
	const parsed = value && typeof value === "object" ? value : {};
	const isTime = (time) => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
	const volume = Number(parsed.volume);
	return {
		enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_PUSH_PREFERENCES.enabled,
		soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULT_PUSH_PREFERENCES.soundEnabled,
		volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_PUSH_PREFERENCES.volume,
		morningEnabled: typeof parsed.morningEnabled === "boolean" ? parsed.morningEnabled : DEFAULT_PUSH_PREFERENCES.morningEnabled,
		morningTime: isTime(parsed.morningTime) ? parsed.morningTime : DEFAULT_PUSH_PREFERENCES.morningTime,
		eveningEnabled: typeof parsed.eveningEnabled === "boolean" ? parsed.eveningEnabled : DEFAULT_PUSH_PREFERENCES.eveningEnabled,
		eveningTime: isTime(parsed.eveningTime) ? parsed.eveningTime : DEFAULT_PUSH_PREFERENCES.eveningTime,
		endOfDayTime: isTime(parsed.endOfDayTime) ? parsed.endOfDayTime : DEFAULT_PUSH_PREFERENCES.endOfDayTime,
		enableStreakGuard: typeof parsed.enableStreakGuard === "boolean" ? parsed.enableStreakGuard : DEFAULT_PUSH_PREFERENCES.enableStreakGuard,
		snoozeMinutes: typeof parsed.snoozeMinutes === "number" && Number.isFinite(parsed.snoozeMinutes) ? Math.max(0, Math.round(parsed.snoozeMinutes)) : DEFAULT_PUSH_PREFERENCES.snoozeMinutes
	};
}
function getPushPreferences() {
	if (typeof window === "undefined") return { ...DEFAULT_PUSH_PREFERENCES };
	try {
		const raw = localStorage.getItem(PUSH_PREFERENCES_KEY);
		if (!raw) return { ...DEFAULT_PUSH_PREFERENCES };
		return normalizePushPreferences(JSON.parse(raw));
	} catch {
		return { ...DEFAULT_PUSH_PREFERENCES };
	}
}
function savePushPreferences(prefs) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PUSH_PREFERENCES_KEY, JSON.stringify(normalizePushPreferences(prefs)));
	} catch {}
}
var grade11_roadmap_default = /*#__PURE__*/ JSON.parse("[{\"week\":0,\"date\":\"27/06/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":3,\"videos\":4,\"load\":3.94,\"mainSubjects\":\"Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày. T7 ưu tiên rà lỗi, bù bài, không mở thêm chuyên đề mới.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#1. Bài 0101 - Đại cương dao động điều hoà\",\"done\":true},{\"subject\":\"Hóa\",\"name\":\"KIẾN THỨC NỀN HÓA HỌC VÔ CƠ\",\"done\":true},{\"subject\":\"Hóa\",\"name\":\"TÍNH CHẤT HÓA HỌC HỢP CHẤT VÔ CƠ\",\"done\":true}]},{\"week\":0,\"date\":\"28/06/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":1,\"date\":\"29/06/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":13,\"load\":6.5,\"mainSubjects\":\"Toán Cơ Bản, Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X11_Cơ bản về lượng giác\",\"done\":true},{\"subject\":\"Lý\",\"name\":\"#2. Bài 0102 - Phương trình vận tốc\",\"done\":true},{\"subject\":\"Lý\",\"name\":\"#3. Bài 0103 - Phương trình gia tốc\",\"done\":true},{\"subject\":\"Hóa\",\"name\":\"CÔNG THỨC HÓA HỌC CẦN NHỚ\",\"done\":true}]},{\"week\":1,\"date\":\"30/06/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":7,\"load\":6,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Lý\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#4. Bài 0104 - Đại cương đồ thị hình Sin\",\"done\":true},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X12_Các công thức biến đổi lượng giác\",\"done\":true},{\"subject\":\"Hóa\",\"name\":\"TỔNG ÔN VÀ LẤY GỐC HÓA 10 (ĐỀ 1)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"TỔNG ÔN VÀ LẤY GỐC HÓA 10 (ĐỀ 2)\",\"done\":false}]},{\"week\":1,\"date\":\"01/07/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":3,\"videos\":4,\"load\":3.94,\"mainSubjects\":\"Hóa, Toán Cơ Bản\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"TỔNG ÔN VÀ LẤY GỐC HÓA 10 (ĐỀ 3)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"TỔNG ÔN VÀ LẤY GỐC HÓA 10 (ĐỀ 4)\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X13_Các hàm lượng giác cơ bản\",\"done\":false}]},{\"week\":1,\"date\":\"02/07/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":2,\"videos\":7,\"load\":2.88,\"mainSubjects\":\"Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#5. Bài 0105 - Mối quan hệ x - v - a\",\"done\":true},{\"subject\":\"Hóa\",\"name\":\"TỔNG ÔN VÀ LẤY GỐC HÓA 10 (ĐỀ 5)\",\"done\":false}]},{\"week\":1,\"date\":\"03/07/2026\",\"weekday\":\"T6\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":4,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Đã dời hết các bài trùng sang tuần 2, ngày này để trống/nghỉ.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":1,\"date\":\"04/07/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":3,\"videos\":3,\"load\":2.38,\"mainSubjects\":\"Buffer\",\"note\":\"T7 ưu tiên rà lỗi, bù bài, không mở thêm chuyên đề mới.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Buffer\",\"name\":\"Buffer / Bù nhẹ / Ôn lỗi\",\"done\":false},{\"subject\":\"Buffer\",\"name\":\"Buffer / Bù nhẹ / Ôn lỗi\",\"done\":false},{\"subject\":\"Buffer\",\"name\":\"Buffer / Bù nhẹ / Ôn lỗi\",\"done\":false}]},{\"week\":1,\"date\":\"05/07/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":2,\"date\":\"06/07/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":6,\"videos\":6,\"load\":7.25,\"mainSubjects\":\"Toán Cơ Bản, Lý, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Cần chú ý\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X14_Các phương trình lượng giác cơ bản\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#6. Bài 0106 - Đồ thị mối quan hệ x - v - a\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X15_Hàm số và PTLG dạng: asinx+bcosx\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X16_Phương pháp đặt ẩn phụ trong PTLG\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"A6 - Đề ôn tập Lượng giác - Đề số 01\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"A7 - Đề ôn tập Lượng giác - Đề số 02\",\"done\":false}]},{\"week\":2,\"date\":\"07/07/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":6,\"videos\":6,\"load\":8,\"mainSubjects\":\"Toán Cơ Bản, Hóa\",\"note\":\"Ngày nhiều Hóa: chỉ học phần trọng tâm, ưu tiên chữa lỗi, không mở thêm bài ngoài.\",\"warning\":\"Rất nặng\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X17_Một số mở rộng nâng cao PT BPT Lượng giác\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 1 - LÝ THUYẾT TRỌNG TÂM CÂN BẰNG HÓA HỌC\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 2 - SỰ CHUYỂN DỊCH CÂN BẰNG HÓA HỌC\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 3 - LÝ THUYẾT TRỌNG TÂM VỀ SỰ ĐIỆN LI\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 4 - PHƯƠNG PHÁP VIẾT PHƯƠNG TRÌNH ION\",\"done\":false}]},{\"week\":2,\"date\":\"08/07/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":6,\"videos\":7,\"load\":7.25,\"mainSubjects\":\"Toán Cơ Bản, Lý, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Cần chú ý\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X21_Cơ bản về dãy số\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#7. Bài 0107 - Kĩ thuật vòng tròn lượng giác\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X22_Cơ bản về cấp số cộng\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#8. Luyện tập 0107 - Kĩ thuật vòng tròn lượng giác\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"A8 - Lượng giác trong đề thi ĐGNL, ĐGTD\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"B4 - Ôn tập dãy số (P1)\",\"done\":false}]},{\"week\":2,\"date\":\"09/07/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":5,\"videos\":6,\"load\":7.08,\"mainSubjects\":\"Toán Cơ Bản, Hóa\",\"note\":\"Ngày nhiều Hóa: chỉ học phần trọng tâm, ưu tiên chữa lỗi, không mở thêm bài ngoài.\",\"warning\":\"Cần chú ý\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X23_Cơ bản về cấp số nhân\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 5 - THUYẾT ACID - BASE CỦA BRONSTED & LOWRY\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 6 - XÁC ĐỊNH PH CỦA DUNG DỊCH & CHẤT CHỈ THỊ\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 7 - PHẢN ỨNG TRAO ĐỔI ION TRONG DUNG DỊCH\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 8 - PHƯƠNG PHÁP CHUẨN ĐỘ ACID - BASE\",\"done\":false}]},{\"week\":2,\"date\":\"10/07/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":4.83,\"mainSubjects\":\"Toán Cơ Bản, Lý, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X24_Cơ bản về giới hạn của dãy số\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#9. Bài 0108 - Viết Phương trình dao động\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#10. Bài 0109 - Kĩ thuật đa trục\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"B5 - Ôn tập dãy số (P2)\",\"done\":false}]},{\"week\":2,\"date\":\"11/07/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":3,\"videos\":4,\"load\":4.25,\"mainSubjects\":\"Toán Cơ Bản, Lý\",\"note\":\"T7 ưu tiên rà lỗi, bù bài, không mở thêm chuyên đề mới.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X25_Giới hạn dãy số\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#11. Luyện tập 0109 - Kĩ thuật đa trục (Buổi 1)\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X26_Giới hạn hàm số nâng cao\",\"done\":false}]},{\"week\":2,\"date\":\"12/07/2026\",\"weekday\":\"CN\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":2,\"videos\":0,\"load\":2.63,\"mainSubjects\":\"Toán - ĐVĐ, Hóa\",\"note\":\"Dồn 2 bài cuối tuần (Toán - ĐVĐ, Hóa) từ các ngày trong tuần sang vì lịch bận (xem bóng đá), giữ đúng thứ tự bài học.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"B6 - Cấp số cộng, cấp số nhân trong đề ĐGNL, ĐGTD\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 9 - ĐỊNH LUẬT BẢO TOÀN ĐIỆN TÍCH\",\"done\":false}]},{\"week\":3,\"date\":\"13/07/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Toán Cơ Bản, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X27_Hàm số liên tục\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"C5 - Bài tập giới hạn, hàm số liên tục trong SGK, SBT\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"C6 - Ôn tập giới hạn, hàm số liên tục - Đề số 01\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"C7 - Ôn tập giới hạn, hàm số liên tục - Đề số 02\",\"done\":false}]},{\"week\":3,\"date\":\"14/07/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Toán - ĐVĐ, Lý\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"TC4 - Giới hạn chứa tham số - giới hạn hàm ẩn\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#12. Luyện tập 0109 - Kĩ thuật đa trục (Buổi 2)\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#13. Bài 0110 - Kĩ thuật đồ thị hình sin viết phương trình dao động\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#14. Bài 0111 - Con lắc lò xo\",\"done\":false}]},{\"week\":3,\"date\":\"15/07/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":4.5,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV01. Cơ bản về quy tắc đếm\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y30_Nâng cao dãy số 01\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#15. Luyện tập 0111 - Con lắc lò xo nằm ngang\",\"done\":false}]},{\"week\":3,\"date\":\"16/07/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Toán Cơ Bản, Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV02. Hoán vị\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#16. Luyện tập 0111 - Con lắc lò xo\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 22 - TỔNG ÔN TOÀN DIỆN CHUYÊN ĐỀ I\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 23 - THI THỬ ONLINE KẾT THÚC CHUYÊN ĐỀ I\",\"done\":false}]},{\"week\":3,\"date\":\"17/07/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":4.5,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV03. Chỉnh hợp và tổ hợp\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y31_Nâng cao dãy số 02\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#17. Bài 0112 - Năng lượng dao động\",\"done\":false}]},{\"week\":3,\"date\":\"18/07/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Hóa, Toán Cơ Bản\",\"note\":\"T7 ưu tiên rà lỗi, bù bài, không mở thêm chuyên đề mới.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 24 - LÝ THUYẾT TRỌNG TÂM NITROGEN\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 25 - LÝ THUYẾT TRỌNG TÂM AMMONIA VÀ MUỐI AMMONIUM\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV04. Khai triển Newton\",\"done\":false}]},{\"week\":3,\"date\":\"19/07/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":4,\"date\":\"20/07/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Lý, Hóa, Toán Cơ Bản\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#18. Bài 0113 - Các dạng đồ thị năng lượng\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 26 - LÝ THUYẾT TRỌNG CÁC OXIDE CỦA NITROGEN\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 27 - LÝ THUYẾT TRỌNG TÂM NITRIC ACID\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV05. Cơ bản về biến cố và xác suất\",\"done\":false}]},{\"week\":4,\"date\":\"21/07/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXV06. Các phép toán trên các biến cố\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y32_Nâng cao dãy số 03\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#19. Bài 0114 - Con lắc đơn\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 28 - LÝ THUYẾT TRỌNG TÂM MUỐI NITRATE\",\"done\":false}]},{\"week\":4,\"date\":\"22/07/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.5,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 29 - LÝ THUYẾT TRỌNG TÂM HIỆN TƯỢNG PHÚ DƯỠNG\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDMXY10. MSL GN và các số đo trung tâm\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"E3 - Đề ôn tập xác suất - Đề số 01\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"E4 - Đề ôn tập xác suất - Đề số 02\",\"done\":false}]},{\"week\":4,\"date\":\"23/07/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.5,\"mainSubjects\":\"Toán - ĐVĐ, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"E5 - Ôn tập về biến cố và công thức xác suất\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X25 - Ôn tập về biến cố và các quy tắc tính xác suất\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X58 - TỔNG ÔN 50 CÂU BIẾN CỐ QUY TẮC TÍNH XÁC SUẤT\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y33_Nâng cao dãy số 04\",\"done\":false}]},{\"week\":4,\"date\":\"24/07/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Lý, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#20. Bài 0115 - Bài toán quãng đường\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y34_Nâng cao dãy số 05\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#21. Bài 0116 - Cực trị quãng đường\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y01_Kĩ năng bó\",\"done\":false}]},{\"week\":4,\"date\":\"25/07/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Lý, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi, bù bài.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#22. Bài 0117 - Lực đàn hồi con lắc lò xo\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#23. Bài 0118 - Độ lệch pha giữa hai dao động\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y02_Kĩ năng hoán vị lặp\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#24. Bài 0119 - Các loại dao động\",\"done\":false}]},{\"week\":4,\"date\":\"26/07/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":5,\"date\":\"27/07/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.75,\"mainSubjects\":\"Lý, Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#1. Nhập Môn Kĩ Năng Giải Toán - Dao Động Cơ - Buổi 1\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y03_Kĩ năng cân bằng phần tử khoá\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#2. Nhập Môn Kĩ Năng Giải Toán - Dao Động Cơ - Buổi 2\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 42 - LÝ THUYẾT TRỌNG TÂM SULFUR\",\"done\":false}]},{\"week\":5,\"date\":\"28/07/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.5,\"mainSubjects\":\"Hóa, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#1. Bài 0201 - Mô tả sóng và sự truyền sóng\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y04_Kĩ năng tính tổng các số tự nhiên lập được\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 43 - LÝ THUYẾT TRỌNG TÂM SULFUR DIOXIDE\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 44 - LÝ THUYẾT TRỌNG TÂM SULFURIC ACID\",\"done\":false}]},{\"week\":5,\"date\":\"29/07/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":5.75,\"mainSubjects\":\"Hóa, Lý, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#2. Bài 0202 - Phương trình truyền sóng cơ\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#3. Bài 0203 - Độ lệch pha của các phần tử sóng cơ\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y05_Kĩ năng gián tiếp tương quan\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 45 - LÝ THUYẾT TRỌNG TÂM MUỐI SULFATE\",\"done\":false}]},{\"week\":5,\"date\":\"30/07/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":8,\"load\":6.25,\"mainSubjects\":\"Lý, Hóa, Toán Cơ Bản\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#4. Bài 0204 - Tìm số điểm thỏa mãn pha dao động\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 50 - LÝ THUYẾT TRỌNG TÂM PHÂN BÓN HÓA HỌC (SÁCH CHUYÊN ĐỀ)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 51 - PHÂN DẠNG BÀI TẬP PHÂN BÓN HÓA HỌC\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X31_Cơ bản về hình học không gian\",\"done\":false}]},{\"week\":5,\"date\":\"31/07/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":9,\"load\":6,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X32_Hai đường thẳng song song trong không gian\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y06_Kĩ năng phân tập\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#5. Bài 0205 - So sánh 2 phần tử sóng\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 53 - DẠNG BÀI TẬP SULFUR PHẢN ỨNG VỚI KIM LOẠI\",\"done\":false}]},{\"week\":5,\"date\":\"01/08/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":6,\"load\":5.25,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi, bù bài.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X33_ĐT song song với Mặt Phẳng trong KG\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X34_Hai mặt phẳng song song trong không gian\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y07_Kĩ năng gộp phép thử\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#6. Luyện tập Sóng Cơ - Độ lệch pha\",\"done\":false}]},{\"week\":5,\"date\":\"02/08/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":6,\"date\":\"03/08/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 54 - PHÂN DẠNG BÀI TẬP OLEUM SIÊU HAY\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X34_Hai mặt phẳng song song trong không gian\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X35_Phép chiều song song trong KG\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"D9 - Đề ôn tập quan hệ song song - Đề số 1\",\"done\":false}]},{\"week\":6,\"date\":\"04/08/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":14,\"load\":7,\"mainSubjects\":\"Toán - ĐVĐ, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Cần chú ý\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"D10 - Đề ôn tập quan hệ song song - Đề số 2\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y08_Kĩ năng xử lí ước nguyên dương\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#7. Bài 0206 - Đồ thị sóng truyền trên dây\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#8. Bài 0207 - Giao thoa sóng\",\"done\":false}]},{\"week\":6,\"date\":\"05/08/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6,\"mainSubjects\":\"Hóa, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#9. Luyện tập: Giao thoa sóng cơ\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y09_Kĩ năng vách ngăn\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 1\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 2\",\"done\":false}]},{\"week\":6,\"date\":\"06/08/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Lý\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#10. Bài 0209 - Sóng dừng\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X61_2 ĐT vuông góc trong không gian\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 3\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 4\",\"done\":false}]},{\"week\":6,\"date\":\"07/08/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":5,\"load\":5.5,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 5\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X62_ĐT vuông góc với MP trong KG\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X63_HAI MP VUÔNG GÓC TRONG KG\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y10_Kết hợp kĩ năng vách ngăn và bó\",\"done\":false}]},{\"week\":6,\"date\":\"08/08/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":10,\"load\":6.25,\"mainSubjects\":\"Lý, Toán Cơ Bản, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi, bù bài.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#11. Bài 0210 - Các kĩ thuật giải toán sóng dừng\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X64_HÌNH CHÓP ĐỀU VÀ LĂNG TRỤ ĐỀU\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y11_KN xếp nhóm phần tử không đối diện\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#12. Bài 0211 - Sóng điện từ\",\"done\":false}]},{\"week\":6,\"date\":\"09/08/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":7,\"date\":\"10/08/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":7,\"load\":5.75,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X65_Định vị chân đường cao cơ bản\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y12_KN định vị hình học 01\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#13. Bài 0212 - Giao thoa ánh sáng\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 61 - LÝ THUYẾT TRỌNG TÂM HỢP CHẤT HỮU CƠ & HÓA HỌC HỮU CƠ\",\"done\":false}]},{\"week\":7,\"date\":\"11/08/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":7,\"load\":6.25,\"mainSubjects\":\"Toán Cơ Bản, Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa trong cùng ngày.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X66_Cơ bản về khoảng cách\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#14. Bài 0213 - Các kĩ thuật giải toán giao thoa ánh sáng\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 62 - CÂU HỎI VẬN DỤNG HỢP CHẤT HỮU CƠ & HÓA HỌC HỮU CƠ\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 63 - PHƯƠNG PHÁP GIẢI PHỔ HỒNG NGOẠI IR\",\"done\":false}]},{\"week\":7,\"date\":\"12/08/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":10,\"load\":6.25,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X67_KC giữa 2 đườn thẳng chéo nhau\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y13_Kĩ năng đánh số thứ tự\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#15. Bài 0214 - Đại cương sóng âm\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 64 - LÝ THUYẾT TRỌNG TÂM TÁCH VÀ TINH CHẾ HỢP CHẤT HỮU CƠ\",\"done\":false}]},{\"week\":7,\"date\":\"13/08/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.5,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 65 - BÀI TẬP VẬN DỤNG TÁCH VÀ TINH CHẾ HỢP CHẤT HỮU CƠ\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X68_Thể tích\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"H7 - Tổng ôn góc - khoảng cách - thể tích\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X26 - Ôn tập Góc trong không gian\",\"done\":false}]},{\"week\":7,\"date\":\"14/08/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.5,\"mainSubjects\":\"Toán - ĐVĐ, Lý, Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X48 - 20 bài toán khoảng cách giữa 2 đường thẳng chéo nhau\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#16. Bài 0215 - Giao thoa 2 bức xạ\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 67 - CÔNG THỨC PHÂN TỬ HỢP CHẤT HỮU CƠ & PHỔ KHỐI LƯỢNG\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y14_Bài toán chia kẹo Euler\",\"done\":false}]},{\"week\":7,\"date\":\"15/08/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":8,\"load\":6.5,\"mainSubjects\":\"Lý, Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#17. ÔN TẬP CHƯƠNG 2 - SÓNG\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 68 - CÔNG THỨC CẤU TẠO HỢP CHẤT HỮU CƠ\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y15_Kĩ năng đếm tam giác trong đa giác\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#1. Bài 0301 - Tương tác tĩnh điện - Định luật Cu-lông\",\"done\":false}]},{\"week\":7,\"date\":\"16/08/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":8,\"date\":\"17/08/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":9,\"load\":6,\"mainSubjects\":\"Toán Nâng Cao, Lý, Toán Cơ Bản\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y16_Kĩ năng đếm tứ giác trong đa giác\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#2. Bài 0302: Các dạng toán hay và khó về Định Luật Cu-lông\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#3. Bài 0303: Thuyết Electron - Sự Nhiễm Điện\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X71_Cơ bản về đạo hàm\",\"done\":false}]},{\"week\":8,\"date\":\"18/08/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":9,\"load\":5.75,\"mainSubjects\":\"Toán Nâng Cao, Lý, Toán Cơ Bản\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y17_Thống nhất chia kẹo và bổ đề CapCut\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#4. Bài 0304: Điện trường\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X71_Cơ bản về đạo hàm\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#5. Bài 0305: Các dạng toán hay và khó về Điện Trường\",\"done\":false}]},{\"week\":8,\"date\":\"19/08/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 78 - THỰC HÀNH VIẾT CÔNG THỨC CẤU TẠO\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 79 - TỔNG ÔN CÔNG THỨC CẤU TẠO HỢP CHẤT HỮU CƠ\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X72_Đạo hàm hàm hợp\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y18_Khai triển Newton nâng cao 01\",\"done\":false}]},{\"week\":8,\"date\":\"20/08/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":8,\"load\":6.25,\"mainSubjects\":\"Lý, Hóa, Toán Cơ Bản\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#6. Bài 0306: Công lực điện - Điện thế - Hiệu điện thế\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 80 - TỔNG ÔN TOÀN DIỆN ĐẠI CƯƠNG HỮU CƠ\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 81 - KIỂM TRA CHẤT LƯỢNG ĐẠI CƯƠNG HỮU CƠ\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X72_Đạo hàm hàm hợp\",\"done\":false}]},{\"week\":8,\"date\":\"21/08/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":9,\"load\":6.25,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X73_Đạo hàm cấp cao và mở rộng đạo hàm\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y19_Khai triển Newton nâng cao 02\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#7. Bài 0307: Điện tích trong điện trường đều\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 82 - LÝ THUYẾT TRỌNG TÂM ALKANE (VIP1)\",\"done\":false}]},{\"week\":8,\"date\":\"22/08/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":5,\"load\":4.75,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X74_Ứng dụng đạo hàm toàn diện\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y20_Xác suất Bernoulli\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#8. Bài 0308: Tụ điện\",\"done\":false}]},{\"week\":8,\"date\":\"23/08/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":9,\"date\":\"24/08/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6,\"mainSubjects\":\"Hóa, Lý, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#9. Bài 0310: Ghép tụ điện\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 85 - PHÂN DẠNG CÂU HỎI LÝ THUYẾT ALKANE (VIP1)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 87 - BÀI TẬP PHẢN ỨNG THẾ CỦA ALKANE\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y21_Kĩ năng cây điều kiện\",\"done\":false}]},{\"week\":9,\"date\":\"25/08/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6.5,\"mainSubjects\":\"Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#10. Bài 0310: Ghép tụ đã tích điện\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 88 - BÀI TẬP TÍNH TỈ LỆ SẢN PHẨM THẾ\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 89 - BÀI TẬP TÍNH CHỈ SỐ OCTANE (OCTANE NUMBER)\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#11. Nâng cao - Điện tích chuyển động trong điện trường đều\",\"done\":false}]},{\"week\":9,\"date\":\"26/08/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X41_Cơ bản về luỹ thừa\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y22_Kĩ năng triển khai TT Vết dầu loang\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#12. Tổng ôn chương 3\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 93 - BÀI TẬP ĐỐT CHÁY ALKANE CHƯƠNG TRÌNH CŨ (TẶNG THÊM)\",\"done\":false}]},{\"week\":9,\"date\":\"27/08/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":7,\"load\":5.5,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X42_Cơ bản về logarit\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y23_BT chia đồ số 01\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#1. Bài Cường độ dòng điện\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 94 - LÝ THUYẾT TRỌNG TÂM HYDROCARBON KHÔNG NO (VIP1)\",\"done\":false}]},{\"week\":9,\"date\":\"28/08/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":5,\"load\":5.25,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X43_Biến đổi logarit nâng cao\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y24_Kĩ năng chia đồ số 02\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#2. Buổi 2 - Định luật Ohm\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 96 - PHƯƠNG PHÁP ĐẾM NHANH SỐ ĐỒNG PHÂN ALKENE & ALKYNE\",\"done\":false}]},{\"week\":9,\"date\":\"29/08/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":5,\"load\":5.5,\"mainSubjects\":\"Hóa, Toán Cơ Bản, Lý\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa. T7 ưu tiên rà lỗi.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#3. Buổi 3 - Vẽ lại mạch điện (tiết 1)\",\"done\":false},{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X44_Tăng trưởng và lãi suất\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 97 - PHÂN DẠNG BÀI TẬP HYDROCARBON KHÔNG NO (VIP1)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 99 - BÀI TẬP XÁC ĐỊNH THÀNH PHẦN - HÀM LƯỢNG HYDROCARBON\",\"done\":false}]},{\"week\":9,\"date\":\"30/08/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":10,\"date\":\"31/08/2026\",\"weekday\":\"T2\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5,\"mainSubjects\":\"Toán Cơ Bản, Toán Nâng Cao, Lý, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X45_Cơ bản về hàm số mũ và loga\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y25_Kĩ năng triển khai CT Menelaus\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#4. Buổi 4 - Vẽ lại mạch điện (tiết 2)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 100 - BÀI TẬP XÁC ĐỊNH LƯỢNG CHẤT HYDROCARBON\",\"done\":false}]},{\"week\":10,\"date\":\"01/09/2026\",\"weekday\":\"T3\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6,\"mainSubjects\":\"Toán Cơ Bản, Lý, Hóa\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X46_Cơ bản về PT BPT Mũ\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#5. Buổi 5 - Mạch chứa Ampe kế và Vôn kế\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 102 - PHƯƠNG PHÁP BẢO TOÀN MOL LIÊN KẾT PI\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 105 - LÝ THUYẾT TRỌNG TÂM HYDROCARBON THƠM\",\"done\":false}]},{\"week\":10,\"date\":\"02/09/2026\",\"weekday\":\"T4\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":5,\"load\":5,\"mainSubjects\":\"Toán Cơ Bản, Toán - ĐVĐ, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Cơ Bản\",\"name\":\"TDM11X47_Cơ bản về PT BPT loga\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"F6 - Bất phương trình mũ logarit quy về tam thức bậc hai chứa tham số\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"F7 - Ứng dụng định lý Viet trong bài toán phương trình mũ logarit có tham số\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y26_KN làm chủ tỉ lệ trong HC đáy HBH\",\"done\":false}]},{\"week\":10,\"date\":\"03/09/2026\",\"weekday\":\"T5\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":6,\"load\":6,\"mainSubjects\":\"Lý, Hóa, Toán Nâng Cao\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#6. Buổi 6 - Nguồn điện\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 109 - TỔNG ÔN CHUYÊN ĐỀ HYDROCARBON (VIP1)\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y27_KN làm chủ tỉ lệ trong hình hộp\",\"done\":false},{\"subject\":\"Lý\",\"name\":\"#7. Buổi 7 - Năng lượng điện và Công suất điện\",\"done\":false}]},{\"week\":10,\"date\":\"04/09/2026\",\"weekday\":\"T6\",\"type\":\"Học chính + luyện tập\",\"sessions\":4,\"videos\":4,\"load\":5.25,\"mainSubjects\":\"Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y28_KN làm chủ tỉ lệ trong HC đáy HT\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y29_KN làm chủ tổ hợp tỉ lệ cạnh bên của HC\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 1\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y35_Kĩ năng triển khai góc giữa 2 cạnh đối\",\"done\":false}]},{\"week\":10,\"date\":\"05/09/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":4,\"videos\":4,\"load\":5.75,\"mainSubjects\":\"Hóa, Toán Nâng Cao, Lý\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa. T7 ưu tiên rà lỗi.\",\"warning\":\"Vừa sức\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#8. Buổi 8 - Cực trị công suất\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 2\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y36_KN triển khai CT GKC01_GKC02\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 3\",\"done\":false}]},{\"week\":10,\"date\":\"06/09/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":11,\"date\":\"07/09/2026\",\"weekday\":\"T2\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 4\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 5\",\"done\":false}]},{\"week\":11,\"date\":\"08/09/2026\",\"weekday\":\"T3\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.5,\"mainSubjects\":\"Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y37_Kĩ năng định vị chân đường cao Level3\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y38_KN sử dụng CT thể tích nâng cao\",\"done\":false}]},{\"week\":11,\"date\":\"09/09/2026\",\"weekday\":\"T4\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 118 - LÝ THUYẾT TRỌNG TÂM DẪN XUẤT HALOGEN\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y39_NCao góc nhị diện_Lăng trụ hoá nhị diện\",\"done\":false}]},{\"week\":11,\"date\":\"10/09/2026\",\"weekday\":\"T5\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 121 - PHÂN DẠNG BÀI TẬP DẪN XUẤT HALOGEN\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y40_Cực trị thể tích\",\"done\":false}]},{\"week\":11,\"date\":\"11/09/2026\",\"weekday\":\"T6\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y41_KN nhìn nhanh cặp loga nghịch đảo\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 127 - PHÂN DẠNG BÀI TẬP ALCOHOL (VIP1)\",\"done\":false}]},{\"week\":11,\"date\":\"12/09/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán. T7 ưu tiên rà lỗi.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y42_Kĩ năng miền D\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 130 - LÝ THUYẾT TRỌNG TÂM PHENOL\",\"done\":false}]},{\"week\":11,\"date\":\"13/09/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":12,\"date\":\"14/09/2026\",\"weekday\":\"T2\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 131 - PHÂN DẠNG BÀI TẬP PHENOL\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 132 - CÂU HỎI ĐÚNG - SAI DẪN XUẤT HALOGEN - ALCOHOL – PHENOL\",\"done\":false}]},{\"week\":12,\"date\":\"15/09/2026\",\"weekday\":\"T3\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.5,\"mainSubjects\":\"Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y47_Kĩ năng rút gọn đường cong quỹ tích\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y43_KN khảo sát trong PT BPT Mũ Logarit\",\"done\":false}]},{\"week\":12,\"date\":\"16/09/2026\",\"weekday\":\"T4\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y44_PT BPT tích thương cùng điểm rơi\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 2\",\"done\":false}]},{\"week\":12,\"date\":\"17/09/2026\",\"weekday\":\"T5\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 3\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 4\",\"done\":false}]},{\"week\":12,\"date\":\"18/09/2026\",\"weekday\":\"T6\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 5\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y45_Đánh giá tổng hàm cùng điểm rơi\",\"done\":false}]},{\"week\":12,\"date\":\"19/09/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"T7 ưu tiên rà lỗi.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"ĐỀ THI THỬ GIỮA HỌC KÌ II (ĐỀ SỐ 8)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ THI THỬ GIỮA HỌC KÌ II (ĐỀ SỐ 9)\",\"done\":false}]},{\"week\":12,\"date\":\"20/09/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":13,\"date\":\"21/09/2026\",\"weekday\":\"T2\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Toán Nâng Cao, Hóa\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y46_Đánh giá BĐT Bernoulli\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ THI THỬ GIỮA HỌC KÌ II (ĐỀ SỐ 10)\",\"done\":false}]},{\"week\":13,\"date\":\"22/09/2026\",\"weekday\":\"T3\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":2.75,\"mainSubjects\":\"Hóa, Toán Nâng Cao\",\"note\":\"Giữ Toán Nâng Cao ở nhóm slot Toán.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 142 - LÝ THUYẾT TRỌNG TÂM HỢP CHẤT CARBONYL\",\"done\":false},{\"subject\":\"Toán Nâng Cao\",\"name\":\"TDM11Y48_Cực trị KC giữa hai đường cong ĐB\",\"done\":false}]},{\"week\":13,\"date\":\"23/09/2026\",\"weekday\":\"T4\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 143 - CÂU HỎI LÝ THUYẾT TRỌNG TÂM HỢP CHẤT CARBONYL\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 144 - PHÂN DẠNG BÀI TẬP HỢP CHẤT CARBONYL (VIP1)\",\"done\":false}]},{\"week\":13,\"date\":\"24/09/2026\",\"weekday\":\"T5\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 146 - LÝ THUYẾT TRỌNG TÂM CARBOXYLIC ACID\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"LIVE 147 - CÂU HỎI LÝ THUYẾT TRỌNG TÂM CARBOXYLIC ACID\",\"done\":false}]},{\"week\":13,\"date\":\"25/09/2026\",\"weekday\":\"T6\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"LIVE 148 - PHÂN DẠNG BÀI TẬP CARBOXYLIC ACID (VIP1)\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"CHIẾN DỊCH THI THỬ CUỐI HỌC KÌ II – ĐỀ 1\",\"done\":false}]},{\"week\":13,\"date\":\"26/09/2026\",\"weekday\":\"T7\",\"type\":\"Học nhẹ + ôn/bù\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"T7 ưu tiên rà lỗi.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"CHIẾN DỊCH THI THỬ CUỐI HỌC KÌ II – ĐỀ 2\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"CHIẾN DỊCH THI THỬ CUỐI HỌC KÌ II – ĐỀ 3\",\"done\":false}]},{\"week\":13,\"date\":\"27/09/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":14,\"date\":\"28/09/2026\",\"weekday\":\"T2\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Hóa\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Hóa\",\"name\":\"CHIẾN DỊCH THI THỬ CUỐI HỌC KÌ II – ĐỀ 4\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"CHIẾN DỊCH THI THỬ CUỐI HỌC KÌ II – ĐỀ 5\",\"done\":false}]},{\"week\":14,\"date\":\"29/09/2026\",\"weekday\":\"T3\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":5,\"load\":3.75,\"mainSubjects\":\"Hóa, Lý\",\"note\":\"Đã ưu tiên xếp Lý trước Hóa.\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Lý\",\"name\":\"#2. Chuỗi live Thực chiến lí thuyết Dao động và Sóng\",\"done\":false},{\"subject\":\"Hóa\",\"name\":\"ĐỀ SỐ 1\",\"done\":false}]},{\"week\":14,\"date\":\"30/09/2026\",\"weekday\":\"T4\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X49 - 20 bài toán góc nhị diện\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X50 - 20 bài toán mũ - loga đặc sắc\",\"done\":false}]},{\"week\":14,\"date\":\"01/10/2026\",\"weekday\":\"T5\",\"type\":\"Ôn tập / luyện đề\",\"sessions\":2,\"videos\":2,\"load\":3,\"mainSubjects\":\"Toán - ĐVĐ\",\"note\":\"\",\"warning\":\"Nhẹ/đệm\",\"items\":[{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X51 - 20 bài toán thể tích - tỉ lệ thể tích\",\"done\":false},{\"subject\":\"Toán - ĐVĐ\",\"name\":\"X52 - 20 bài toán giới hạn - đạo hàm đặc sắc\",\"done\":false}]},{\"week\":14,\"date\":\"02/10/2026\",\"weekday\":\"T6\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":14,\"date\":\"03/10/2026\",\"weekday\":\"T7\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]},{\"week\":14,\"date\":\"04/10/2026\",\"weekday\":\"CN\",\"type\":\"Nghỉ\",\"sessions\":0,\"videos\":0,\"load\":0,\"mainSubjects\":\"Nghỉ hoàn toàn\",\"note\":\"Không học bài mới; phục hồi, bù nhẹ nếu cần.\",\"warning\":\"Nghỉ\",\"items\":[]}]");
function getSubjectPriority(subjectNameOrId) {
	if (!subjectNameOrId) return 50;
	const s = subjectNameOrId.trim().toLowerCase();
	if (s === "toan" || s.startsWith("toán") || s.includes("toán") || s.includes("math")) return 1;
	if (s === "ly" || s === "lý" || s.includes("vật lý") || s.includes("vật lí") || s.includes("physics")) return 2;
	if (s === "hoa" || s === "hóa" || s.includes("hóa học") || s.includes("hóa") || s.includes("chem")) return 3;
	if (s === "tieng-anh" || s.includes("tiếng anh") || s.includes("ngoại ngữ") || s === "anh" || s.includes("english")) return 99;
	return 10;
}
function sortSubjects(subjects) {
	const list = [...subjects];
	list.sort((a, b) => {
		const prioA = getSubjectPriority(a.id || a.name);
		const prioB = getSubjectPriority(b.id || b.name);
		if (prioA !== prioB) return prioA - prioB;
		return 0;
	});
	return list;
}
function sortLessonsBySubjectPriority(lessons) {
	const list = [...lessons];
	list.sort((a, b) => {
		const prioA = getSubjectPriority(a.sourceSubject || a.id);
		const prioB = getSubjectPriority(b.sourceSubject || b.id);
		if (prioA !== prioB) return prioA - prioB;
		return 0;
	});
	return list;
}
var schedule = grade11_roadmap_default;
var SUBJECT_DEFS = [
	{
		id: "toan",
		name: "Toán",
		emoji: "📐"
	},
	{
		id: "ly",
		name: "Vật lý",
		emoji: "⚛️"
	},
	{
		id: "hoa",
		name: "Hóa học",
		emoji: "🧪"
	}
];
var subjectGroup = (source) => {
	if (source.startsWith("Toán")) return "toan";
	if (source === "Lý") return "ly";
	if (source === "Hóa") return "hoa";
	return null;
};
var toISODate = (date) => {
	const [day, month, year] = date.split("/");
	return `${year}-${month}-${day}`;
};
var weekRanges = /* @__PURE__ */ new Map();
var lessonsBySubjectWeek = Object.fromEntries(SUBJECT_DEFS.map((subject) => [subject.id, /* @__PURE__ */ new Map()]));
for (const day of schedule) {
	const currentRange = weekRanges.get(day.week);
	weekRanges.set(day.week, {
		start: currentRange?.start ?? day.date,
		end: day.date
	});
	day.items.forEach((item, itemIndex) => {
		const group = subjectGroup(item.subject);
		if (!group) return;
		const lessons = lessonsBySubjectWeek[group].get(day.week) ?? [];
		let topic = void 0;
		if (item.name.includes(" - ")) topic = item.name.split(" - ")[0].trim();
		lessons.push({
			id: `${group}-${toISODate(day.date)}-${itemIndex + 1}`,
			title: item.name,
			topic,
			xp: 20,
			plannedDurationMinutes: 90,
			scheduledDate: toISODate(day.date),
			weekday: day.weekday,
			sourceSubject: item.subject,
			week: day.week,
			initialDone: item.done
		});
		lessonsBySubjectWeek[group].set(day.week, lessons);
	});
}
var SUBJECTS = sortSubjects(SUBJECT_DEFS.map((subject) => ({
	...subject,
	milestones: [...lessonsBySubjectWeek[subject.id].entries()].map(([week, lessons]) => {
		const range = weekRanges.get(week);
		return {
			id: `${subject.id}-week-${week}`,
			title: week === 0 ? "Khởi động" : `Tuần ${week}`,
			subtitle: `${range.start} – ${range.end} · ${lessons.length} bài`,
			lessons
		};
	})
})));
var ALL_LESSONS = SUBJECTS.flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons));
var INITIAL_COMPLETED_LESSONS = Object.fromEntries(ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [lesson.id, lesson.scheduledDate]));
var INITIAL_LESSON_XP = Object.fromEntries(ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [lesson.id, lesson.xp]));
ALL_LESSONS.length, Object.keys(INITIAL_COMPLETED_LESSONS).length, toISODate(schedule[0].date), toISODate(schedule.at(-1).date);
var HABITS = [
	{
		id: "water",
		name: "Uống nước",
		icon: "water",
		kind: "counter",
		target: 8,
		color: "blue",
		archived: false,
		dailyTargets: [
			8,
			8,
			8,
			8,
			8,
			8,
			8
		]
	},
	{
		id: "read",
		name: "Đọc sách 30 phút",
		icon: "book",
		kind: "toggle",
		target: 1,
		color: "green",
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	},
	{
		id: "move",
		name: "Vận động",
		icon: "run",
		kind: "toggle",
		target: 1,
		color: "coral",
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	},
	{
		id: "sleep",
		name: "Ngủ đủ 7h",
		icon: "sleep",
		kind: "toggle",
		target: 1,
		color: "blue",
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	},
	{
		id: "meditate",
		name: "Thiền / thư giãn",
		icon: "meditate",
		kind: "toggle",
		target: 1,
		color: "green",
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	},
	{
		id: "study",
		name: "Học đúng lịch",
		icon: "study",
		kind: "toggle",
		target: 1,
		color: "amber",
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	}
];
var DEFAULT_PLANNER_SETTINGS = {
	todayHours: 2,
	dailyHours: {},
	defaultDailyHours: 2,
	reviewShareMax: .2,
	reviewCapMinutes: 60,
	subjectRotation: [
		"toan",
		"ly",
		"hoa"
	]
};
var DEFAULT_STUDY_META = {
	actualMinutes: {},
	fallbackMinutes: 90,
	minPerLesson: 10,
	maxPerLesson: 240
};
function estimateLessonMinutes(lessonId, meta, subjects = SUBJECTS) {
	const samples = (meta.actualMinutes[lessonId] ?? []).filter((minutes) => Number.isFinite(minutes) && minutes > 0);
	if (samples.length > 0) {
		const mean = Math.round(samples.reduce((sum, minutes) => sum + minutes, 0) / samples.length);
		return Math.min(meta.maxPerLesson, Math.max(meta.minPerLesson, mean));
	}
	return subjects.flatMap((subject) => subject.milestones).flatMap((milestone) => milestone.lessons).find((candidate) => candidate.id === lessonId)?.plannedDurationMinutes ?? meta?.fallbackMinutes ?? 90;
}
function meanLessonMinutes(remainingIds, meta, subjects = SUBJECTS) {
	if (remainingIds.length === 0) return meta.fallbackMinutes;
	const sum = remainingIds.reduce((total, id) => total + estimateLessonMinutes(id, meta, subjects), 0);
	return Math.round(sum / remainingIds.length);
}
function remainingBySubject(subjects, completed, consumed = /* @__PURE__ */ new Set()) {
	const sortedSubjects = sortSubjects(subjects);
	const out = {};
	for (const subject of sortedSubjects) {
		const list = [];
		for (const m of subject.milestones) for (const l of m.lessons) {
			if (completed[l.id]) continue;
			if (consumed.has(l.id)) continue;
			if (!l.scheduledDate) continue;
			list.push(l);
		}
		out[subject.id] = list;
	}
	return out;
}
function reviewDueLessons(completed, refISO, subjects) {
	const out = [];
	const activeLessonIds = subjects ? new Set(subjects.flatMap((s) => s.milestones.flatMap((m) => m.lessons.map((l) => l.id)))) : null;
	for (const [id, iso] of Object.entries(completed)) {
		if (!iso) continue;
		if (activeLessonIds && !activeLessonIds.has(id)) continue;
		const age = daysBetweenISO(iso, refISO);
		if (age === 1 || age === 3 || age === 7 || age === 14 || age === 30) out.push({
			lessonId: id,
			completedISO: iso,
			ageDays: age
		});
	}
	out.sort((a, b) => a.ageDays - b.ageDays);
	return out;
}
var REVIEW_MIN_PER_ITEM = 15;
function pickDayQueue(params) {
	const { subjects, completed, meta, settings, dateISO } = params;
	const consumed = new Set(params.consumed ?? []);
	const hours = params.hoursOverride ?? 0;
	const quotaMinutes = Math.max(0, Math.round(hours * 60));
	const reviewBudget = Math.min(settings.reviewCapMinutes, Math.round(quotaMinutes * settings.reviewShareMax));
	const due = reviewDueLessons(completed, dateISO, subjects);
	const reviewLessons = [];
	let reviewMinutes = 0;
	for (const item of due) {
		if (quotaMinutes > 0 && reviewMinutes + REVIEW_MIN_PER_ITEM > reviewBudget) break;
		if (quotaMinutes === 0 && reviewMinutes + REVIEW_MIN_PER_ITEM > settings.reviewCapMinutes) break;
		reviewLessons.push({
			lessonId: item.lessonId,
			ageDays: item.ageDays,
			minutes: REVIEW_MIN_PER_ITEM
		});
		reviewMinutes += REVIEW_MIN_PER_ITEM;
	}
	const newLessons = [];
	let newMinutes = 0;
	const pinned = params.pinnedCompleted ?? [];
	for (const l of pinned) {
		if (consumed.has(l.id)) continue;
		newLessons.push(l);
		newMinutes += estimateLessonMinutes(l.id, meta, subjects);
		consumed.add(l.id);
	}
	if (quotaMinutes > 0) {
		const newBudget = quotaMinutes - reviewMinutes;
		const sortedSubjects = sortSubjects(subjects);
		const pools = remainingBySubject(sortedSubjects, completed, consumed);
		const order = sortedSubjects.map((s) => s.id);
		const cursors = Object.fromEntries(order.map((id) => [id, 0]));
		let guard = 0;
		while (guard++ < 1e3) {
			let picked = false;
			for (const sid of order) {
				const pool = pools[sid] || [];
				while (cursors[sid] < pool.length) {
					const lesson = pool[cursors[sid]];
					const est = estimateLessonMinutes(lesson.id, meta, subjects);
					if (newMinutes + est > newBudget) {
						cursors[sid] = pool.length;
						break;
					}
					newLessons.push(lesson);
					newMinutes += est;
					cursors[sid]++;
					picked = true;
					break;
				}
			}
			if (!picked) break;
		}
	}
	return {
		newLessons: sortLessonsBySubjectPriority(newLessons),
		reviewLessons,
		quotaMinutes,
		newMinutes,
		reviewMinutes,
		unallocatedMinutes: Math.max(0, quotaMinutes - newMinutes - reviewMinutes),
		overloadMinutes: Math.max(0, newMinutes + reviewMinutes - quotaMinutes)
	};
}
function lessonsCompletedOn(subjects, completed, dateISO) {
	const ids = /* @__PURE__ */ new Set();
	for (const [id, iso] of Object.entries(completed)) if (iso === dateISO) ids.add(id);
	if (ids.size === 0) return [];
	const out = [];
	for (const s of subjects) for (const m of s.milestones) for (const l of m.lessons) if (ids.has(l.id)) out.push(l);
	return out;
}
function pickTodayQueue(args) {
	const dateISO = args.dateISO ?? todayISO();
	const pinnedCompleted = lessonsCompletedOn(args.subjects, args.completed, dateISO);
	return pickDayQueue({
		subjects: args.subjects,
		completed: args.completed,
		meta: args.meta,
		settings: args.settings,
		dateISO,
		hoursOverride: args.settings.todayHours,
		pinnedCompleted
	});
}
function buildFlexiblePlan(args) {
	const from = args.fromISO ?? todayISO();
	const horizon = args.horizonDays ?? 14;
	const consumed = /* @__PURE__ */ new Set();
	const days = [];
	for (let i = 0; i < horizon; i++) {
		const dateISO = addDaysISO(from, i);
		const isToday = dateISO === todayISO();
		let hours;
		if (isToday) hours = args.settings.todayHours;
		else if (args.settings.dailyHours[dateISO] !== void 0) hours = args.settings.dailyHours[dateISO];
		else hours = args.settings.defaultDailyHours;
		const pinned = lessonsCompletedOn(args.subjects, args.completed, dateISO);
		const queue = pickDayQueue({
			subjects: args.subjects,
			completed: args.completed,
			consumed,
			meta: args.meta,
			settings: args.settings,
			dateISO,
			hoursOverride: hours,
			pinnedCompleted: pinned.length > 0 ? pinned : void 0
		});
		for (const l of queue.newLessons) consumed.add(l.id);
		days.push({
			dateISO,
			hours,
			queue
		});
	}
	return days;
}
function forecast(args) {
	const from = args.fromISO ?? todayISO();
	const remaining = args.remainingLessonIds.length;
	const plannedMean = meanLessonMinutes(args.remainingLessonIds, {
		...args.meta,
		actualMinutes: {}
	}, args.subjects ?? SUBJECTS);
	const actualSamples = Object.values(args.meta.actualMinutes).flat().filter((minutes) => Number.isFinite(minutes) && minutes > 0);
	const sampleCount = actualSamples.length;
	const actualMean = sampleCount > 0 ? Math.round(actualSamples.reduce((sum, minutes) => sum + minutes, 0) / sampleCount) : plannedMean;
	const mean = sampleCount === 0 ? plannedMean : sampleCount < 7 ? Math.round((plannedMean + actualMean) / 2) : actualMean;
	const confidence = sampleCount < 3 ? "insufficient" : sampleCount < 7 ? "low" : sampleCount < 20 ? "medium" : "high";
	const basis = sampleCount === 0 ? "planned" : sampleCount >= Math.max(7, remaining) ? "actual" : "mixed";
	if (remaining === 0 || args.hoursPerDay <= 0) return {
		remaining,
		meanMinutes: mean,
		totalNewHours: 0,
		totalReviewHours: 0,
		endDateISO: from,
		reviewEndDateISO: from,
		studyDays: 0,
		sampleCount,
		confidence,
		earliestEndDateISO: from,
		latestEndDateISO: from,
		basis
	};
	const minutesPerDayForNew = args.hoursPerDay * 60 * .8;
	const totalNewMinutes = remaining * mean;
	const studyDays = Math.max(1, Math.ceil(totalNewMinutes / minutesPerDayForNew));
	const endDateISO = advanceStudyDays(from, studyDays);
	const uncertainty = confidence === "high" ? [.9, 1.1] : confidence === "medium" ? [.8, 1.2] : confidence === "low" ? [.7, 1.35] : [.6, 1.5];
	const earliestEndDateISO = advanceStudyDays(from, Math.max(1, Math.ceil(studyDays * uncertainty[0])));
	const latestEndDateISO = advanceStudyDays(from, Math.max(1, Math.ceil(studyDays * uncertainty[1])));
	const reviewEndDateISO = addDaysISO(endDateISO, 30);
	const totalReviewMinutes = Math.round(totalNewMinutes * .35);
	return {
		remaining,
		meanMinutes: mean,
		totalNewHours: Math.round(totalNewMinutes / 60 * 10) / 10,
		totalReviewHours: Math.round(totalReviewMinutes / 60 * 10) / 10,
		endDateISO,
		reviewEndDateISO,
		studyDays,
		sampleCount,
		confidence,
		earliestEndDateISO,
		latestEndDateISO,
		basis
	};
}
function advanceStudyDays(fromISO, studyDays) {
	let iso = fromISO;
	let count = 0;
	while (count < studyDays) {
		iso = addDaysISO(iso, 1);
		if (!isSundayISO(iso)) count++;
	}
	return iso;
}
function allRemainingLessonIds(subjects, completed) {
	const out = [];
	for (const s of subjects) for (const m of s.milestones) for (const l of m.lessons) if (!completed[l.id]) out.push(l.id);
	return out;
}
function findLessonPosition(subjects, lessonId) {
	for (const s of subjects) for (const m of s.milestones) {
		const idx = m.lessons.findIndex((l) => l.id === lessonId);
		if (idx >= 0) return {
			subject: s,
			milestone: m.title,
			indexInMilestone: idx + 1,
			totalInMilestone: m.lessons.length
		};
	}
	return null;
}
function findLessonById(id, subjects = SUBJECTS) {
	for (const s of subjects) for (const m of s.milestones) {
		const l = m.lessons.find((x) => x.id === id);
		if (l) return l;
	}
	return null;
}
function buildShiftedSchedule(args) {
	const from = args.fromISO ?? todayISO();
	const out = {};
	const uncompletedIds = allRemainingLessonIds(args.subjects, args.completed);
	if (uncompletedIds.length === 0) return out;
	const totalUncompleted = uncompletedIds.length;
	const consumed = /* @__PURE__ */ new Set();
	let dayOffset = 0;
	while (consumed.size < totalUncompleted && dayOffset < 365) {
		const dateISO = addDaysISO(from, dayOffset);
		let hours;
		if (dayOffset === 0) hours = args.settings.todayHours;
		else if (args.settings.dailyHours[dateISO] !== void 0) hours = args.settings.dailyHours[dateISO];
		else hours = args.settings.defaultDailyHours;
		const queue = pickDayQueue({
			subjects: args.subjects,
			completed: args.completed,
			consumed,
			meta: args.meta,
			settings: args.settings,
			dateISO,
			hoursOverride: hours,
			pinnedCompleted: dayOffset === 0 ? lessonsCompletedOn(args.subjects, args.completed, dateISO) : void 0
		});
		for (const l of queue.newLessons) if (!consumed.has(l.id)) {
			consumed.add(l.id);
			out[l.id] = dateISO;
		}
		dayOffset++;
	}
	return out;
}
//#endregion
export { findLessonPosition as A, TabsTrigger as C, cn as D, buildShiftedSchedule as E, pickTodayQueue as F, playPushNotificationChime as I, savePushPreferences as L, getPushPreferences as M, getSubjectPriority as N, estimateLessonMinutes as O, normalizePushPreferences as P, sortLessonsBySubjectPriority as R, TabsList as S, buildFlexiblePlan as T, PUSH_PREFERENCES_KEY as _, DEFAULT_STUDY_META as a, Tabs as b, DialogDescription as c, DialogTrigger as d, HABITS as f, Label as g, Input as h, DEFAULT_PUSH_PREFERENCES as i, forecast as j, findLessonById as k, DialogHeader as l, INITIAL_LESSON_XP as m, Button as n, Dialog as o, INITIAL_COMPLETED_LESSONS as p, DEFAULT_PLANNER_SETTINGS as r, DialogContent as s, ALL_LESSONS as t, DialogTitle as u, SUBJECTS as v, allRemainingLessonIds as w, TabsContent as x, Slider as y, sortSubjects as z };
