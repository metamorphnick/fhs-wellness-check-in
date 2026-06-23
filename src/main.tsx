import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./App";

const theme = extendTheme({
  fonts: {
    body: "Arial, Helvetica, sans-serif",
    heading: "Arial, Helvetica, sans-serif"
  },
  styles: {
    global: {
      body: {
        bg: "#252523",
        color: "#2b2b2b"
      }
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
