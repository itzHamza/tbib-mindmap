import { TreeNode, LayoutType, BoundingBox } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_NODE_WIDTH = 140;
const MAX_NODE_WIDTH = 320;
const NODE_PADDING_H = 32;
const CHAR_WIDTH = 7.5;
const LINE_HEIGHT = 22;
const NODE_PADDING_V = 16;
const H_GAP = 60; // horizontal gap between parent right-edge and child left-edge
const V_GAP = 14; // vertical gap between sibling nodes

// ─── Dimension helpers ────────────────────────────────────────────────────────
export const getNodeWidth = (label: string): number =>
  Math.min(
    MAX_NODE_WIDTH,
    Math.max(MIN_NODE_WIDTH, (label?.length || 0) * CHAR_WIDTH + NODE_PADDING_H)
  );

export const getNodeHeight = (label: string, width: number): number => {
  const charsPerLine = Math.floor((width - NODE_PADDING_H) / CHAR_WIDTH) || 1;
  return Math.max(
    40,
    Math.ceil((label?.length || 0) / charsPerLine) * LINE_HEIGHT + NODE_PADDING_V
  );
};

export const assignDimensions = (n: TreeNode): void => {
  n.width = getNodeWidth(n.label);
  n.height = getNodeHeight(n.label, n.width);
  n.children?.forEach(assignDimensions);
};

export const getBoundingBox = (node: TreeNode): BoundingBox => {
  let minX = node.x ?? 0;
  let minY = node.y ?? 0;
  let maxX = (node.x ?? 0) + (node.width ?? 0);
  let maxY = (node.y ?? 0) + (node.height ?? 0);

  if (!node.collapsed && node.children) {
    for (const child of node.children) {
      const b = getBoundingBox(child);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    }
  }
  return { minX, minY, maxX, maxY };
};

// ─── Shared Y measurement ─────────────────────────────────────────────────────
const measureSubtreeY = (
  nodes: TreeNode[],
  startY = 0
): { centers: number[]; endY: number } => {
  let cursor = startY;
  const centers: number[] = [];

  const measure = (n: TreeNode): number => {
    if (!n.children?.length || n.collapsed) {
      n.y = cursor;
      cursor += (n.height ?? 40) + V_GAP;
      return n.y + (n.height ?? 40) / 2;
    }
    const childCenters = n.children.map(measure);
    const mid = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    n.y = mid - (n.height ?? 40) / 2;
    return mid;
  };

  for (const node of nodes) {
    centers.push(measure(node));
  }

  return { centers, endY: cursor };
};

// ─── X assignment ─────────────────────────────────────────────────────────────
const assignRightX = (n: TreeNode, startX: number) => {
  n.x = startX;
  if (!n.collapsed && n.children) {
    const nextX = startX + (n.width ?? MIN_NODE_WIDTH) + H_GAP;
    n.children.forEach((c) => assignRightX(c, nextX));
  }
};

const assignLeftX = (n: TreeNode, rightEdge: number) => {
  n.x = rightEdge - (n.width ?? MIN_NODE_WIDTH);
  if (!n.collapsed && n.children) {
    const nextRightEdge = n.x - H_GAP;
    n.children.forEach((c) => assignLeftX(c, nextRightEdge));
  }
};

const markSide = (n: TreeNode, side: 'left' | 'right') => {
  n.side = side;
  n.children?.forEach((c) => markSide(c, side));
};

const shiftY = (n: TreeNode, dy: number) => {
  if (n.y !== undefined) n.y += dy;
  n.children?.forEach((c) => shiftY(c, dy));
};

// ─── Layout strategies ────────────────────────────────────────────────────────
const computeHorizontalLayout = (root: TreeNode): TreeNode => {
  measureSubtreeY([root]);
  assignRightX(root, 0);

  const minY = root.y ?? 0;
  if (minY < 0) shiftY(root, -minY);

  return root;
};

const computeCenterLayout = (root: TreeNode): TreeNode => {
  const children = root.children ?? [];
  const splitIdx = Math.ceil(children.length / 2);
  const rightChildren = children.slice(0, splitIdx);
  const leftChildren = children.slice(splitIdx);

  rightChildren.forEach((c) => markSide(c, 'right'));
  leftChildren.forEach((c) => markSide(c, 'left'));

  const { centers: rCenters } = measureSubtreeY(rightChildren, 0);
  const { centers: lCenters } = measureSubtreeY(leftChildren, 0);

  const rMid =
    rCenters.length > 0 ? (rCenters[0] + rCenters[rCenters.length - 1]) / 2 : 0;
  const lMid =
    lCenters.length > 0 ? (lCenters[0] + lCenters[lCenters.length - 1]) / 2 : 0;

  const rootCenterY =
    rightChildren.length > 0 && leftChildren.length > 0
      ? (rMid + lMid) / 2
      : rightChildren.length > 0
      ? rMid
      : lMid;

  root.y = rootCenterY - (root.height ?? 40) / 2;
  root.x = 0;

  if (leftChildren.length > 0 && rightChildren.length > 0) {
    const dy = rMid - lMid;
    leftChildren.forEach((c) => shiftY(c, dy));
  }

  const rootRightEdge = root.width ?? MIN_NODE_WIDTH;
  rightChildren.forEach((c) => assignRightX(c, rootRightEdge + H_GAP));
  leftChildren.forEach((c) => assignLeftX(c, -H_GAP));

  const allNodes: TreeNode[] = [];
  const collect = (n: TreeNode) => {
    allNodes.push(n);
    n.children?.forEach(collect);
  };
  collect(root);

  const minY = Math.min(...allNodes.map((n) => n.y ?? 0));
  if (minY < 0) {
    allNodes.forEach((n) => {
      if (n.y !== undefined) n.y -= minY;
    });
  }

  return root;
};

export const computeLayout = (
  node: TreeNode,
  type: LayoutType = 'Horizontal'
): TreeNode => {
  assignDimensions(node);
  return type === 'Center'
    ? computeCenterLayout(node)
    : computeHorizontalLayout(node);
};
