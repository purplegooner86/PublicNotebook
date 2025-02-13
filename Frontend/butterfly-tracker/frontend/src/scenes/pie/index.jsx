import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChartS from "../../components/PieChartS";

import { useState, useEffect } from "react";
import axios from "axios";

const Pie = () => {

  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "/api/butterflieslist")
    .then(response => setButterflies(response.data))
    .catch(error => console.error(error));
  }, []);

  return (
    <Box m="20px">
      <Header title="Pie Chart" subtitle="Simple Pie Chart" />
      <Box height="75vh">
        <PieChartS butterfliesIn={butterflies}/>
      </Box>
    </Box>
  );
};

export default Pie;
