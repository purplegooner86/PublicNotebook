import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChartS from "../../components/BarChartS";

import { useState, useEffect } from "react";
import axios from "axios";

const Bar = () => {

  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "/api/butterflieslist")
    .then(response => setButterflies(response.data))
    .catch(error => console.error(error));
  }, []);

  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">
        <BarChartS butterfliesIn={butterflies}/>
      </Box>
    </Box>
  );
};

export default Bar;
