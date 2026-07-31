import { AlertTriangle, Download, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StorageRecoveryIssue = {
  key: string;
  label: string;
  status: "invalid" | "unavailable";
  error: string;
  raw?: string;
  canRestore?: boolean;
};

type Props = {
  issues: StorageRecoveryIssue[];
  onRetry: () => void;
  onRestore?: (key: string) => void;
  onScopedReset?: (key: string) => void;
};

function downloadRaw(key: string, raw: string) {
  const blob = new Blob([raw], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${key}-raw-recovery.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** A blocking, persistent panel: normal interactions must not imply a saved state. */
export function StorageRecoveryPanel({ issues, onRetry, onRestore, onScopedReset }: Props) {
  if (issues.length === 0) return null;

  return (
    <section
      className="mx-auto mb-4 max-w-7xl rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-semibold">Dữ liệu cần được khôi phục trước khi tiếp tục</h2>
            <p className="mt-1 text-sm">
              Các thay đổi mới đang bị chặn để tránh ghi đè hoặc thông báo thành công sai.
            </p>
          </div>
          {issues.map((issue) => (
            <div key={issue.key} className="rounded-xl border border-amber-200 bg-white/70 p-3">
              <p className="font-medium">{issue.label}</p>
              <p className="mt-1 text-sm">{issue.error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {issue.raw !== undefined && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadRaw(issue.key, issue.raw!)}
                  >
                    <Download className="h-4 w-4" /> Xuất bản gốc
                  </Button>
                )}
                {issue.canRestore && onRestore && (
                  <Button size="sm" variant="outline" onClick={() => onRestore(issue.key)}>
                    <RotateCcw className="h-4 w-4" /> Khôi phục bản sao lưu
                  </Button>
                )}
                {issue.status === "invalid" && onScopedReset && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Xóa riêng dữ liệu lỗi “${issue.label}”? Bản gốc sẽ được lưu để hoàn tác.`,
                        )
                      ) {
                        onScopedReset(issue.key);
                      }
                    }}
                  >
                    Xóa phạm vi này
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Thử lại bộ nhớ trình duyệt
          </Button>
        </div>
      </div>
    </section>
  );
}
