import { useState, useEffect, useRef } from "react";

import "./App.css";
import { Header } from "@/components/layout/Header";

import { SectionPanel } from "@/components/ui/SectionPanel";

//Calendar
// import { Calendar } from "@/components/features/Calendar";

// Widget / ui
import { WidgetContainer, WidgetCard } from "@/components/ui/Widget";
// Widget / features
import { widgetCatalog, WidgetPicker } from "@/components/features/Widget";

// Taskboard
import { TaskBoard } from "@/components/features/TaskBoard";

// Notes
// import { Notes } from "@/components/features/Notes";

import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";

const WIDGETS_STORAGE_KEY = "widgets";

function createDefaultWidgets() {
  return [
    {
      id: crypto.randomUUID(),
      type: "clock",
      config: { ...widgetCatalog.clock.defaultConfig },
    },
  ];
}

function getSavedWidgets() {
  const savedWidgets = localStorage.getItem(WIDGETS_STORAGE_KEY);

  if (!savedWidgets) return createDefaultWidgets();

  try {
    return JSON.parse(savedWidgets);
  } catch {
    return createDefaultWidgets();
  }
}

function SortableWidget({
  widgetInstance,
  definition,
  index,
  onRemove,
  onConfigChange,
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: widgetInstance.id,
    index,
  });

  const Component = definition.Component;

  return (
    <WidgetCard
      ref={ref}
      dragHandleRef={handleRef}
      widgetClassName={definition.widgetClassName}
      iconName={definition.iconName}
      onClose={onRemove}
      isDragging={isDragging}
    >
      <Component
        {...widgetInstance.config}
        onConfigChange={onConfigChange}
        onClose={onRemove}
      />
    </WidgetCard>
  );
}

function App() {
  const [widgets, setWidgets] = useState(getSavedWidgets);
  const widgetPickerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    widgetPickerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
  }, [widgets.length]);

  function addWidget(type) {
    const definition = widgetCatalog[type];

    if (!definition) return;

    const newWidget = {
      id: crypto.randomUUID(),
      type,
      config: { ...definition.defaultConfig },
    };

    setWidgets((currentWidgets) => [...currentWidgets, newWidget]);
  }

  function removeWidget(id) {
    setWidgets((currentWidgets) =>
      currentWidgets.filter((widget) => widget.id !== id),
    );
  }

  function updateWidgetConfig(id, nextConfig) {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === id
          ? { ...widget, config: { ...widget.config, ...nextConfig } }
          : widget,
      ),
    );
  }

  function handleDragEnd(event) {
    if (event.canceled || !event.operation.target) return;

    setWidgets((currentWidgets) => move(currentWidgets, event));
  }

  return (
    <div
      className="
        flex flex-col
        gap-6
        w-full
        max-w-301
        min-h-screen
        mx-auto p-3
      "
    >
      <Header />

      {/* Calendar */}
      {/* <SectionPanel title="Calendar" storageKey="section-calendar">
        <Calendar />
      </SectionPanel> */}

      {/* Widgets */}
      <SectionPanel
        title="Widgets"
        widgetClassName
        storageKey="section-widget"
        count={widgets.length}
      >
        <DragDropProvider onDragEnd={handleDragEnd}>
          <WidgetContainer>
            {widgets.map((widgetInstance, index) => {
              const definition = widgetCatalog[widgetInstance.type];

              return (
                <SortableWidget
                  key={widgetInstance.id}
                  widgetInstance={widgetInstance}
                  definition={definition}
                  index={index}
                  onRemove={() => removeWidget(widgetInstance.id)}
                  onConfigChange={(nextConfig) =>
                    updateWidgetConfig(widgetInstance.id, nextConfig)
                  }
                />
              );
            })}
            <WidgetPicker ref={widgetPickerRef} onAdd={addWidget} />
          </WidgetContainer>
        </DragDropProvider>
      </SectionPanel>

      {/* Task Board */}
      <SectionPanel title="Task Board" storageKey="section-task-board">
        <TaskBoard />
      </SectionPanel>

      {/* Notes */}
      {/* <SectionPanel title="Notes" storageKey="section-notes">
        <Notes />
        <Notes />
      </SectionPanel> */}
    </div>
  );
}

export default App;
