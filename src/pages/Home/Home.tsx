import React from "react";
import { Box } from "@mui/material";
import { Header } from "../../components/Header";
import { SendSolWidget } from "./SendSolWidget";
import { LogoPanel } from "./LogoPanel";

const styles = {
  container: {
    backgroundColor: "#ffffff95",
    display: "flex",
    flexDirection: "column",
    width: 1440,
    height: 996,
    borderRadius: 4,
    margin: 4,
    padding: 4,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "row",
    maxWidth: 1200,
    justifyContent: "space-between",
  },
};

export const Home: React.FC = () => {
  return (
    <Box sx={styles.container}>
      <Header />
      <Box sx={styles.contentContainer} mx={8} mt={4}>
        <LogoPanel />
        <SendSolWidget />
      </Box>
    </Box>
  );
};
