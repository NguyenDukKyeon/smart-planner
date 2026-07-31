import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
require_react();
require_jsx_dev_runtime();
var DASHBOARD_VIEWS = [
	"today",
	"weekly",
	"plan"
];
var PLAN_VIEWS = ["flex", "original"];
function includes(values, value) {
	return typeof value === "string" && values.includes(value);
}
/** Normalizes deep links without letting malformed query values reach the tab controls. */
function validateDashboardSearch(search) {
	const focusLesson = typeof search.focusLesson === "string" && search.focusLesson.trim().length > 0 ? search.focusLesson.trim().slice(0, 200) : void 0;
	return {
		view: includes(DASHBOARD_VIEWS, search.view) ? search.view : "today",
		plan: includes(PLAN_VIEWS, search.plan) ? search.plan : "flex",
		...focusLesson ? { focusLesson } : {}
	};
}
/**
* Pure, injectable loading boundary shared by dashboard lazy imports. The UI
* turns its error state into an accessible retry message without a test-only
* route or debug switch.
*/
async function loadLazyModule(importer) {
	try {
		return {
			status: "ready",
			value: await importer()
		};
	} catch (error) {
		return {
			status: "error",
			error: error instanceof Error ? error.message : "Không thể tải mô-đun này."
		};
	}
}
var $$splitComponentImporter = () => import("./routes-B6XoeI7p.mjs");
var Route = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Smart Study Planner — Không gian học tập cá nhân" },
		{
			name: "description",
			content: "Không gian học tập cá nhân: lập kế hoạch linh hoạt, theo dõi phiên tập trung và thói quen hằng ngày."
		},
		{
			property: "og:title",
			content: "Smart Study Planner — Không gian học tập cá nhân"
		},
		{
			property: "og:description",
			content: "Lập kế hoạch linh hoạt, tập trung và theo dõi tiến độ trong một ứng dụng cá nhân."
		}
	] }),
	validateSearch: validateDashboardSearch,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { loadLazyModule as i, PLAN_VIEWS as n, Route as r, DASHBOARD_VIEWS as t };
