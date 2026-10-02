import { useEffect, useState, type ReactNode, isValidElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import navigation from "./docsNavigation.json";
import publication from "../publication.json";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectLogo } from "./ThemedImage";

const sources = import.meta.glob(["../../docs/*.md", "../../docs/studies/bimanual-*.md"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const repository = publication.repository_url + "/blob/main/";
const plain = (node: ReactNode): string => typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(plain).join("") : isValidElement<{ children?: ReactNode }>(node) ? plain(node.props.children) : "";
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return <div className="docs-code"><button type="button" aria-label="Copy command" onClick={async () => { try { await navigator.clipboard.writeText(plain(children)); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Copied" : "Copy"}</button><pre>{children}</pre></div>;
}
export default function Documentation() {
  const requested = new URLSearchParams(window.location.search).get("page") ?? "index";
  const active = navigation.find(p => p.id === requested);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const id = active?.id ?? "index";
  const text = sources[`../../docs/${id}.md`] ?? "# Documentation unavailable";
  const groups = [...new Set(navigation.map(p => p.group))];
  const headings = [...text.matchAll(/^## (.+)$/gm)].map(m => m[1]);
  const link = (href: string) => {
    if (/^(https?:|mailto:|#)/.test(href)) return href;
    const target = new URL(href, `https://local.invalid/docs/${id}.md`);
    const doc = target.pathname.match(/^\/docs\/(.+)\.md$/)?.[1];
    return doc && navigation.some(p => p.id === doc) ? `./?view=docs&page=${doc}${target.hash}` : repository + target.pathname.slice(1) + target.hash;
  };
  useEffect(() => { document.title = `${active?.title ?? "Page not found"} · WasserMan documentation`; if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView()); }, [active]);
  return <div className="documentation">
    <a href="#docs-content" className="skip-link">Skip to documentation</a>
    <header><div className="page-shell nav-shell"><a className="wordmark" href="./"><ProjectLogo />WasserMan</a><a href="./">Project website ↗</a><ThemeToggle /><button className="docs-menu" aria-expanded={menu} aria-controls="docs-sidebar" onClick={() => setMenu(!menu)}>Browse documentation</button></div></header>
    <div className="docs-layout page-shell">
      <aside id="docs-sidebar" className={menu ? "docs-sidebar open" : "docs-sidebar"}>
        <p className="eyebrow">Documentation</p><label className="docs-search">Find a guide<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Task, model, dataset…" /></label>
        <nav aria-label="Documentation guides">{groups.map(group => {
          const pages = navigation.filter(p => p.group === group && (p.title + " " + sources[`../../docs/${p.id}.md`]).toLowerCase().includes(query.toLowerCase()));
          return pages.length ? <div key={group}><h2>{group}</h2>{pages.map(p => <a key={p.id} href={`./?view=docs&page=${p.id}`} aria-current={id === p.id ? "page" : undefined}>{p.title}</a>)}</div> : null;
        })}</nav>
        {query && !navigation.some(p => (p.title + " " + sources[`../../docs/${p.id}.md`]).toLowerCase().includes(query.toLowerCase())) && <p role="status">No guides match this search.</p>}
      </aside>
      <main className="docs-content" id="docs-content">
        <div className="docs-breadcrumb">Documentation / {active?.group ?? "Unknown page"}</div>
        {!active && <p role="alert">This guide does not exist. Start from the documentation overview below.</p>}
        <Markdown remarkPlugins={[remarkGfm]} components={{
          a: ({ href, children }) => <a href={link(href ?? "")}>{children}</a>,
          h2: ({ children }) => <h2 id={slug(plain(children))}>{children}</h2>,
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children }) => <div className="table-scroll"><table>{children}</table></div>,
        }}>{text}</Markdown>
        <div className="docs-source"><a href={`${repository}docs/${id}.md`}>View Markdown source ↗</a><span>Versioned with the benchmark</span></div>
      </main>
      <aside className="docs-toc"><p>On this page</p>{headings.map(h => <a key={h} href={`#${slug(h)}`}>{h}</a>)}</aside>
    </div>
  </div>;
}
