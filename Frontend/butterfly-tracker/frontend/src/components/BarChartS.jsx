import { useTheme } from "@mui/material";
import { tokens } from "../theme";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const BarChartS = ({ isDashboard = false, butterfliesIn = [] }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const barData = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  var uniqueButterflies = [];

  for (var e in butterfliesIn) {
    var dateOf = new Date(butterfliesIn[e]['date']);
    if ( uniqueButterflies.indexOf(butterfliesIn[e]['species']) === -1 ) {
      uniqueButterflies.push(butterfliesIn[e]['species']);
      for (let i = 0; i < 12; i++) {
        barData[i][butterfliesIn[e]['species']] = 0;
      }
    }
    barData[dateOf.getMonth()][butterfliesIn[e]['species']] += 1;
  }

  const barDataFormatted = [];

  for (var monthData in barData) {
    barDataFormatted.push(
      Object.assign(
        {},
        {month: months[monthData]},
        barData[monthData]
      )
    )
  }

  const possibleColors = [
    colors.greenAccent[500],
    colors.greenAccent[400],
    colors.greenAccent[300],
    colors.greenAccent[200],
    colors.greenAccent[100],
    colors.blueAccent[500],
    colors.blueAccent[400],
    colors.blueAccent[300],
    colors.blueAccent[200],
    colors.blueAccent[100],
    colors.redAccent[500],
    colors.redAccent[400],
    colors.redAccent[300],
    colors.redAccent[200],
    colors.redAccent[100],
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={barDataFormatted}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="month" />
        <YAxis />
        { isDashboard || <Tooltip 
          contentStyle={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary
          }}
          cursor={false}
        /> }
        <Legend />
        {
          uniqueButterflies.map((butterfly) => {
            return <Bar
              key={`bar_${butterfly}`}
              dataKey={`${butterfly}`}
              stackId="a"
              fill={`${possibleColors[
                Math.abs(
                  butterfly.split('')
                  .reduce(
                    (hashCode, currentVal) =>
                    (hashCode = currentVal.charCodeAt(0) + (hashCode << 6) + (hashCode << 16) - hashCode), 0
                  ) % possibleColors.length 
                )
              ]}`}
            />
          })
        }
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartS;
