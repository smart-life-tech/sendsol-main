import React, { useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import IconLogo from "../../assets/funds.svg";

const styles = {
  container: {
    height: 76,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
};

export const LogoPanel: React.FC = () => {
  const goHome = () => {
    const win: Window = window;
    win.location = "/";
  };

  return (
    <Box px={2}  m={2} sx={styles.container}>
      <img width="329px" src={IconLogo} alt="Acme Logo" />
      <Typography color="text.primary" variant="h2">
        3D root labs<br /> Wallet
      </Typography>
      <Typography color="text.secondary" variant="h3">
        Send Solana to your friends now!
      </Typography>
    </Box>
  );
};
