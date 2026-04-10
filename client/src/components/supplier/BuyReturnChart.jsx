import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Sep", bought: 420, returned: 25, cancelled: 10 },
  { month: "Oct", bought: 510, returned: 30, cancelled: 20 },
  { month: "Nov", bought: 380, returned: 18, cancelled: 8 },
  { month: "Dec", bought: 620, returned: 35, cancelled: 25 },
  { month: "Jan", bought: 550, returned: 20, cancelled: 15 },
  { month: "Feb", bought: 590, returned: 28, cancelled: 18 }
];

const BuyReturnChart = () => {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="bought" fill="#2cb1a5" />
          <Bar dataKey="returned" fill="#f4a100" />
          <Bar dataKey="cancelled" fill="#e63946" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BuyReturnChart;