import publication from "../publication.json";
import { docsHref } from "./publicationLinks";
import "./project-footer.css";
import { ProjectLogo } from "./ThemedImage";

export function ProjectFooter() {
  return <footer className="project-footer">
    <div className="project-footer-inner">
      <div className="project-footer-identity">
        <a className="project-footer-brand" href="./"><ProjectLogo /><strong>WasserMan</strong></a>
        <p>A modular simulation suite for underwater manipulation policy learning.</p>
      </div>
      <nav aria-label="Project resources"><strong>Explore and reproduce</strong><a href={publication.repository_url}>WasserMan on GitHub ↗</a><a href={docsHref()}>Documentation ↗</a></nav>
      <div className="project-footer-credit"><p>© 2026 WasserMan contributors</p><a href={`${publication.repository_url}/blob/main/LICENSE`}>Apache 2.0 ↗</a></div>
    </div>
  </footer>;
}
