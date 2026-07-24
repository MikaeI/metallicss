export type MetallicssRoot = Document | DocumentFragment | Element;

export interface MetallicssRenderOptions {
  /** Re-render even when the element's geometry and material signature are unchanged. */
  force?: boolean;
}

export interface MetallicssMountOptions {
  /** Delay observer-driven renders by this many milliseconds. Defaults to 48. */
  debounce?: number;
  /** Attach mutation, resize, and visibility observers. Defaults to true. */
  observe?: boolean;
  /** Pause observer-driven rendering while the element is off-screen. Defaults to true. */
  visibility?: boolean;
}

export interface MetallicssController {
  readonly element: Element;
  /** Render immediately. The optional argument defaults to true. */
  render(force?: boolean): HTMLCanvasElement | null;
  /** Disconnect observers, cancel pending work, and remove the generated canvas. */
  destroy(): void;
}

export declare const presets: Readonly<{
  readonly silver: "#f4f7fa";
  readonly steel: "#d9e0e7";
  readonly chrome: "#ffffff";
  readonly gold: "#f5c451";
  readonly copper: "#cf7546";
  readonly lead: "#77818d";
  readonly titanium: "#a7a9b4";
  readonly gunmetal: "#53606d";
}>;

/** Render a metallic finish on one element. */
export declare function metallicss(
  element: Element,
  options?: MetallicssRenderOptions,
): HTMLCanvasElement | null;

/** Render an element and keep it synchronized with relevant browser changes. */
export declare function mount(
  element: Element,
  options?: MetallicssMountOptions,
): MetallicssController;

/** Destroy a managed renderer, returning whether any renderer was removed. */
export declare function unmount(element: Element): boolean;

/** Force all matching elements under a root to render again. */
export declare function refresh(root?: MetallicssRoot): number;

/** Manage current and future `.metallicss` descendants until disconnected. */
export declare function observe(
  root?: MetallicssRoot,
  options?: MetallicssMountOptions,
): () => void;

export default metallicss;
