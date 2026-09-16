import { useState, useId } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";

import { Icon } from "@/components/ui/Icon";

export function SectionPanel({
  title,
  children,
  defaultOpen = true,
  storageKey,
  count,
  headerAction
}) {
  const headingId = useId();
  const dragScroll = useDragScroll();
  const [isOpen, setIsOpen] = useState(() => {
    if (!storageKey) return defaultOpen;

    const savedValue = localStorage.getItem(storageKey);

    if (savedValue === null) return defaultOpen;

    return savedValue === "true";
  });

  function handleToggle() {
    setIsOpen((current) => {
      const next = !current;

      if (storageKey) {
        localStorage.setItem(storageKey, String(next));
      }

      return next;
    });
  }

  return (
    <section
      aria-labelledby={headingId}
      className={`
        p-2
        w-full
        bg-gray-100/10
        rounded-2xl
      `}
    >
      <header
        className={`
          flex
          items-center
          justify-between
          text-lg
          font-bold
           ${isOpen ? "pb-3" : ""}
          `}
      >
        {/* ChevronUpDown */}
        <button
          type="button"
          onClick={handleToggle}
          className="
            flex-1
            flex
            items-center
            gap-2
          "
        >
          <Icon name={isOpen ? "chevronsDownUp" : "chevronsUpDown"} size={23} />

          <h2 id={headingId}>{title}</h2>

          {count !== undefined && <span className="ml-1">{count}</span>}
        </button>

        {headerAction}
      </header>

      {isOpen && (
        <div
          {...dragScroll}
          className="
            flex
            gap-2
            p-2
            bg-gray-100/10
            rounded-xl
            overflow-x-auto
            no-scrollbar
            cursor-grab
            active:cursor-grabbing
            select-none
            touch-pan-x
          "
        >
          {children}
        </div>
      )}
    </section>
  );
}
