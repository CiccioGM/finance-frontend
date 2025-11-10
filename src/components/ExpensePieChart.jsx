import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ExpensePieChart({ transactions }) {
  const grouped = transactions.reduce((acc, t) => {
    const amt = Number(t.amount) || 0;
    if (amt < 0) acc[t.category] = (acc[t.category] || 0) + Math.abs(amt);
    return acc;
  }, {});
  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));
  const COLORS = ["#FF8042", "#FFBB28", "#FF6666", "#AA66CC", "#0088FE", "#00C49F"];

  if (!data.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">📊 Uscite per categoria</h2>
        <p className="text-sm text-gray-500">Nessuna uscita registrata</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">📊 Uscite per categoria</h2>
      <PieChart width={300} height={220}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => `${Number(v).toFixed(2)}€`} />
      </PieChart>
    </div>
  );
}
