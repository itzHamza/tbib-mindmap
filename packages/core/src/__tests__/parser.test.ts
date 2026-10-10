import { describe, it, expect } from 'vitest';
import { parseMarkdownToTree } from '../parser';

describe('parseMarkdownToTree', () => {
  it('parses simple headings hierarchy', () => {
    const md = `
# Central Topic
## Subtopic 1
### Detail A
### Detail B
## Subtopic 2
`;
    const tree = parseMarkdownToTree(md);
    expect(tree.label).toBe('Central Topic');
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].label).toBe('Subtopic 1');
    expect(tree.children[0].children).toHaveLength(2);
    expect(tree.children[1].label).toBe('Subtopic 2');
  });

  it('parses nested markdown lists', () => {
    const md = `
# Root Item
- Branch 1
  - Leaf 1.1
  - Leaf 1.2
- Branch 2
`;
    const tree = parseMarkdownToTree(md);
    expect(tree.label).toBe('Root Item');
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].label).toBe('Branch 1');
    expect(tree.children[0].children).toHaveLength(2);
    expect(tree.children[0].children[0].label).toBe('Leaf 1.1');
  });

  it('handles empty markdown gracefully', () => {
    const tree = parseMarkdownToTree('');
    expect(tree.label).toBe('Empty Mindmap');
    expect(tree.children).toHaveLength(0);
  });
});
