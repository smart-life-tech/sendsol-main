import React, { useCallback } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import Logo from "../assets/logo.svg";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";

const styles = {
  container: {
    height: 76,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
  },
  rightContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
};

export const Header: React.FC = () => {
  const goHome = () => {
    const win: Window = window;
    win.location = "/";
  };

  return (
    <Box px={3} py={2} m={2} sx={styles.container}>
      <Box>
        <Link component="button" onClick={goHome}>
          <img
            height="24px"
            src={Logo}
            alt="Acme Logo"
            // style={{ cursor: "pointer" }}
          />
        </Link>
      </Box>

      <Box sx={styles.rightContainer}>
        <Link
          href="#"
          onClick={goHome}
          mr={4}
          color="linkColor.main"
          underline="none"
          variant="subtitle1"
        >
          Home
        </Link>
        <WalletMultiButton variant="contained">
          Connect Wallet
        </WalletMultiButton>
      </Box>
    </Box>
  );
};
