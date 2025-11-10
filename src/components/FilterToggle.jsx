export default function FilterToggle({ value = "tutte", onChange }) {
  return (
    <div className="bg-white p-2 rounded-lg shadow flex gap-2">
      <button
        onClick={() => onChange("tutte")}
        className={`flex-1 p-2 rounded text-sm font-medium ${value === "tutte" ? "bg-blue-500 text-white" : "bg-transparent"}`}
      >
        Tutte
      </button>
      <button
        onClick={() => onChange("entrate")}
        className={`flex-1 p-2 rounded text-sm font-medium ${value === "entrate" ? "bg-green-500 text-white" : "bg-transparent"}`}
      >
        Entrate
      </button>
      <button
        onClick={() => onChange("uscite")}
        className={`flex-1 p-2 rounded text-sm font-medium ${value === "uscite" ? "bg-red-500 text-white" : "bg-transparent"}`}
      >
        Uscite
      </button>
    </div>
  );
}
