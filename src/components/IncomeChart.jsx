import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function IncomeChart({ transactions }) {
  // Considera solo le entrate (amount > 0). Raggruppa per categoria.
  const grouped = transactions.reduce((acc, t) => {
    const amt = Number(t.amount) || 0;
    if (amt > 0) {
      acc[t.category] = (acc[t.category] || 0) + amt;
    }
    return acc;
  }, {});

  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  const COLORS = ["#00C49F", "#0088FE", "#AA66CC", "#FFBB28", "#66CC99", "#66A3FF"];

  if (!data.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">📈 Entrate per categoria</h2>
        <p className="text-sm text-gray-500">Nessuna entrata registrata</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">📈 Entrate per categoria</h2>
      <PieChart width={300} height={220}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}€`} />
      </PieChart>
    </div>
  );
}
