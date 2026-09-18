import { Icon } from "@/components/ui/Icon";

export function Dialog({ dialogRef, children, className = "" }) {
  function handleClose() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`
        max-w-200
        w-[calc(100vw-1rem)]
        h-[calc(100dvh-20rem)]
        m-auto
        px-3
        pt-[0.6rem]
        pb-1.5
        text-white
        text-left
        font-['Montserrat_Variable',sans-serif]
        normal-case
        bg-[#111417]
        border
        border-gray-500/90
        rounded-lg
        backdrop:bg-black/70
        ${className}
      `}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={handleClose}
        className="
          absolute
          top-2
          right-2
          z-10
          grid
          h-8
          w-8
          cursor-pointer
          place-items-center
          rounded-md
          hover:bg-white/10
        "
      >
        <Icon name="x" />
      </button>
      {children}
    </dialog>
  );
}
