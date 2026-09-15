import { useLanguage } from "@/i18n";

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex justify-between items-center gap-2 mb-6 p-2 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <img src="/assets/imgs/logo.svg"/>
        <h1 className="text-lg text-white font-bold uppercase">dashfold</h1>
      </div>
      <div className="space-x-2 font-bold">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
          className={`clickable clickable-label ${language === "en" ? "text-white" : "opacity-50"}`}
        >
          Eng
        </button>
        <button
          type="button"
          onClick={() => setLanguage("pt")}
          aria-pressed={language === "pt"}
          className={`clickable clickable-label ${language === "pt" ? "text-white" : "opacity-50"}`}
        >
          Por
        </button>
      </div>
    </div>
  );
}
