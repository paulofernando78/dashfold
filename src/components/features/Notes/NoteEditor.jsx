import { useRef, useState } from "react";

import { CheckboxIcon } from "@/components/ui/CheckboxIcon";
import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";

function createNoteBlock(type = "text", content = "") {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    checked: false,
    url: "",
    title: "",
  };
}

export function NoteEditor({ blocks: savedBlocks = [], onChange }) {
  const inputRefs = useRef(new Map());
  const [blocks, setBlocks] = useState(() =>
    savedBlocks.length ? savedBlocks : [createNoteBlock()],
  );
  const blocksRef = useRef(blocks);
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? null);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  function commit(nextBlocks, recordHistory = true) {
    if (recordHistory) {
      setPast((current) => [...current, blocksRef.current]);
      setFuture([]);
    }
    blocksRef.current = nextBlocks;
    setBlocks(nextBlocks);
    onChange?.(nextBlocks);
  }

  function updateBlock(id, changes) {
    commit(
      blocksRef.current.map((block) =>
        block.id === id ? { ...block, ...changes } : block,
      ),
    );
  }

  function changeType(type) {
    if (!selectedId) return;
    updateBlock(selectedId, {
      type,
      checked: type === "checkbox" ? false : undefined,
      url: type === "link" ? "" : undefined,
      title: type === "link" ? "" : undefined,
    });
    requestAnimationFrame(() => inputRefs.current.get(selectedId)?.focus());
  }

  function handleKeyDown(event, index) {
    if (event.key === "Enter") {
      event.preventDefault();
      const current = blocksRef.current[index];
      const next = createNoteBlock(current.type === "link" ? "text" : current.type);
      const nextBlocks = [...blocksRef.current];
      nextBlocks.splice(index + 1, 0, next);
      commit(nextBlocks);
      setSelectedId(next.id);
      requestAnimationFrame(() => inputRefs.current.get(next.id)?.focus());
      return;
    }

    if (
      event.key !== "Backspace" ||
      event.currentTarget.value !== "" ||
      index === 0
    ) return;

    event.preventDefault();
    const previous = blocksRef.current[index - 1];
    commit(blocksRef.current.filter((_, blockIndex) => blockIndex !== index));
    setSelectedId(previous.id);
    requestAnimationFrame(() => inputRefs.current.get(previous.id)?.focus());
  }

  async function resolveLink(block) {
    const url = normalizeUrl(block.content);
    if (!url) return;
    let title = getHostname(url);
    let resolvedUrl = url;
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const preview = await response.json();
        title = preview.title || title;
        resolvedUrl = preview.url || url;
      }
    } catch {
      // The hostname is kept when the site blocks metadata requests.
    }
    updateBlock(block.id, { content: resolvedUrl, url: resolvedUrl, title });
  }

  function undo() {
    if (!past.length) return;
    const previous = past.at(-1);
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [...current, blocksRef.current]);
    commit(previous, false);
  }

  function redo() {
    if (!future.length) return;
    const next = future.at(-1);
    setFuture((current) => current.slice(0, -1));
    setPast((current) => [...current, blocksRef.current]);
    commit(next, false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-36 flex-1 space-y-1 overflow-y-auto py-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="flex min-w-0 items-start gap-2">
            {block.type === "checkbox" && (
              <CheckboxIcon
                checked={block.checked}
                onChange={() => updateBlock(block.id, { checked: !block.checked })}
                ariaLabel={block.content || "Task"}
                className="mt-1 shrink-0"
              />
            )}
            {block.type === "link" && block.url ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 py-1">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-blue-400 underline"
                >
                  {block.title || getHostname(block.url)}
                </a>
                <button
                  type="button"
                  aria-label="Edit link"
                  onClick={() => updateBlock(block.id, { url: "", title: "" })}
                >
                  <Icon name="squarePen" size={17} />
                </button>
              </div>
            ) : (
              <TextInput
                inputRef={(element) => {
                  if (element) inputRefs.current.set(block.id, element);
                  else inputRefs.current.delete(block.id);
                }}
                value={block.content}
                onFocus={() => setSelectedId(block.id)}
                onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                onBlur={() => block.type === "link" && resolveLink(block)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                placeholder={block.type === "link" ? "Paste a URL..." : "Write something..."}
                className={`w-full flex-1 bg-transparent text-gray-100 ${
                  block.type === "checkbox" && block.checked
                    ? "text-gray-500 line-through"
                    : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-700 pt-2">
        <div className="flex items-center gap-1">
          <EditorButton label="Text" icon="type" onClick={() => changeType("text")} />
          <EditorButton label="Checklist" icon="squareCheck" onClick={() => changeType("checkbox")} />
          <EditorButton label="Link" icon="link2" onClick={() => changeType("link")} />
        </div>
        <div className="flex items-center gap-1">
          <EditorButton label="Undo" icon="undo" onClick={undo} disabled={!past.length} />
          <EditorButton label="Redo" icon="redo" onClick={redo} disabled={!future.length} />
        </div>
      </div>
    </div>
  );
}

function EditorButton({ label, icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md p-2 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

function normalizeUrl(value) {
  const url = value.trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function getHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
