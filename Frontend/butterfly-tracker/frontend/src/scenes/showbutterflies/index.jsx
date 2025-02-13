import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useState, useEffect } from "react";

import axios from "axios";

const ShowButterflies = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "/api/butterflieslist")
    .then(response => setButterflies(response.data))
    .catch(error => console.error(error));
  }, []);



  const columns = [
    { field: "species", headerName: "Species", flex: 1},
    { field: "wingspan", headerName: "Wing Span", flex: 1},
    { field: "color", headerName: "Color", flex: 1},
    { field: "date", headerName: "Date", flex: 1},
  ];

  return (
    <Box m="20px">
      <Header
        title="Butterflies"
        subtitle="List of Butterflies"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={butterflies}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={row => row.species + row.wingspan + row.date + Math.random()}
        />
      </Box>
    </Box>
  );
};

export default ShowButterflies;
