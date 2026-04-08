import Link from "next/link";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

function buildHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export default function Pagination({ basePath, page, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...visiblePages]
    .filter(n => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const pageItems: Array<number | "ellipsis"> = [];
  pages.forEach((current, index) => {
    const previous = pages[index - 1];
    if (previous && current - previous > 1) pageItems.push("ellipsis");
    pageItems.push(current);
  });

  return (
    <nav aria-label="Pagination" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Page {page} of {totalPages}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Link
          href={buildHref(basePath, Math.max(1, page - 1), query)}
          aria-disabled={page === 1}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-light)",
            background: page === 1 ? "var(--surface-hover)" : "var(--surface-base)",
            color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: "none",
            pointerEvents: page === 1 ? "none" : "auto",
            opacity: page === 1 ? 0.6 : 1,
          }}
        >
          Previous
        </Link>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
          ) : (
            <Link
              key={item}
              href={buildHref(basePath, item, query)}
              aria-current={item === page ? "page" : undefined}
              style={{
                minWidth: 40,
                textAlign: "center",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: item === page ? "var(--brand-primary)" : "var(--surface-base)",
                color: item === page ? "white" : "var(--text-primary)",
                textDecoration: "none",
                fontWeight: item === page ? 700 : 500,
              }}
            >
              {item}
            </Link>
          )
        )}

        <Link
          href={buildHref(basePath, Math.min(totalPages, page + 1), query)}
          aria-disabled={page === totalPages}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-light)",
            background: page === totalPages ? "var(--surface-hover)" : "var(--surface-base)",
            color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: "none",
            pointerEvents: page === totalPages ? "none" : "auto",
            opacity: page === totalPages ? 0.6 : 1,
          }}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
