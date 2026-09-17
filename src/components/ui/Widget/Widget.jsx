import { Icon } from "@/components/ui/Icon";

export function WidgetContainer({ children }) {
  return <div className="flex gap-2">{children}</div>;
}

// + WidgetPicker
export const widgetBorder = `
  border
  border-gray-500/40
  gradient
  rounded-lg
`;

export const widgetInnerBorder = `
  p-2
  gradient
  rounded-md
`;

export function WidgetCard({
  widgetClassName,
  iconName,
  children,
  ref,
  dragHandleRef,
  isDragging,
}) {
  return (
    <article
      ref={ref}
      className={`
        flex-none
        flex
        flex-col
        h-104
        font-['Oswald_Variable']
        ${widgetBorder}
        ${isDragging ? "z-10 opacity-60" : ""}
      `}
    >
      <WidgetHeader
        iconName={iconName}
        dragHandleRef={dragHandleRef}
      />
      <div
        className={`
            min-h-0
            flex-1
            rounded-t-0
            rounded-bl-[7px]
            rounded-br-[7px]
            [text-shadow:0_0_6px_rgba(255,255,255,0.2)]
            ${widgetClassName}
            `}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </article>
  );
}

function WidgetHeader({ iconName, dragHandleRef }) {
  return (
    <div
      className="
        grid
        grid-cols-[1fr_auto_1fr]
        header"
    >
      <button
        ref={dragHandleRef}
        type="button"
        aria-label="Reorder widget"
        title="Reorder widget"
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <Icon name="gripHorizontal" />
      </button>

      <WidgetIcons iconName={iconName} className="justify-self-end" />
    </div>
  );
}

function WidgetIcons({ iconName, className }) {
  return (
    <div className={className}>
      <Icon name={iconName} cursorNone />
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
            h-full
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

export function WidgetControls({ children }) {
  return (
    <>
      <div
        className="
          flex
          gap-2          
        "
      >
        {children}
      </div>
    </>
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
      <Icon name={isRunning ? "circlePause" : "circlePlay"} />
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

WidgetControls.Info = ({ onClick, ...props }) => {
  return (
    <button type="button" onClick={onClick} {...props} className="clickable">
      <Icon name="info" />
    </button>
  );
};

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
