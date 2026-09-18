import { useState, useEffect, useRef } from "react";

import "@/App.css";
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
import { Notes } from "@/components/features/Notes";

import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { useLanguage } from "@/i18n";

const WIDGETS_STORAGE_KEY = "widgets";
const NOTES_STORAGE_KEY = "notes";

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
    const parsedWidgets = JSON.parse(savedWidgets).map((widget) => ({
      ...widget,
      type: widget.type === "tabata" ? "hiit" : widget.type,
    }));

    migrateQuickNotes(parsedWidgets);

    return parsedWidgets.filter((widget) => widget.type !== "quickNotes");
  } catch {
    return createDefaultWidgets();
  }
}

function migrateQuickNotes(widgets) {
  const quickNotes = widgets.filter((widget) => widget.type === "quickNotes");
  if (!quickNotes.length) return;

  let savedNotes = [];
  try {
    const parsedNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "[]");
    if (Array.isArray(parsedNotes)) savedNotes = parsedNotes;
  } catch {
    savedNotes = [];
  }

  const migratedNotes = quickNotes
    .filter((widget) => !savedNotes.some((note) => note.id === `quick-note-${widget.id}`))
    .map((widget) => {
      const now = new Date().toISOString();
      return {
        id: `quick-note-${widget.id}`,
        title: "",
        blocks: widget.config?.blocks?.length
          ? widget.config.blocks
          : [{ id: crypto.randomUUID(), type: "text", content: widget.config?.note || "", checked: false, url: "", title: "" }],
        color: "#111417",
        favorite: false,
        pinned: false,
        archived: false,
        deleted: false,
        folder: "",
        createdAt: now,
        updatedAt: now,
      };
    });

  if (migratedNotes.length) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([...migratedNotes, ...savedNotes]));
  }
}

function SortableWidget({
  widgetInstance,
  definition,
  index,
  onDelete,
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
      baseWidth={definition.baseWidth}
      iconName={definition.iconName}
      isDragging={isDragging}
    >
      <Component
        {...widgetInstance.config}
        onConfigChange={onConfigChange}
        onDelete={onDelete}
      />
    </WidgetCard>
  );
}

export function Dashboard() {
  const { t } = useLanguage();
  const [widgets, setWidgets] = useState(getSavedWidgets);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  const widgetsEndRef = useRef(null);
  const shouldScrollToEndRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    if (!shouldScrollToEndRef.current) return;

    widgetsEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });

    shouldScrollToEndRef.current = false;
  }, [widgets.length]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const greetingKey = getGreetingsKey(currentHour);

  function addWidget(type) {
    const definition = widgetCatalog[type];

    if (!definition) return;

    const newWidget = {
      id: crypto.randomUUID(),
      type,
      config: { ...definition.defaultConfig },
    };

    shouldScrollToEndRef.current = true;
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

  function getGreetingsKey(hour) {
    if (hour < 12) return "goodMorning";
    if (hour < 18) return "goodAfternoon";
    return "goodEvening";
  }

  return (
    <>
      <Header />
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
        <h2 className="text-3xl font-bold mb-8">
          {t(greetingKey)}, Paulo.
        </h2>
        {/* Calendar */}
        {/* <SectionPanel title="Calendar" storageKey="section-calendar">
          <Calendar />
        </SectionPanel> */}

        {/* Widgets */}
        <SectionPanel
          title={t("widgets")}
          storageKey="section-widget"
          count={widgets.length}
          headerAction={<WidgetPicker onAdd={addWidget} />}
          snap
        >
          <DragDropProvider onDragEnd={handleDragEnd}>
            <WidgetContainer>
              {widgets.map((widgetInstance, index) => {
                const definition = widgetCatalog[widgetInstance.type];
                if (!definition) return null;

                return (
                  <SortableWidget
                    key={widgetInstance.id}
                    widgetInstance={widgetInstance}
                    definition={definition}
                    index={index}
                    onDelete={() => removeWidget(widgetInstance.id)}
                    onConfigChange={(nextConfig) =>
                      updateWidgetConfig(widgetInstance.id, nextConfig)
                    }
                  />
                );
              })}
              <div
                ref={widgetsEndRef}
                className="w-px shrink-0 "
                aria-hidden="true"
              />
            </WidgetContainer>
          </DragDropProvider>
        </SectionPanel>

        {/* Task Board */}
        <SectionPanel title={t("taskBoard")} storageKey="section-task-board">
          <TaskBoard />
        </SectionPanel>

        {/* Notes */}
        <SectionPanel title={t("notes")} storageKey="section-notes">
          <Notes />
        </SectionPanel>
      </div>
    </>
  );
}

export default Dashboard;
