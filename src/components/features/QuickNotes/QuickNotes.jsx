import { useRef, useState } from "react";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";

import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";
import { CheckboxIcon } from "@/components/ui/CheckboxIcon";

export function QuickNotes({
  note = "",
  blocks: savedBlocks = [],
  onConfigChange,
  onDelete,
}) {
  const inputRefs = useRef(new Map());
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTargetBlockId, setMenuTargetBlockId] = useState(null);
  const [blocks, setBlocks] = useState(() =>
    savedBlocks.length > 0 ? savedBlocks : [createBlock("text", note)],
  );
  const blocksRef = useRef(blocks);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  function handleAddBlock(type) {
    // Se nenhuma linha estiver selecionada, não faz nada.
    if (!menuTargetBlockId) return;

    const nextBlocks = blocks.map((block) => {
      // Mantém as outras linhas sem alteração.
      if (block.id !== menuTargetBlockId) {
        return block;
      }

      // Altera somente o tipo da linha selecionada.
      return {
        ...block,
        type,
        checked: type === "checkbox" ? block.checked : false,
      };
    });

    saveBlocks(nextBlocks);

    // Retorna o foco para a mesma linha.
    requestAnimationFrame(() => {
      inputRefs.current.get(menuTargetBlockId)?.focus();
    });
  }

  function handleBlockKeyDown(event, blockIndex) {
    if (event.key === "Enter") {
      event.preventDefault();

      const currentBlock = blocksRef.current[blockIndex];

      // Depois de concluir um link, volta ao modo de escrita normal.
      // Texto e checkbox continuam repetindo o tipo atual.
      const nextBlockType = currentBlock.type === "link" ? "text" : currentBlock.type;
      const newBlock = createBlock(nextBlockType);

      const nextBlocks = [...blocksRef.current];

      nextBlocks.splice(blockIndex + 1, 0, newBlock);

      saveBlocks(nextBlocks);

      requestAnimationFrame(() => {
        inputRefs.current.get(newBlock.id)?.focus();
      });

      return;
    }

    const isEmptyBackspace =
      event.key === "Backspace" && event.currentTarget.value === "";

    if (!isEmptyBackspace || blockIndex === 0) return;

    event.preventDefault();

    const previousBlock = blocks[blockIndex - 1];

    const nextBlocks = blocks.filter((_, index) => index !== blockIndex);

    saveBlocks(nextBlocks);

    requestAnimationFrame(() => {
      const previousInput = inputRefs.current.get(previousBlock.id);

      previousInput?.focus();

      previousInput?.setSelectionRange(
        previousInput.value.length,
        previousInput.value.length,
      );
    });
  }

  function saveBlocks(nextBlocks) {
    setPast((currentPast) => [...currentPast, blocksRef.current]);
    setFuture([]);
    blocksRef.current = nextBlocks;
    setBlocks(nextBlocks);
    onConfigChange?.({ blocks: nextBlocks });
  }

  function updateBlock(id, changes) {
    const nextBlocks = blocksRef.current.map((block) =>
      block.id === id ? { ...block, ...changes } : block,
    );

    saveBlocks(nextBlocks);
  }

  function toggleBlock(id) {
    const nextBlocks = blocks.map((block) =>
      block.id === id ? { ...block, checked: !block.checked } : block,
    );

    saveBlocks(nextBlocks);
  }

  async function loadLinkTitle(blockId, value) {
    const url = normalizeUrl(value);

    if (!url) return;

    let title = getUrlHostname(url);
    let resolvedUrl = url;

    try {
      const response = await fetch(
        `/api/link-preview?url=${encodeURIComponent(url)}`,
      );

      if (response.ok) {
        const preview = await response.json();
        title = preview.title || title;
        resolvedUrl = preview.url || url;
      }
    } catch {
      // Some sites block metadata requests. The hostname remains a useful label.
    }

    updateBlock(blockId, {
      content: resolvedUrl,
      url: resolvedUrl,
      title,
    });
  }

  function handleEditLink(block) {
    updateBlock(block.id, {
      content: block.url || block.content,
      url: "",
      title: "",
    });

    requestAnimationFrame(() => {
      inputRefs.current.get(block.id)?.focus();
    });
  }

  function handleUndo() {
    if (past.length === 0) return;

    const previousBlocks = past.at(-1);

    setPast((currentPast) => currentPast.slice(0, -1));
    setFuture((currentFuture) => [...currentFuture, blocks]);
    blocksRef.current = previousBlocks;
    setBlocks(previousBlocks);
    onConfigChange?.({ blocks: previousBlocks });
  }

  function handleRedo() {
    if (future.length === 0) return;

    const nextBlocks = future.at(-1);

    setFuture((currentFuture) => currentFuture.slice(0, -1));
    setPast((currentPast) => [...currentPast, blocks]);
    blocksRef.current = nextBlocks;
    setBlocks(nextBlocks);
    onConfigChange?.({ blocks: nextBlocks });
  }

  function handleReset() {
    saveBlocks([createBlock()]);
  }

  return (
    <WidgetBody
      middlePosition="top"
      middle={
        <div
          className="
            flex
            flex-col
            w-full
            min-w-0
            overflow-y-auto
          "
        >
          {blocks.map((block, blockIndex) => (
            <div
              key={block.id}
              className="
                flex
                items-center
                gap-2
                w-full
                max-w-full
                min-w-1
              "
            >
              {block.type === "checkbox" && (
                <CheckboxIcon
                  checked={block.checked}
                  onChange={() => toggleBlock(block.id)}
                  ariaLabel={block.content || "Task..."}
                  className="self-start mt-[0.1rem] shrink-0"
                />
              )}
              {block.type === "link" && block.url ? (
                <div
                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-1
                  "
                >
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onFocus={() => setMenuTargetBlockId(block.id)}
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-blue-700
                      underline
                    "
                    title={block.url}
                  >
                    {block.title || getUrlHostname(block.url)}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleEditLink(block)}
                    className="
                      shrink-0
                      rounded
                      p-1
                    text-gray-500 hover:bg-black/10"
                    aria-label={`Edit ${block.title || block.url}`}
                    title="Edit link"
                  >
                    <Icon name="squarePen" size={16} />
                  </button>
                </div>
              ) : (
                <TextInput
                  inputRef={(element) => {
                    if (element) {
                      inputRefs.current.set(block.id, element);
                    } else {
                      inputRefs.current.delete(block.id);
                    }
                  }}
                  onFocus={() => setMenuTargetBlockId(block.id)}
                  value={block.content}
                  onChange={(event) =>
                    updateBlock(block.id, {
                      content: event.target.value,
                    })
                  }
                  onBlur={() => {
                    if (block.type === "link") {
                      loadLinkTitle(block.id, block.content);
                    }
                  }}
                  onKeyDown={(event) => {
                    handleBlockKeyDown(event, blockIndex);
                  }}
                  placeholder={block.type === "link" ? "Paste a URL..." : "..."}
                  className={`
                    flex-1
                    min-w-0
                    ${
                      block.type === "checkbox" && block.checked
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      }
      bottom={
        <>
          <QuickNotesMenu
            handleAddBlock={handleAddBlock}
            // handleCloseMenu={handleCloseMenu}
          />
          <WidgetControls>
            <WidgetControls.Undo onClick={handleUndo} />
            <WidgetControls.Redo onClick={handleRedo} />
            <WidgetControls.Reset onClick={handleReset} />
            <WidgetControls.Delete onClick={onDelete} />
          </WidgetControls>
        </>
      }
    />
  );
}

function createBlock(type = "text", content = "") {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    checked: false,
    url: "",
    title: "",
  };
}

function normalizeUrl(value) {
  const url = value.trim();

  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function getUrlHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function QuickNotesMenu({ handleAddBlock }) {
  return (
    <>
      {/* <hr className="bg-black" /> */}
      <div
        className="
          flex
          gap-2
          w-44
          py-2
          border-t border-gray-300
        "
      >
        <button
          type="button"
          onClick={() => handleAddBlock("text")}
          className="flex items-center gap-2 p-1 rounded hover:bg-gray-600"
        >
          <Icon name="type" className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock("checkbox")}
          className="flex items-center gap-2 p-1 rounded hover:bg-gray-600"
        >
          <Icon name="squareCheck" className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock("link")}
          className="flex items-center gap-2 p-1 rounded hover:bg-gray-600"
        >
          <Icon name="link2" className="text-gray-400" />
        </button>
      </div>
    </>
  );
}
