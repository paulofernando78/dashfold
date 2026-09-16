import { Icon } from "@/components/ui/Icon";

export function WidgetContainer({ children }) {
  return <div className="flex gap-2">{children}</div>;
}
export const widgetHeight = `h-[416px]`;

// + WidgetPicker
export const widgetBorder = `
  border
  border-gray-500/80
  bg-linear-to-tl
  from-[#111417]
  to-[#222531]
  rounded-lg
`;

export const widgetInnerBorder = `
  p-2
  bg-linear-to-tl
  from-[#111417]
  to-[#222531]
  rounded-md
`;

export const widgetGlassMorphism = `
  h-[176px]  
  p-3
  rounded-xl
  border
  border-white/15
  bg-white/8
  backdrop-blur-md
  shadow-lg
  shadow-black/20
`;

export function WidgetCard({
  widgetClassName,
  iconName,
  onClose,
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
        ${widgetHeight}
        flex-col
        font-['Oswald_Variable']
        scroll-mr-2
        ${widgetBorder}
        ${isDragging ? "z-10 opacity-60" : ""}
      `}
    >
      <WidgetHeader
        iconName={iconName}
        onClose={onClose}
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

const windowControl = `
  grid
  place-items-center
  size-4
  rounded-full
  
`;

function WidgetHeader({ iconName, onClose, dragHandleRef }) {
  return (
    <div
      className="
        grid
        grid-cols-[1fr_auto_1fr]
        header"
    >
      <WindowControls onClose={onClose} />

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

function WindowControls({ onClose }) {
  return (
    <div
      className="
        flex
        gap-1.5
      "
    >
      <button
        type="button"
        title="close"
        aria-label="close widget"
        onClick={onClose}
        className={`${windowControl} bg-red-400`}
      >
        <Icon name="x" size={10} className="text-gray-600" />
      </button>
      <button
        type="button"
        title="maximize"
        aria-label="maximize widget"
        className={`${windowControl} bg-green-600`}
      >
        <Icon name="maximize2" size={10} />
      </button>
      {/* <button
        type="button"
        title="minimize"
        aria-label="minimize widget"
        className="window-control bg-yellow-500"
      >
        <Icon name="minus" size={10} />
      </button> */}
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
            text-3xl
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
