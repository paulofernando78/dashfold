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
        snap-start
        snap-always
        widget-card-scale
        font-['Oswald_Variable']
        card-style
        ${widgetClassName}
        ${isDragging ? "z-10 opacity-60" : ""}
      `}
    >
      <div className="widget-scale-layer flex h-full flex-col">
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

WidgetControls.Edit = ({ isEditing, onEdit, onConfirm }) => {
  return isEditing ? (
    <button onClick={onConfirm} className="clickable">
      <Icon name="check" />
    </button>
  ) : (
    <button onClick={onEdit} className="clickable">
      <Icon name="squarePen" />
    </button>
  );
};

function WidgetInfo({ children, dialogClassName, ...props }) {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        {...props}
        className="clickable"
      >
        <Icon name="info" />
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

WidgetControls.Info = WidgetInfo;

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
