import { useRef, useState } from "react";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";

import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";
import { CheckboxIcon } from "@/components/ui/CheckboxIcon";

function createBlock(type = "text", content = "") {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    checked: false,
  };
}

export function QuickNotes({
  note = "",
  blocks: savedBlocks = [],
  onConfigChange,
  onClose,
}) {
  const inputRefs = useRef(new Map());
  const [openMenu, setOpenMenu] = useState(false);
  const [blocks, setBlocks] = useState(() =>
    savedBlocks.length > 0 ? savedBlocks : [createBlock("text", note)],
  );
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  function handleOpenMenu() {
    setOpenMenu((current) => !current);
  }

  function handleAddBlock(type) {
    const newBlock = createBlock(type);

    const hasOnlyOneEmptyBlock =
      blocks.length === 1 && blocks[0].content.trim() === "";

    const nextBlocks = hasOnlyOneEmptyBlock
      ? [newBlock]
      : [...blocks, newBlock];

    saveBlocks(nextBlocks);
    setOpenMenu(false);

    requestAnimationFrame(() => {
      inputRefs.current.get(newBlock.id)?.focus();
    });
  }

  function handleBlockKeyDown(event, blockIndex) {
    if (event.key === "Enter") {
      event.preventDefault();

      const currentBlock = blocks[blockIndex];
      const newBlock = createBlock(currentBlock.type);

      const nextBlocks = [...blocks];

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
    setPast((currentPast) => [...currentPast, blocks]);
    setFuture([]);
    setBlocks(nextBlocks);
    onConfigChange?.({ blocks: nextBlocks });
  }

  function updateBlock(id, changes) {
    const nextBlocks = blocks.map((block) =>
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

  function handleUndo() {
    if (past.length === 0) return;

    const previousBlocks = past.at(-1);

    setPast((currentPast) => currentPast.slice(0, -1));
    setFuture((currentFuture) => [...currentFuture, blocks]);
    setBlocks(previousBlocks);
    onConfigChange?.({ blocks: previousBlocks });
  }

  function handleRedo() {
    if (future.length === 0) return;

    const nextBlocks = future.at(-1);

    setFuture((currentFuture) => currentFuture.slice(0, -1));
    setPast((currentPast) => [...currentPast, blocks]);
    setBlocks(nextBlocks);
    onConfigChange?.({ blocks: nextBlocks });
  }

  function handleReset() {
    saveBlocks([createBlock()]);
  }

  return (
    <WidgetBody
      onClose={onClose}
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

              <TextInput
                inputRef={(element) => {
                  if (element) {
                    inputRefs.current.set(block.id, element);
                  } else {
                    inputRefs.current.delete(block.id);
                  }
                }}
                value={block.content}
                onChange={(event) =>
                  updateBlock(block.id, {
                    content: event.target.value,
                  })
                }
                onKeyDown={(event) => handleBlockKeyDown(event, blockIndex)}
                placeholder={block.type === "checkbox" ? "..." : "..."}
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
            </div>
          ))}
        </div>
      }
      bottom={
        <WidgetControls>
          <div className="relative">
            {openMenu && (
              <div
                className="
                  absolute
                  bottom-12
                  grid
                  gap-2
                  p-2
                  bg-[#333333]
                  rounded
                  z-10
                "
              >
                <button
                  type="button"
                  onClick={() => handleAddBlock("text")}
                  className="flex items-center gap-2 p-1 rounded hover:bg-gray-600"
                >
                  <Icon name="type" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock("checkbox")}
                  className="flex items-center gap-2 p-1 rounded hover:bg-gray-600"
                >
                  <Icon name="squareCheck" />
                  <span>Checkbox</span>
                </button>
              </div>
            )}
            <WidgetControls.Add onClick={handleOpenMenu} />
          </div>
          <WidgetControls.Undo onClick={handleUndo} />
          <WidgetControls.Redo onClick={handleRedo} />
          <WidgetControls.Reset onClick={handleReset} />
        </WidgetControls>
      }
    />
  );
}
