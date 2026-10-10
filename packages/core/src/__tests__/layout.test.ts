import { describe, it, expect } from 'vitest';
import { parseMarkdownToTree } from '../parser';
import { computeLayout, getBoundingBox } from '../layout';

describe('computeLayout', () => {
  const md = `
# Main Node
## Branch A
### Item 1
## Branch B
`;

  it('computes Horizontal layout coordinates correctly', () => {
    const tree = parseMarkdownToTree(md);
    const layout = computeLayout(tree, 'Horizontal');

    expect(layout.x).toBe(0);
    expect(layout.y).toBeDefined();
    expect(layout.children[0].x).toBeGreaterThan(layout.x!);
    expect(layout.children[0].children[0].x).toBeGreaterThan(layout.children[0].x!);

    const bbox = getBoundingBox(layout);
    expect(bbox.maxX).toBeGreaterThan(bbox.minX);
    expect(bbox.maxY).toBeGreaterThan(bbox.minY);
  });

  it('computes Center layout distributing children left and right', () => {
    const tree = parseMarkdownToTree(md);
    const layout = computeLayout(tree, 'Center');

    expect(layout.x).toBe(0);
    // At least one branch goes to the right, and if >= 2, one goes to left
    const rightSide = layout.children.filter((c) => c.side === 'right');
    const leftSide = layout.children.filter((c) => c.side === 'left');

    expect(rightSide.length).toBeGreaterThan(0);
    expect(leftSide.length).toBeGreaterThan(0);
  });
});
