export type LayoutType = 'Horizontal' | 'Center';
export type NodeVariant = 'filled' | 'stroke' | 'outline' | 'glass';
export type NodeSide = 'left' | 'right';

export interface TreeNode {
  id: string;
  label: string;
  depth: number;
  children: TreeNode[];
  collapsed?: boolean;
  /** Which side of the root this subtree sits on (Center layout only) */
  side?: NodeSide;
  // Computed layout properties
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface DepthTokens {
  background: string;
  color: string;
  borderColor: string;
}

export const DEPTH_INLINE_STYLES: DepthTokens[] = [
  // depth 1 — Root: Deep Indigo
  { background: '#4f46e5', color: '#ffffff', borderColor: '#4338ca' },
  // depth 2 — Level 1: Muted Indigo
  { background: '#e0e7ff', color: '#1e1b4b', borderColor: '#c7d2fe' },
  // depth 3 — Level 2: Soft Sage
  { background: '#ecfdf5', color: '#064e3b', borderColor: '#d1fae5' },
  // depth 4 — Level 3: Warm Sand
  { background: '#fff7ed', color: '#431407', borderColor: '#fed7aa' },
  // depth 5+ — Level 4: Pale Slate
  { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' },
];

export const DEPTH_INLINE_STYLES_DARK: DepthTokens[] = [
  // depth 1 — Root: Deep Indigo
  { background: '#4338ca', color: '#ffffff', borderColor: '#6366f1' },
  // depth 2 — Level 1: Indigo Slate
  { background: '#1e1b4b', color: '#e0e7ff', borderColor: '#312e81' },
  // depth 3 — Level 2: Forest
  { background: '#064e3b', color: '#d1fae5', borderColor: '#065f46' },
  // depth 4 — Level 3: Dark Amber
  { background: '#451a03', color: '#fed7aa', borderColor: '#78350f' },
  // depth 5+ — Level 4: Slate Dark
  { background: '#1e293b', color: '#e2e8f0', borderColor: '#334155' },
];

export const STROKE_TOKENS: DepthTokens = {
  background: '#ffffff',
  color: '#0f172a',
  borderColor: '#6366f1',
};

export const GLASS_TOKENS: DepthTokens = {
  background: 'rgba(255, 255, 255, 0.7)',
  color: '#0f172a',
  borderColor: '#e2e8f0',
};
