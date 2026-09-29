
export type ComponentLoader<T = any> = () => Promise<{ default: T }>;

export interface ToolComponentProps {
  context?: unknown;
}

export interface ThemeMeta {
  id: string;
  name: string;
  loader: () => Promise<any>;
  path: string;
  module?: any;
}

export * from './registry';
