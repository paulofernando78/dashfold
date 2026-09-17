import { useRef } from "react";
import { useLanguage } from "@/i18n";

import { Icon } from "@/components/ui/Icon";
import { Dialog } from "@/components/ui/Dialog";

import { widgetCatalog } from "./WidgetCatalog";

export function WidgetPicker({ onAdd }) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);

  const widgetsByCategory = Object.entries(widgetCatalog).reduce(
    // O reduce transforma grupos
    (categories, [widgetId, widget]) => {
      const category = widget.category;

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        widgetId,
        widget,
      });

      return categories;
    },
    {},
  );

  function handleAdd(type) {
    // Pede ao App para adicionar o widget selecionado.
    onAdd(type);

    // Fecha o elemento <dialog> depois da escolha.
    dialogRef.current?.close();
  }

  const widgetPickerBorder = `
    rounded!
  `;

  return (
    <div
      className="
        flex
        shrink-0
        gap-2
        overflow-hidden
      "
    >
      <button
        type="button"
        aria-label={t("addWidget")}
        onClick={() => dialogRef.current?.showModal()}
        className={`
          grid
          place-items-center
          h-full          
          `}
      >
        <Icon name="plus" />
      </button>
      <Dialog dialogRef={dialogRef} className="relative max-w-md">
        <div
          className={`
              flex
              flex-col
              gap-4
              pt-4
              pb-1
              font-['Oswald_Variable']
              uppercase
              overflow-y-auto
              `}
        >
          {Object.entries(widgetsByCategory).map(([category, widgets]) => (
            <section key={category}>
              <h3
                className="
                    mb-2
                    font-bold
                    text-lg
                  "
              >
                {t(category)}
              </h3>

              <div
                className="
                    flex
                    flex-col
                    gap-2
                  "
              >
                {widgets.map(({ widgetId, widget }) => (
                  <button
                    key={widgetId}
                    type="button"
                    onClick={() => handleAdd(widgetId)}
                    style={widget.widgetStyle}
                    className={`clickable ${widgetPickerBorder} bg-slate-500`}
                  >
                    <span className="uppercase">{t(widget.title)}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
