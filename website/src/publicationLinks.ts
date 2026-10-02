/** Static guides in publication builds; the existing portal in local development. */
export const docsHref = (target = "index") => {
  const [page, fragment] = target.split("#", 2);
  const staticDocs = import.meta.env.VITE_STATIC_DOCS === "1";
  const anchor = fragment ? `#${staticDocs ? fragment.replace(/-{2,}/g, "-") : fragment}` : "";
  return (staticDocs ? `./docs/${page === "index" ? "" : page + "/"}`
    : `./?view=docs${page === "index" ? "" : "&page=" + page}`) + anchor;
};
