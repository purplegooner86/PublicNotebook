import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";

import { useState } from "react";

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#FFFFFF"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={fill}>{`Count: ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

function genFilterFunction(color) {
  return ( b ) => {
    return b !== color;
  }
}

const PieChartS = ({isDashboard = false, butterfliesIn = []}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  var possibleColors = [
    colors.greenAccent[500],
    colors.greenAccent[400],
    colors.greenAccent[300],
    colors.blueAccent[500],
    colors.blueAccent[400],
    colors.blueAccent[300],
    colors.redAccent[500],
    colors.redAccent[400],
    colors.redAccent[300],
    "#E06C75",
    "#98C379",
    "#E5C07B",
    "#61AFEF",
    "#C678DD",
    "#56B6C2"
  ]

  const [activeIndex, setActiveIndex] = useState([]);

  const pieData = {}

  for (var e in butterfliesIn) {
    if ( !(butterfliesIn[e]['species'] in pieData) ) {
      pieData[butterfliesIn[e]['species']] = 0;
    }
    pieData[butterfliesIn[e]['species']] += 1;
  }

  const pieDataFormatted = [];

  for (var i in pieData) {
    var color = possibleColors[
      Math.abs(
        i.split('')
        .reduce(
          (hashCode, currentVal) =>
          (hashCode = currentVal.charCodeAt(0) + (hashCode << 6) + (hashCode << 16) - hashCode), 0
        ) % possibleColors.length 
      )
    ]

    if (possibleColors.length > 1) {
      possibleColors = possibleColors.filter(genFilterFunction(color))
    }

    pieDataFormatted.push({
      name: i,
      value: pieData[i],
      fill: color,
    })
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={pieDataFormatted}
          cx="50%"
          cy="50%"
          innerRadius={isDashboard ? 60 : 120}
          outerRadius={isDashboard ? 80 : 140}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
          stroke="none"
        />
      </PieChart>
    </ResponsiveContainer>
  )
};

export default PieChartS;
