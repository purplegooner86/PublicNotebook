import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Frequently Asked Questions Page" />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            What is this?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Its a React app for tracking butterflies
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Does it work?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, the Add Butterflies form actually triggers DB calls which update the data which is presented in the charts and on the dashboard
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Did you make this just for the CHAD CTF?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes. Although, heavy inspiration for the styling and dashboard setup was taken from EdRoh's Youtube video where he builds a React admin dashboard
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
