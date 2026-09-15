import { useEffect, useState } from "react";

const csvUrl = "/assets/data/purchases.csv";

import {
  WidgetBody,
  widgetGlassMorphism,
  // WidgetControls,
} from "@/components/ui/Widget";

import { Icon } from "@/components/ui/Icon";
import { CheckboxIcon } from "@/components/ui/CheckboxIcon";

// const purchase = [
//   {
//     id: "1",
//     date: "2026-09-12",
//     merchant: "iFood",
//     paymentMethod: "Google Pay",
//     currency: "BRL",
//     amount: 129.9,
//   },
//   {
//     id: 2,
//     date: "2026-09-11",
//     merchant: "Amazon",
//     paymentMethod: "Itaú",
//     currency: "BRL",
//     amount: 89.9,
//   },
//   {
//     id: 3,
//     date: "2026-09-10",
//     merchant: "Mercado Livre",
//     paymentMethod: "Bradesco",
//     currency: "BRL",
//     amount: 25.9,
//   },
// ];

export function Purchases() {
  // const [isEditing, setIsEditing] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    async function loadPurchases() {
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      const lines = csvText.trim().split("\n");
      const [, ...rows] = lines;

      const parsedPurchases = rows.map((row) => {
        const [id, date, time, merchant, paymentMethod, currency, amount] =
          row.split(",");

        return {
          id: Number(id),
          date,
          time,
          merchant,
          paymentMethod,
          currency,
          amount: Number(amount),
        };
      });

      setPurchases(parsedPurchases);
    }
    loadPurchases();
  }, []);

  function handleToggle(id) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      return nextIds;
    });
  }

  // function handleReset() {
  //   // setIsEditing(false);
  // }

  return (
    <WidgetBody
      middlePosition="top"
      middle={
        <div className="grid gap-2 overflow-y-auto">
          {purchases.map((purchase) => {
            const formattedAmount = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: purchase.currency,
            }).format(purchase.amount);

            const isSelected = selectedIds.has(purchase.id)
            const itemColor = isSelected ? "text-gray-500" : "text-gray-300"

            return (
              <div
                key={purchase.id}
                className={`
                  ${widgetGlassMorphism}
                  relative
                  grid
                  gap-1
                  text-sm
                  ${isSelected ? "text-gray-500" : "text-white"}
                `}
              >
                <CheckboxIcon
                  checked={isSelected}
                  onChange={() => handleToggle(purchase.id)}
                  ariaLabel={`Select purchase from ${purchase.merchant}`}
                  className="purchase-item"
                />
                <div className="flex gap-2 items-center">
                  <Icon
                    name="calendar"
                    size={18}
                    className={itemColor}
                  />
                  <span>{purchase.date}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Icon
                    name="clock"
                    size={18}
                    className={itemColor}
                  />
                  <span>{purchase.time}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Icon
                    name="store"
                    size={18}
                    className={itemColor}
                  />
                  <span>{purchase.merchant}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Icon
                    name="walletCards"
                    size={18}
                    className={itemColor}
                  />
                  <span>{purchase.paymentMethod}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Icon
                    name="receipt"
                    size={18}
                    className={itemColor}
                  />
                  <span>{formattedAmount}</span>
                </div>
              </div>
            );
          })}
        </div>
      }
      // bottom={
      //   <WidgetControls>
      //     <WidgetControls.Reset onClick={handleReset} />
      //   </WidgetControls>
      // }
    />
  );
}
