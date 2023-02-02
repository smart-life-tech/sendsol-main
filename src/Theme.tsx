import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import type { FC, ReactNode } from "react";
import React from "react";

declare module "@mui/material/styles" {
  interface Palette {
    linkColor: Palette["primary"];
  }
  interface PaletteOptions {
    linkColor: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#B96BFC",
      light: "#969798",
    },
    secondary: {
      main: "#B88454",
    },
    text: {
      primary: "#111111",
      secondary: "#969798",
    },
    linkColor: {
      main: "#111111",
    },
  },
  typography: {
    allVariants: {
      fontFamily: ["PP Neue Montreal", "Roboto", "Arial", "sans-serif"].join(
        ","
      ),
      textTransform: "none",
      
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: 12,
      fontWeight: 500,
    },
    body1: {
      fontSize: 16,
      fontWeight: 500,
    },
    h1: {
      fontSize: 96,
      fontWeight: 500,
    },
    h2: {
        fontSize: 72,
        fontWeight: 500,
    },
    h3: {
      fontSize: 24,
      fontWeight: 375,
    },
    // h2: {...},
    // h3: {...},
    // h4: {...},
    // h5: {...}
    // h6: {...},
    // button: {...},
    // body1: {...},
    // body2: {...},
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          justifyContent: "flex-start",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: "none",
          padding: "12px 16px",
        },
        startIcon: {
          marginRight: 8,
        },
        endIcon: {
          marginLeft: 8,
        },
      },
    },
  },
});

export const Theme: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
