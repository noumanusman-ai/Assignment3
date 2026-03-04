import type { ChatMessage } from "@/types";

/**
 * Build a linear message path from root to a specific leaf.
 * If no leafId is provided, follows the last sibling at each level.
 */
export function buildMessagePath(
  allMessages: ChatMessage[],
  leafId?: string
): ChatMessage[] {
  if (allMessages.length === 0) return [];

  // Build lookup maps
  const byId = new Map<string, ChatMessage>();
  const childrenOf = new Map<string | null, ChatMessage[]>();

  for (const msg of allMessages) {
    byId.set(msg.id, msg);
    const parentKey = msg.parentId;
    if (!childrenOf.has(parentKey)) {
      childrenOf.set(parentKey, []);
    }
    childrenOf.get(parentKey)!.push(msg);
  }

  // Sort children by siblingIndex
  for (const [, childList] of childrenOf) {
    childList.sort((a: ChatMessage, b: ChatMessage) => a.siblingIndex - b.siblingIndex);
  }

  // If leafId is provided, walk up to root then reverse
  if (leafId) {
    const path: ChatMessage[] = [];
    let current = byId.get(leafId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return path;
  }

  // Otherwise, walk down from root following the last child at each level
  const path: ChatMessage[] = [];
  const roots = childrenOf.get(null) || [];
  if (roots.length === 0) return [];

  let current: ChatMessage | undefined = roots[roots.length - 1];
  while (current) {
    path.push(current);
    const ch: ChatMessage[] = childrenOf.get(current.id) || [];
    current = ch.length > 0 ? ch[ch.length - 1] : undefined;
  }

  return path;
}

/**
 * Get siblings of a message (messages with the same parentId).
 */
export function getSiblings(
  allMessages: ChatMessage[],
  messageId: string
): ChatMessage[] {
  const msg = allMessages.find((m) => m.id === messageId);
  if (!msg) return [];

  return allMessages
    .filter((m) => m.parentId === msg.parentId && m.role === msg.role)
    .sort((a, b) => a.siblingIndex - b.siblingIndex);
}

/**
 * Given a message path and a switch to a different sibling,
 * return a new path that follows the new sibling's branch.
 */
export function switchBranch(
  allMessages: ChatMessage[],
  currentPath: ChatMessage[],
  messageId: string,
  direction: "prev" | "next"
): ChatMessage[] {
  const siblings = getSiblings(allMessages, messageId);
  const currentIdx = siblings.findIndex((s) => s.id === messageId);
  if (currentIdx === -1) return currentPath;

  const newIdx =
    direction === "prev"
      ? Math.max(0, currentIdx - 1)
      : Math.min(siblings.length - 1, currentIdx + 1);

  if (newIdx === currentIdx) return currentPath;

  const newSibling = siblings[newIdx];

  // Rebuild path: keep everything before this message's position, then follow new branch
  const msgIndex = currentPath.findIndex((m) => m.id === messageId);
  const prefix = currentPath.slice(0, msgIndex);

  // Follow the new sibling's branch down
  const byId = new Map(allMessages.map((m) => [m.id, m]));
  const childrenOf = new Map<string | null, ChatMessage[]>();
  for (const msg of allMessages) {
    const key = msg.parentId;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(msg);
  }
  for (const [, childList] of childrenOf) {
    childList.sort((a: ChatMessage, b: ChatMessage) => a.siblingIndex - b.siblingIndex);
  }

  const tail: ChatMessage[] = [];
  let current: ChatMessage | undefined = newSibling;
  while (current) {
    tail.push(current);
    const ch: ChatMessage[] = childrenOf.get(current.id) || [];
    current = ch.length > 0 ? ch[ch.length - 1] : undefined;
  }

  return [...prefix, ...tail];
}
