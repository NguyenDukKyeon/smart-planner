import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { registerPwaServiceWorker, setupPwaInstallPrompt } from "../lib/pwa-client";

/** Presentational so the copy and semantics can be verified without a router error trigger. */
export function RootNotFoundState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4"
      aria-labelledby="not-found-title"
    >
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 id="not-found-title" className="mt-4 text-xl font-semibold text-foreground">
          Không tìm thấy trang
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Đường dẫn này không tồn tại hoặc đã được chuyển. Bạn có thể quay lại không gian học tập.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Về trang hôm nay
          </a>
        </div>
      </div>
    </main>
  );
}

export function RootErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4"
      role="alert"
      aria-labelledby="root-error-title"
    >
      <div className="max-w-md text-center">
        <h1 id="root-error-title" className="text-xl font-semibold tracking-tight text-foreground">
          Không thể tải trang này
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hãy thử tải lại nội dung hoặc quay về trang hôm nay. Dữ liệu đã lưu của bạn không bị xóa.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Về trang hôm nay
          </a>
        </div>
      </div>
    </main>
  );
}

function NotFoundComponent() {
  return <RootNotFoundState />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  if (typeof window !== "undefined") {
    try {
      reportLovableError(error, { boundary: "tanstack_root_error_component" });
    } catch {
      // ignore
    }
  }

  return (
    <RootErrorState
      onRetry={() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        } else {
          reset();
        }
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Không gian học tập cá nhân" },
      {
        name: "description",
        content:
          "Lập kế hoạch học tập, theo dõi phiên tập trung và duy trì thói quen theo nhịp độ của bạn.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Không gian học tập cá nhân" },
      {
        property: "og:description",
        content: "Lập kế hoạch học tập, theo dõi phiên tập trung và thói quen hằng ngày.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#e0f2fe" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Study Planner" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    void registerPwaServiceWorker();
    return setupPwaInstallPrompt();
  }, []);

  useEffect(() => {
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

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
