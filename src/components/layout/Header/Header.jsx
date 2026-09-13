export function Header() {
  return (
    <div className="flex justify-between items-center gap-2 mb-6 p-2 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <img src="/assets/imgs/logo.svg"/>
        <h1 className="text-lg text-white font-bold uppercase">dashfold</h1>
      </div>
      <div className="space-x-2 font-bold">
        <button className="clickable clickable-label">Eng</button>
        <button className="clickable clickable-label">Por</button>
      </div>
    </div>
  );
}
