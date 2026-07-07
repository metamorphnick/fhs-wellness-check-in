import { radioAnatomy } from "@chakra-ui/anatomy";
import { extendTheme } from "@chakra-ui/react";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const {
  definePartsStyle: defineRadioPartsStyle,
  defineMultiStyleConfig: defineRadioMultiStyleConfig
} = createMultiStyleConfigHelpers(radioAnatomy.keys);

const theme = extendTheme({
  fonts: {
    body: "Inter, sans-serif",
    heading: "Inter, sans-serif"
  },
  colors: {
    brand: {
      500: "#183F77",
      600: "#143664"
    }
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "gray.700"
      }
    }
  },
  components: {
    Radio: defineRadioMultiStyleConfig({
      baseStyle: defineRadioPartsStyle({
        container: {
          border: "1px solid",
          borderColor: "gray.400",
          borderRadius: "8px",
          padding: "10px 14px",
          _hover: {
            bg: "gray.50"
          },
          _checked: {
            borderColor: "brand.500",
            _hover: {
              bg: "transparent"
            }
          }
        }
      }),
      variants: {
        stacked: defineRadioPartsStyle({
          container: {
            alignItems: "center",
            flexDirection: "column",
            gap: "8px",
            justifyContent: "flex-start",
            minH: "86px",
            textAlign: "center",
            border: "1px solid",
            borderColor: "gray.400",
            borderRadius: "8px",
            padding: "15px 12px 12px",
            _hover: {
              bg: "gray.50"
            },
            _checked: {
              borderColor: "brand.500",
              bg: "#F7FAFF",
              _hover: {
                bg: "#F7FAFF"
              }
            }
          },
          label: {
            marginInlineStart: 0,
            fontWeight: "400",
            lineHeight: "1.25",
            minH: "34px"
          }
        }),
        solid: defineRadioPartsStyle({
          container: {
            alignItems: "center",
            flexDirection: "column",
            gap: "6px",
            justifyContent: "center",
            minH: "56px",
            border: "1px solid",
            borderColor: "gray.400",
            borderRadius: "8px",
            padding: "10px 14px",
            _hover: {
              bg: "gray.50"
            },
            _checked: {
              color: "white",
              bg: "brand.500",
              borderColor: "brand.500",
              cursor: "default",
              _hover: {
                bg: "brand.500"
              }
            }
          },
          control: {
            _checked: {
              color: "brand.500",
              bg: "white",
              borderColor: "white",
              _hover: {
                color: "brand.500",
                bg: "white",
                borderColor: "white"
              }
            }
          },
          label: {
            marginInlineStart: 0,
            fontWeight: "400"
          }
        })
      }
    })
  }
});

export default theme;
