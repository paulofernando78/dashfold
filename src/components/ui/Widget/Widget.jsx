import { useRef } from "react";

import { Icon } from "@/components/ui/Icon";
import { Dialog } from "@/components/ui/Dialog";

export function WidgetContainer({ children }) {
  return <div className="flex w-max gap-2">{children}</div>;
}

export function WidgetCard({
  widgetClassName,
  baseWidth = 254,
  iconName,
  children,
  ref,
  dragHandleRef,
  isDragging,
}) {
  return (
    <article
      ref={ref}
      style={{
        "--widget-base-width": `${baseWidth}px`,
        "--widget-base-height": "440px",
      }}
      className={`
        flex-none
        h-auto
        sm:h-110
        widget-card-scale
        [perspective:1000px]
        font-['Oswald_Variable']
        card-style
        ${widgetClassName}
        ${isDragging ? "z-10 opacity-60" : ""}
      `}
    >
      <div className="widget-scale-layer flex h-full flex-col [backface-visibility:hidden]">
        <WidgetHeader iconName={iconName} dragHandleRef={dragHandleRef} />
        <div
          className={`
            min-h-0
            flex-1
            [text-shadow:0_0_6px_rgba(255,255,255,0.2)]
            `}
        >
          <div
            className="
            flex
            h-full
            min-h-0
            flex-col
          "
          >
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

function WidgetHeader({ dragHandleRef }) {
  return (
    <div
      className="
        text-center
        h-9
        p-2
      "
    >
      {/* <WidgetIcons iconName={iconName} className="justify-self-start" /> */}
      <button
        ref={dragHandleRef}
        type="button"
        aria-label="Reorder widget"
        title="Reorder widget"
        className="
          cursor-grab
          touch-none
          active:cursor-grabbing"
      >
        <Icon name="gripHorizontal" />
      </button>
    </div>
  );
}

export function WidgetBody({
  top,
  middlePosition,
  middle,
  subMiddle,
  bottomPosition,
  bottom,
  className,
}) {
  return (
    <div
      className={`
        flex
        flex-col
        gap-4
        h-full
        p-4
        ${className ?? ""}
      `}
    >
      {top && (
        <div
          className="
            w-full
            text-center
            text-[2.9rem]
            font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]
            font-bold
            leading-none
          "
        >
          {top}
        </div>
      )}
      {middle && (
        <div
          className={`
            flex
            flex-col
            ${middlePosition === "top" ? "justify-start" : "justify-center"}
            flex-1
            w-full
            min-h-0
          `}
        >
          {middle}
        </div>
      )}
      {subMiddle && (
        <div
          className="
          flex
          flex-col
          items-center
        "
        >
          {subMiddle}
        </div>
      )}
      {bottom && (
        <div
          className={`
            ${
              bottomPosition === "left"
                ? "flex-1 w-full min-h-0 self-start"
                : "self-center"
            }
          `}
        >
          {bottom}
        </div>
      )}
    </div>
  );
}

export function WidgetControls({ children, compact = false }) {
  return (
    <div
      className={`
        flex
        ${compact ? "gap-1 [&>button]:p-1" : "gap-2"}
      `}
    >
      {children}
    </div>
  );
}

WidgetControls.Add = ({ onClick }) => {
  return (
    <button onClick={onClick} className="clickable">
      <Icon name="plus" />
    </button>
  );
};

WidgetControls.Play = ({ isRunning, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:cursor-not-allowed disabled:opacity-40 clickable"
    >
      <Icon name={isRunning ? "pause" : "play"} />
    </button>
  );
};

WidgetControls.Sound = ({ isSoundEnabled, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
      title={isSoundEnabled ? "Mute sound" : "Enable sound"}
      className="w-max clickable"
    >
      <Icon name={isSoundEnabled ? "volume2" : "volumeOff"} />
    </button>
  );
};

WidgetControls.Toggle = ({ checked, onChange, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={`
        relative
        h-6
        w-11
        shrink-0
        rounded-full
        border
        transition-colors
        duration-200
        ${checked
          ? "border-blue-400 bg-blue-500"
          : "border-gray-600 bg-gray-700"}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          absolute
          top-0.5
          left-0.5
          size-4.5
          rounded-full
          bg-white
          shadow
          transition-transform
          duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
};

WidgetControls.Reset = ({ onClick }) => {
  return (
    <button onClick={onClick} className="clickable">
      <Icon name="rotateCcw" />
    </button>
  );
};

WidgetControls.Undo = ({ onClick }) => {
  return (
    <button onClick={onClick} className="clickable">
      <Icon name="undo" />
    </button>
  );
};

WidgetControls.Redo = ({ onClick }) => {
  return (
    <button onClick={onClick} className="clickable">
      <Icon name="redo" />
    </button>
  );
};

async function flipWidget(event, action) {
  const trigger = event.currentTarget;
  const widget = event.currentTarget.closest("article");
  const content = widget?.querySelector(".widget-scale-layer");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!content || reduceMotion) {
    action();
    return;
  }

  if (content.dataset.flipping === "true") return;

  content.dataset.flipping = "true";
  trigger.disabled = true;
  let exitAnimation;
  let enterAnimation;

  try {
    exitAnimation = content.animate(
      [
        { transform: "rotateY(0deg)", opacity: 1 },
        { transform: "rotateY(90deg)", opacity: 0.35 },
      ],
      {
        duration: 180,
        easing: "ease-in",
        fill: "forwards",
      },
    );

    await exitAnimation.finished;
    exitAnimation.cancel();

    content.style.transform = "rotateY(-90deg)";
    content.style.opacity = "0.35";

    action();

    await new Promise((resolve) => requestAnimationFrame(resolve));

    enterAnimation = content.animate(
      [
        { transform: "rotateY(-90deg)", opacity: 0.35 },
        { transform: "rotateY(0deg)", opacity: 1 },
      ],
      {
        duration: 220,
        easing: "ease-out",
        fill: "forwards",
      },
    );

    await enterAnimation.finished;

    content.style.transform = "rotateY(0deg)";
    content.style.opacity = "1";
    enterAnimation.cancel();
  } finally {
    exitAnimation?.cancel();
    enterAnimation?.cancel();
    content.style.removeProperty("transform");
    content.style.removeProperty("opacity");
    delete content.dataset.flipping;
    trigger.disabled = false;
  }
}

WidgetControls.Edit = ({ isEditing, onEdit, onConfirm }) => {
  const action = isEditing ? onConfirm : onEdit;

  return isEditing ? (
    <button
      type="button"
      onClick={(event) => flipWidget(event, action)}
      className="clickable"
    >
      <Icon name="check" />
    </button>
  ) : (
    <button
      type="button"
      onClick={(event) => flipWidget(event, action)}
      className="clickable"
    >
      <Icon name="squarePen" />
    </button>
  );
};

function WidgetEllipsis({ children, dialogClassName, ...props }) {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        {...props}
        className="clickable"
      >
        <Icon name="ellipsis" />
      </button>

      <Dialog
        dialogRef={dialogRef}
        className={`relative space-y-4 ${dialogClassName ?? ""}`}
      >
        {children}
      </Dialog>
    </>
  );
}

WidgetControls.Ellipsis = WidgetEllipsis;

WidgetControls.Delete = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="clickable"
      aria-label="Delete"
      title="Delete"
    >
      <Icon name="trash" />
    </button>
  );
};
