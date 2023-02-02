import React from "react";
import {
  Box,
  Typography,
} from "@mui/material";

export const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <Box sx={styles.infoRow}>
      <Typography color="text.secondary" mr={1} variant="subtitle1">
        {label}
      </Typography>
      <Typography color="text.primary" mr={1} variant="subtitle1">
        {value}
      </Typography>
    </Box>
  );
};

const styles = {
    infoRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
}