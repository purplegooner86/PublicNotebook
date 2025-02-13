import { useTheme } from "@mui/material";
import { tokens } from "../theme";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartS = ({ isDashboard = false, butterfliesIn = []}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const lineData = {};

  var uniqueButterflies = [];

  for (var e in butterfliesIn) {
    var dateOf = new Date(butterfliesIn[e]['date']);
    if ( !(dateOf.getFullYear() in lineData) ) {
      lineData[dateOf.getFullYear()] = {};
      for ( var u in uniqueButterflies ) {
        lineData[dateOf.getFullYear()][uniqueButterflies[u]] = 0;
      }
    }

    if ( uniqueButterflies.indexOf(butterfliesIn[e]['species']) === -1 ) {
      uniqueButterflies.push(butterfliesIn[e]['species']);
      for (var q in lineData) {
        lineData[q][butterfliesIn[e]['species']] = 0;
      }
    }
    
    lineData[dateOf.getFullYear()][butterfliesIn[e]['species']] += 1;
  }

  const formattedLineData = [];

  for ( var w in lineData ) {
    formattedLineData.push(
      {
        year: w,
        data: lineData[w]
      }
    )
  }

  // console.log(formattedLineData);


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
      <LineChart
        width={500}
        height={300}
        data={formattedLineData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="year"/>
        <YAxis/>
        <Tooltip 
          contentStyle={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary
          }}
          cursor={false}
        />
        {isDashboard || <Legend 
          layout="vertical"
          verticalAlign="bottom"
          align="right"
          wrapperStyle={{
            paddingLeft: "30px"
          }}
        />}
        {
          uniqueButterflies.map((butterfly) => {
            return <Line
              type="monotone"
              key={`line_${butterfly}`}
              dataKey={`data.${butterfly}`}
              name={`${butterfly}`}
              stroke={`${possibleColors[
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
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartS;
