export type AppId =
  | "terminal"
  | "chrome"
  | "finder"
  | "notes"
  | "photos"
  | "mail"
  | "settings"
  | "about";

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** app-specific launch payload, e.g. which note or url to open */
  payload?: Record<string, string>;
}

export interface AppMeta {
  id: AppId;
  name: string;
  /** shown in the dock */
  inDock: boolean;
  /** shown on the desktop as an icon */
  onDesktop?: boolean;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  /** windows that shouldn't be resized (About This Mac) */
  fixed?: boolean;
}
