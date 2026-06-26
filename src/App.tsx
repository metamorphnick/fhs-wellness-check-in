import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  VStack,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ZodError } from "zod";
import {
  type CheckInPayload,
  validate_check_in_payload
} from "../shared/check_in.schema";

const time_options = ["Before school", "Break", "Lunch", "After school", "During class"];
const first_visit_options = [
  { label: "Yes -- first visit this year", value: true },
  { label: "No -- I've visited before", value: false }
] as const;
const default_reason_options = [
  "Introduction",
  "School work",
  "Relax",
  "Center staff check-in",
  "Clinician check-in",
  "Have a quiet space",
  "Event / Activity",
  "Access resource",
  "Wellness Peer",
  "Outside Agency check-in"
];

function parse_reason_options(data: unknown) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (reason): reason is string => typeof reason === "string" && reason.trim().length > 0
  );
}

function SquareMark({
  color = "blue",
  is_complete = false
}: {
  color?: "blue" | "green" | "purple" | "white";
  is_complete?: boolean;
}) {
  const colors = {
    blue: ["#e3f1ff", "#2b79bd"],
    green: ["#e8f6df", "#5b9b38"],
    purple: ["#eeeaff", "#6d62d8"],
    white: ["#244a7b", "#b9d4f4"]
  } as const;
  const [bg, border] = colors[color];

  return (
    <Center w="26px" h="26px" borderRadius="7px" bg={bg} flex="0 0 auto">
      {is_complete ? (
        <Text color={border} fontSize="15px" fontWeight="900" lineHeight="1">
          ✓
        </Text>
      ) : (
        <Box w="8px" h="8px" border="2px solid" borderColor={border} />
      )}
    </Center>
  );
}

function Pill({
  children,
  selected,
  on_click,
  tone = "neutral",
  is_disabled = false
}: {
  children: string;
  selected?: boolean;
  on_click: () => void;
  tone?: "neutral" | "blue" | "green" | "purple";
  is_disabled?: boolean;
}) {
  const selected_styles = {
    neutral: { bg: "#f4f7fb", border_color: "#9fa8b3" },
    blue: { bg: "#e7f3ff", border_color: "#9ecbf3", color: "#1e5f9d" },
    green: { bg: "#eef7e7", border_color: "#9ccf7b", color: "#3c7a24" },
    purple: { bg: "#eeebff", border_color: "#b5adff", color: "#4c43bd" }
  }[tone];

  return (
    <Button
      h="34px"
      minW="auto"
      px="20px"
      borderRadius="999px"
      border="1px solid"
      borderColor={selected ? selected_styles.border_color : "#b8b8b8"}
      bg={selected ? selected_styles.bg : "#fff"}
      color={selected ? selected_styles.color ?? "#2d2d2d" : "#2d2d2d"}
      fontSize="13px"
      fontWeight="700"
      boxShadow="0 1px 2px rgba(0,0,0,.08)"
      opacity={is_disabled ? 0.45 : 1}
      cursor={is_disabled ? "not-allowed" : "pointer"}
      _hover={{ bg: selected ? selected_styles.bg : "#f8f8f8" }}
      isDisabled={is_disabled}
      onClick={on_click}
    >
      {children}
    </Button>
  );
}

function Section({
  icon_color,
  title,
  caption,
  is_locked = false,
  is_complete = false,
  children
}: {
  icon_color: "blue" | "green" | "purple";
  title: string;
  caption?: React.ReactNode;
  is_locked?: boolean;
  is_complete?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Stack
      spacing="16px"
      py="25px"
      borderTop="1px solid #e0e0e0"
      opacity={is_locked ? 0.48 : 1}
      transition="opacity 160ms ease"
    >
      <HStack spacing="12px" align="start">
        <SquareMark color={icon_color} is_complete={is_complete} />
        <Stack spacing="8px" pt="3px">
          <Text fontSize="16px" fontWeight="700">
            {title}
          </Text>
          {caption && (
            <Text fontSize="12px" color="#333">
              {caption}
            </Text>
          )}
        </Stack>
      </HStack>
      <Flex pl={{ base: 0, sm: "38px" }} wrap="wrap" gap="10px">
        {children}
      </Flex>
    </Stack>
  );
}

