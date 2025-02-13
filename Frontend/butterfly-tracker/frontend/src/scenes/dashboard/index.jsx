import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChartS from "../../components/LineChartS";
import BarChartS from "../../components/BarChartS";
import PieChartS from "../../components/PieChartS";
import StatBox from "../../components/StatBox";
import MultiStatBox from "../../components/MultiStatBox"
import { useState, useEffect } from "react";

import axios from "axios";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "/api/butterflieslist")
    .then(response => setButterflies(response.data))
    .catch(error => console.error(error));
  }, []);

  var currentMonthCount = 0;
  var now = new Date();
  for (var e in butterflies) {
    var dateOf = new Date(butterflies[e]['date']);
    if (dateOf.getMonth() === now.getMonth() && dateOf.getYear() === now.getYear()) {
      currentMonthCount += 1;
    }
  }

  const sortedButterflies = butterflies.sort(function (a,b) {
    var a_date = new Date(a.date);
    var b_date = new Date(b.date);

    return b_date.getTime() - a_date.getTime();
  })

  var mostRecentButterfly = sortedButterflies[0];
  if (!mostRecentButterfly) {
    mostRecentButterfly = {
      species: "none",
      color: "none",
      wingspan: "none"
    }
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Butterfly Dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="170px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={butterflies.length}
            subtitle="Total Butterflies"
            icon={
              <img
                alt="butterfly"
                width="50px"
                height="50px"
                src={`../../assets/butterfly1.png`}
                style={{ cursor: "pointer", borderRadius: "50%" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={currentMonthCount}
            subtitle="Butterflies This Month"
            icon={
              <img
                alt="butterfly"
                width="50px"
                height="50px"
                src={`../../assets/butterfly1.png`}
                style={{ cursor: "pointer", borderRadius: "50%" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <MultiStatBox
            title="Most Recent Butterfly"
            subtitles={[
              mostRecentButterfly.species, 
              mostRecentButterfly.color, 
              `${mostRecentButterfly.wingspan} cm`
            ]}
            icon={
              <img
                alt="butterfly"
                width="50px"
                height="50px"
                src={`../../assets/butterfly1.png`}
                style={{ cursor: "pointer", borderRadius: "50%" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box mt="10px">
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Butterflies by Species
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="20px 20px 0 0">
            <PieChartS isDashboard={true} butterfliesIn={butterflies}/>
          </Box>
        </Box>
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box mt="10px">
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Butterflies by Month
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="20px 20px 0 0">
            <BarChartS isDashboard={true} butterfliesIn={butterflies}/>
          </Box>
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box mt="10px">
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Butterflies by Year
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="20px 20px 0 0">
            <LineChartS isDashboard={true} butterfliesIn={butterflies}/>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
