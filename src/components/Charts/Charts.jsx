import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const Charts = ({ type, data }) => {
  const chartData = Array.isArray(data) ? data : [];
  console.log("Data:" + data);
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" && (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip wrapperStyle={{ fontSize: "10px", padding: "3px" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
        {type === "bar" && (
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip wrapperStyle={{ fontSize: "10px", padding: "3px" }} />
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        )}
        {type === "sparkline" && (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <Tooltip wrapperStyle={{ fontSize: "10px", padding: "3px" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
        {type === "spiral" && (
          <RadialBarChart
            innerRadius="30%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={-180}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <RadialBar
              background={{ fill: "#444" }}
              clockWise={true}
              dataKey="value"
            />
            <Tooltip wrapperStyle={{ fontSize: "10px", padding: "3px" }} />
          </RadialBarChart>
        )}
        {type !== "line" &&
          type !== "bar" &&
          type !== "sparkline" &&
          type !== "spiral" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#aaa",
              }}
            >
              Chart type '{type}' not yet implemented.
            </div>
          )}
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