function CheckInForm({ on_submitted }: { on_submitted: (submission: CheckInPayload) => void }) {
  const toast = useToast();
  const [time_of_visit, set_time_of_visit] = useState("");
  const [first_visit, set_first_visit] = useState<boolean | null>(null);
  const [reasons, set_reasons] = useState<string[]>([]);
  const [reason_options, set_reason_options] = useState(default_reason_options);
  const [is_submitting, set_is_submitting] = useState(false);
  const complete = Boolean(time_of_visit) && first_visit !== null && reasons.length > 0;
  const can_select_first_visit = Boolean(time_of_visit);
  const can_select_reasons = first_visit !== null;
  const progress = [Boolean(time_of_visit), first_visit !== null, reasons.length > 0].filter(Boolean).length;

  useEffect(() => {
    let is_mounted = true;

    axios
      .get<unknown>("/reasons.json")
      .then((response) => {
        const configured_reasons = parse_reason_options(response.data);
        if (is_mounted && configured_reasons.length > 0) {
          set_reason_options(configured_reasons);
        }
      })
      .catch(() => {
        if (is_mounted) {
          set_reason_options(default_reason_options);
        }
      });

    return () => {
      is_mounted = false;
    };
  }, []);

  const select_time_of_visit = (option: string) => {
    set_time_of_visit(option);
    set_first_visit(null);
    set_reasons([]);
  };

  const select_first_visit = (option: boolean) => {
    set_first_visit(option);
    set_reasons([]);
  };

  const toggle_reason = (reason: string) => {
    set_reasons((current) =>
      current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]
    );
  };

  const submit = async () => {
    if (!complete) return;
    set_is_submitting(true);

    try {
      const submission = validate_check_in_payload({
        time_of_visit,
        first_visit,
        reasons
      });
      const response = await axios.post("/api/check-ins", submission);
      const result = response.data;

      if (!result.ok) {
        throw new Error(result.message ?? "Check-in could not be recorded.");
      }

      on_submitted(submission);
    } catch (error) {
      toast({
        title: "Check-in was not submitted",
        description:
          error instanceof ZodError
            ? error.issues.map((issue) => issue.message).join(" ")
            : error instanceof Error
              ? error.message
              : "Please try again.",
        status: "error",
        duration: 3500
      });
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <Center minH="100vh" bg="#252523" p={{ base: "18px", md: "26px" }} alignItems="flex-start">
      <Box data-form-shell bg="#eef1f6" w="100%" maxW="760px" p={{ base: "22px", md: "30px 42px" }}>
        <Box bg="#fff" border="1px solid #d7d7d7" borderRadius="8px" overflow="hidden">
          <Flex bg="#142f5f" color="#fff" align="center" h="72px" px="30px">
            <HStack spacing="13px">
              <SquareMark color="white" />
              <Box>
                <Text fontWeight="800" fontSize="16px" lineHeight="1.1">
                  Wellness Center Check-In
                </Text>
                <Text color="#c8d5e9" fontSize="12px">
                  Thursday, May 7, 2026
                </Text>
              </Box>
            </HStack>
            <Spacer />
            <HStack bg="rgba(255,255,255,.13)" borderRadius="999px" px="8px" py="6px" spacing="8px">
              <Center w="30px" h="30px" borderRadius="full" bg="#1d5b96" color="#bce0ff" fontSize="11px" fontWeight="800">
                EA
              </Center>
              <Text fontSize="13px" fontWeight="700" pr="6px">
                Emma Anderson
              </Text>
            </HStack>
          </Flex>

          <Box px="30px" pt="28px">
            <Box h="8px" bg="#eef1f6" borderRadius="999px" overflow="hidden" mb="10px">
              <Box
                data-progress-fill
                h="100%"
                w={`${(progress / 3) * 100}%`}
                bg="#2b79bd"
                borderRadius="999px"
                transition="width 180ms ease"
              />
            </Box>
            <SimpleGrid columns={3} color="#1c1c1c" fontSize="12px" pb="22px">
              <Text color={progress >= 1 ? "#1b67af" : "#1c1c1c"} fontWeight="700">
                Time of visit
              </Text>
              <Text textAlign="center" color={progress >= 2 ? "#3b8b25" : "#1c1c1c"} fontWeight="700">
                First visit
              </Text>
              <Text textAlign="right" color={progress >= 3 ? "#5d52cf" : "#1c1c1c"} fontWeight="700">
                Reason
              </Text>
            </SimpleGrid>

            <Section icon_color="blue" title="Time of visit" is_complete={Boolean(time_of_visit)}>
              {time_options.map((option) => (
                <Pill key={option} selected={time_of_visit === option} on_click={() => select_time_of_visit(option)} tone="blue">
                  {option}
                </Pill>
              ))}
            </Section>

            <Section
              icon_color="green"
              title="Is this your first visit this school year?"
              is_locked={!can_select_first_visit}
              is_complete={first_visit !== null}
              caption={
                <>
                  Select <Box as="span" color="#3b8b25" fontWeight="800">Yes</Box> only on your very first visit during summer school or the current school year.
                </>
              }
            >
              {first_visit_options.map((option) => (
                <Pill
                  key={option.label}
                  selected={first_visit === option.value}
                  is_disabled={!can_select_first_visit}
                  on_click={() => select_first_visit(option.value)}
                  tone="green"
                >
                  {option.label}
                </Pill>
              ))}
            </Section>

            <Section
              icon_color="purple"
              title="Reason for visiting"
              caption="Select all that apply."
              is_locked={!can_select_reasons}
              is_complete={reasons.length > 0}
            >
              {reason_options.map((option) => (
                <Pill
                  key={option}
                  selected={reasons.includes(option)}
                  is_disabled={!can_select_reasons}
                  on_click={() => toggle_reason(option)}
                  tone="purple"
                >
                  {option}
                </Pill>
              ))}
            </Section>
          </Box>

          <Flex
            h={{ base: "auto", sm: "56px" }}
            gap="14px"
            borderTop="1px solid #e2e2e2"
            px="30px"
            py={{ base: "12px", sm: 0 }}
            align="center"
            direction={{ base: "column", sm: "row" }}
          >
            <Button
              variant="outline"
              h="34px"
              minW="82px"
              borderRadius="6px"
              fontSize="13px"
            >
              Back
            </Button>
            <Spacer />
            <Text fontSize="12px" color="#333">
              Complete all sections
            </Text>
            <Button
              h="34px"
              minW="152px"
              borderRadius="6px"
              colorScheme="gray"
              variant="outline"
              fontSize="13px"
              isDisabled={!complete}
              isLoading={is_submitting}
              onClick={submit}
            >
              Submit check-in
            </Button>
          </Flex>
        </Box>
      </Box>
    </Center>
  );
}

function SummaryRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Flex minH="42px" align="center" borderTop="1px solid #dedede" gap="14px">
      <Text w="190px" fontSize="10px" letterSpacing="1.2px" fontWeight="800" color="#6c6c6c">
        □ {label}
      </Text>
      <Flex flex="1" justify="flex-end" gap="6px" wrap="wrap">
        {children}
      </Flex>
    </Flex>
  );
}

function SuccessPage({ submission, on_new }: { submission: CheckInPayload; on_new: () => void }) {
  const quiet_space = submission.reasons.includes("Have a quiet space");

  return (
    <Center minH="100vh" bg="#252523" p={{ base: "18px", md: "42px 20px" }}>
      <Box bg="#f3f2ed" borderRadius="14px" w="100%" maxW="625px" minH="574px" pt="28px" px={{ base: "20px", md: "86px" }}>
        <VStack spacing="5px">
          <Center w="53px" h="53px" borderRadius="full" bg="#eff9e7" border="1px solid #aad67d">
            <Box w="15px" h="15px" border="3px solid #558f30" />
          </Center>
          <Text fontSize="18px" fontWeight="800" pt="2px">
            You're checked in!
          </Text>
          <Text fontSize="12px" color="#5a5a5a" fontWeight="700">
            Your wellness center visit has been recorded.
          </Text>
        </VStack>

        <Box mt="19px" bg="#fff" border="1px solid #d9d9d9" borderRadius="12px" overflow="hidden">
          <Flex bg="#142f5f" color="#fff" h="68px" align="center" px="19px">
            <HStack spacing="13px">
              <Center w="37px" h="37px" borderRadius="full" bg="#234778" border="1px solid rgba(255,255,255,.18)">
                <Box w="10px" h="10px" border="2px solid #86b4e0" />
              </Center>
              <Box>
                <Text fontSize="15px" fontWeight="800">
                  Check-in summary
                </Text>
                <Text fontSize="10px" color="#a7b8d2" fontWeight="700">
                  Thursday, May 7, 2026
                </Text>
              </Box>
            </HStack>
            <Spacer />
            <Badge borderRadius="999px" bg="#eef9dd" border="1px solid #a3cf69" color="#4a7d2a" px="11px" py="4px" fontSize="10px">
              Confirmed
            </Badge>
          </Flex>

          <Box px="19px">
            <Flex h="72px" align="center" borderBottom="1px solid #dedede">
              <Center w="40px" h="40px" borderRadius="full" bg="#e3f1ff" border="1px solid #acd1f5" color="#2d74b0" fontSize="12px" fontWeight="800">
                EA
              </Center>
              <Box ml="14px">
                <Text fontSize="14px" fontWeight="800">
                  Emma Anderson
                </Text>
                <Text fontSize="12px" color="#4b4b4b">
                  Student · Grade 10
                </Text>
              </Box>
              <Spacer />
              <Box textAlign="right" fontSize="10px" fontWeight="800" color="#555" lineHeight="1.15">
                <Text>Logged</Text>
                <Text>at</Text>
                <Text color="#222">10:27</Text>
                <Text color="#222">AM</Text>
              </Box>
            </Flex>

            <SummaryRow label="TIME OF VISIT">
              <Badge borderRadius="999px" bg="#f1efff" border="1px solid #beb7ff" color="#4033b7" px="11px" py="4px">
                {submission.time_of_visit}
              </Badge>
            </SummaryRow>
            <SummaryRow label="FIRST VISIT 25-26">
              <Badge borderRadius="999px" bg="#f1f0ec" border="1px solid #cfcbc1" color="#555" px="11px" py="4px">
                {submission.first_visit ? "Yes -- first visit" : "No -- returning visitor"}
              </Badge>
            </SummaryRow>
            <SummaryRow label="REASON(S)">
              {submission.reasons.map((reason) => (
                <Badge
                  key={reason}
                  borderRadius="999px"
                  bg="#e4f2ff"
                  border="1px solid #b9d8f2"
                  color="#225f9b"
                  px="10px"
                  py="4px"
                  maxW={quiet_space && reason === "Have a quiet space" ? "116px" : undefined}
                  whiteSpace="normal"
                  lineHeight="1"
                >
                  {reason}
                </Badge>
              ))}
            </SummaryRow>
          </Box>

          <Flex borderTop="1px solid #e2e2e2" h="55px" align="center" px="19px" gap="8px">
            <Button h="31px" flex="1" variant="outline" borderColor="#c9c9c9" borderRadius="6px" fontSize="13px" onClick={on_new}>
              New check-in
            </Button>
            <Button h="31px" flex="1" variant="outline" borderColor="#c9c9c9" borderRadius="6px" fontSize="13px">
              Return to dashboard
            </Button>
          </Flex>
        </Box>

        <Text mt="18px" textAlign="center" color="#555" fontSize="10px" fontWeight="700">
          Visit ID #WC-15909 · 10:27 AM · May 7,
          <br />
          2026
        </Text>
      </Box>
    </Center>
  );
}

export default function App() {
  const [submitted, set_submitted] = useState<CheckInPayload | null>(null);

  if (submitted) {
    return <SuccessPage submission={submitted} on_new={() => set_submitted(null)} />;
  }

  return <CheckInForm on_submitted={set_submitted} />;
}
