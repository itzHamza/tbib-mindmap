/* eslint-disable @typescript-eslint/no-explicit-any */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { TreeNode } from './types';

let idCounter = 0;
const makeId = () => `node-${idCounter++}`;

const extractText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
  if (node.children) return node.children.map(extractText).join('');
  return '';
};

/**
 * Recursively parse a remark list node into TreeNodes.
 */
const parseList = (listNode: any, depth: number): TreeNode[] => {
  return (listNode.children || []).map((listItem: any) => {
    const paragraphNode = listItem.children?.[0];
    const label = extractText(paragraphNode || listItem).trim() || 'Item';

    const children: TreeNode[] = [];

    (listItem.children || []).forEach((child: any) => {
      if (child.type === 'list') {
        children.push(...parseList(child, depth + 1));
      }
    });

    return {
      id: makeId(),
      label,
      depth,
      children,
    } satisfies TreeNode;
  });
};

/**
 * Parses markdown headings and nested lists into a TreeNode hierarchy.
 */
export const parseMarkdownToTree = (markdown: string): TreeNode => {
  idCounter = 0;

  if (!markdown || !markdown.trim()) {
    return {
      id: 'root',
      label: 'Empty Mindmap',
      depth: 0,
      children: [],
    };
  }

  const ast = unified().use(remarkParse).parse(markdown);

  const root: TreeNode = {
    id: 'root',
    label: 'Root',
    depth: 0,
    children: [],
  };

  const stack: TreeNode[] = [root];

  (ast.children as any[]).forEach((node) => {
    if (node.type === 'heading') {
      const depth = node.depth as number;
      const label = extractText(node) || 'Untitled';

      const newNode: TreeNode = {
        id: makeId(),
        label,
        depth,
        children: [],
      };

      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(newNode);
      stack.push(newNode);
    } else if (node.type === 'list') {
      const parent = stack[stack.length - 1];
      const items = parseList(node, parent.depth + 1);
      parent.children.push(...items);
    }
  });

  if (root.children.length === 0) {
    root.label = 'No valid content found';
  }

  return root.children.length === 1 ? root.children[0] : root;
};
