import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const MultiStatBox = ({ title, subtitles, icon }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    return(
        <Box width="100%" m="0 30px">
            <Box display="flex" justifyContent="space-between">
            <Box>
                {icon}
                <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: colors.grey[100] }}
                >
                {title}
                </Typography>
            </Box>
            </Box>

            {
                subtitles.map((subtitle, index) => {
                return (
                    <Box 
                        display="flex" 
                        justifyContent="space-between"
                        mt="2px"
                        key={`box_${index}`}
                    >
                        <Typography variant="h5" sx={{ color: colors.greenAccent[500] }}>
                        {subtitle}
                        </Typography>
                    </Box>
                )
                })
            }
        </Box>
    )
};

export default MultiStatBox