import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";

import { Header } from "@/components/layout/Header";

export function Home() {
  const { t } = useLanguage();
  return (
    <main
      className="
        grid
        text-white
      "
    >
      <Header />
      <div className="mt-15 text-center">
        <h1 className="mb-4 text-5xl font-bold">DASHFOLD</h1>
        <p className="mb-8 text-gray-300">{t("homeDescription")}</p>
        <Link
          to="/dashboard"
          className="
            inline-flex
            px-6
            py-3
            w-[99.8px]
            font-bold
            bg-blue-600
            rounded-lg
            hover:bg-blue-500
          "
        >
          {t("login")}
        </Link>
      </div>
    </main>
  );
}
