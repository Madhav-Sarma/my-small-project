import type { OutputType } from "./types.js";

/**
 * Routes tool output to the correct editor / workspace component.
 *
 *   text_document  → TipTap editor
 *   code_project   → Monaco editor
 *   editable_image → Image editor / canvas
 *   raw_json       → JSON viewer
 *   file_download  → File download prompt
 */

interface RouteTarget {
  component: string;
  props: Record<string, unknown>;
}

export class OutputRouter {
  private routes = new Map<OutputType, (data: unknown) => RouteTarget>();

  constructor() {
    this.routes.set("text_document", (data) => ({
      component: "DocsEditor",
      props: { content: data },
    }));

    this.routes.set("code_project", (data) => ({
      component: "CodeEditor",
      props: { files: data },
    }));

    this.routes.set("editable_image", (data) => ({
      component: "ImageEditor",
      props: { imageUrl: data },
    }));

    this.routes.set("raw_json", (data) => ({
      component: "JsonViewer",
      props: { data },
    }));

    this.routes.set("file_download", (data) => ({
      component: "FileDownload",
      props: { file: data },
    }));
  }

  route(type: OutputType, data: unknown): RouteTarget {
    const resolver = this.routes.get(type);
    if (!resolver) {
      return { component: "JsonViewer", props: { data } };
    }
    return resolver(data);
  }

  registerRoute(type: OutputType, resolver: (data: unknown) => RouteTarget): void {
    this.routes.set(type, resolver);
  }
}
