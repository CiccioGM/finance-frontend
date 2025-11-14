import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MonthlyBarChart({ data }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          barCategoryGap="30%"
          barGap={0}
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(v) => v.toFixed(2)} />
          <Legend />
          {/* Entrate in verde, uscite in rosso, affiancate */}
          <Bar
            dataKey="entrate"
            name="Entrate"
            fill="#16a34a" // verde
            barSize={18}
          />
          <Bar
            dataKey="uscite"
            name="Uscite"
            fill="#dc2626" // rosso
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
