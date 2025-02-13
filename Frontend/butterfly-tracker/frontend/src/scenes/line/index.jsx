import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChartS from "../../components/LineChartS";

import { useState, useEffect } from "react";
import axios from "axios";

const Line = () => {

  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "/api/butterflieslist")
    .then(response => setButterflies(response.data))
    .catch(error => console.error(error));
  }, []);

  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box height="75vh">
        <LineChartS butterfliesIn={butterflies}/>
      </Box>
    </Box>
  );
};

export default Line;
