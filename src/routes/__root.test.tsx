import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { RootErrorState, RootNotFoundState } from "./__root";

describe("root recovery states", () => {
  test("renders actionable Vietnamese not-found copy", () => {
    const markup = renderToStaticMarkup(<RootNotFoundState />);

    expect(markup).toContain("Không tìm thấy trang");
    expect(markup).toContain("Về trang hôm nay");
    expect(markup).toContain('href="/"');
  });

  test("renders an actionable, semantic Vietnamese root error", () => {
    const markup = renderToStaticMarkup(<RootErrorState />);

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Không thể tải trang này");
    expect(markup).toContain("Thử lại");
    expect(markup).toContain("Về trang hôm nay");
  });
});
