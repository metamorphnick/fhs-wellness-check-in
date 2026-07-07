import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Box,
  Button,
  ChakraProvider,
  Flex,
  Grid,
  HStack,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast
} from "@chakra-ui/react";
import {
  BookOpen,
  BriefcaseMedical,
  ClipboardList,
  FilePlus2,
  Gauge,
  Info,
  Send,
  UserRound,
  UsersRound
} from "lucide-react";
import theme from "./theme";

interface SurveyOption {
  label: string;
  value: number;
}

interface SurveyQuestion {
  id: string;
  text: string;
}

interface DifficultyQuestion {
  id: string;
  prompt: string;
  options: string[];
}

interface ScoreBand {
  min: number;
  max: number;
  label: string;
  tone: "blue" | "green" | "yellow" | "orange" | "red";
}

interface SurveyDefinition {
  id: string;
  shortName: string;
  title: string;
  subtitle: string;
  timeframe: string;
  scoring: "scored" | "manual";
  options: SurveyOption[];
  questions: SurveyQuestion[];
  difficulty?: DifficultyQuestion;
  scoreBands?: ScoreBand[];
  maxScore?: number;
}

interface ScoreResult {
  surveyId: string;
  score: number;
  maxScore: number;
  band: ScoreBand;
}

const scoreColors: Record<ScoreBand["tone"], { bg: string; color: string }> = {
  blue: { bg: "#D9ECFF", color: "#205180" },
  green: { bg: "#DFF5EB", color: "#236A4A" },
  yellow: { bg: "#FFF3CC", color: "#7C5A00" },
  orange: { bg: "#FFE4BE", color: "#9B5715" },
  red: { bg: "#FFD8D7", color: "#9F2D2B" }
};

const defaultResponses = (survey: SurveyDefinition | undefined) =>
  Object.fromEntries((survey?.questions ?? []).map((question) => [question.id, undefined])) as Record<string, number | undefined>;

const labelStyle = {
  color: "brand.500",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "1px",
  textTransform: "uppercase" as const
};

const stretchAnswerRowIds = new Set(["phq9_6", "phq9_7", "phq9_8", "phq9_9", "ucla_7"]);
const suppressedTooltipQuestionIds = new Set(["ucla_1", "ucla_4", "ucla_5", "ucla_6", "ucla_8", "ucla_10"]);
const longQuestionCharacterLimit = 95;
const questionColumnWidth = "466px";
const compactQuestionColumnWidth = questionColumnWidth;

function App() {
  const [surveys, setSurveys] = useState<SurveyDefinition[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [responses, setResponses] = useState<Record<string, number | undefined>>({});
  const [difficulty, setDifficulty] = useState("");
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    void fetch("/api/surveys")
      .then((response) => response.json())
      .then((data: SurveyDefinition[]) => {
        setSurveys(data);
        setSelectedSurveyId(data[0]?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedSurveyId),
    [selectedSurveyId, surveys]
  );

  useEffect(() => {
    setResponses(defaultResponses(selectedSurvey));
    setDifficulty("");
    setScore(null);
  }, [selectedSurvey]);

  const completedCount = selectedSurvey?.questions.filter((question) => responses[question.id] !== undefined).length ?? 0;
  const isComplete = Boolean(selectedSurvey && completedCount === selectedSurvey.questions.length);

  const calculateScore = async () => {
    if (!selectedSurvey || selectedSurvey.scoring !== "scored" || !isComplete) return;

    const result = await fetch("/api/surveys/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId: selectedSurvey.id, responses })
    }).then((response) => response.json());

    setScore(result);
  };

  const saveSurvey = async () => {
    if (!selectedSurvey || !isComplete) return;

    setSaving(true);
    const completeResponses = selectedSurvey.questions.reduce<Record<string, number>>((payload, question) => {
      payload[question.id] = Number(responses[question.id] ?? 0);
      return payload;
    }, {});
    const savePayload = {
      surveyId: selectedSurvey.id,
      responses: completeResponses,
      ...(selectedSurvey.id === "ucla-bts" && score ? { surveyScore: score.score, symptomSeverity: score.band.label } : {})
    };

    try {
      await fetch("/api/surveys/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload)
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Save failed");
        }
        return response.json();
      });

      toast({
        title: "Survey saved",
        description: `${selectedSurvey.shortName} responses were saved.`,
        status: "success",
        duration: 2800,
        isClosable: true
      });
    } catch {
      toast({
        title: "Survey could not be saved",
        description: "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box minH="100vh" bg="white">
      <Header />
      {loading ? (
        <Box maxW="680px" mx="auto" mt="80px" p="30px" color="brand.500" bg="#F7FAFF" border="1px solid" borderColor="gray.200" borderRadius="8px" fontWeight="800">
          Loading screeners...
        </Box>
      ) : (
        <>
          <Box id="survey" w={{ base: "calc(100% - 28px)", md: "calc(100% - 48px)" }} maxW="1230px" mx="auto" mt="32px" py="28px" bg="#F7FAFF" borderTop="1px solid" borderColor="gray.200" borderRadius="8px 8px 0 0">
            <Box w="calc(100% - 40px)" maxW="1160px" mx="auto" bg="white" border="1px solid" borderColor="gray.200" borderRadius="8px" boxShadow="0 2px 10px rgba(39, 58, 98, 0.06)" overflow="hidden">
              <SurveySetup
                surveys={surveys}
                selectedSurveyId={selectedSurveyId}
                onSurveyChange={setSelectedSurveyId}
              />
              {selectedSurvey ? (
                <SurveyForm
                  survey={selectedSurvey}
                  responses={responses}
                  difficulty={difficulty}
                  completedCount={completedCount}
                  score={score}
                  onDifficultyChange={setDifficulty}
                  onResponseChange={(questionId, value) => {
                    setResponses((current) => ({ ...current, [questionId]: value }));
                    setScore(null);
                  }}
                  onSubmit={calculateScore}
                  onSave={saveSurvey}
                  isComplete={isComplete}
                  isSaving={saving}
                />
              ) : null}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

function Header() {
  return (
    <Flex as="header" h="70px" px={{ base: "20px", md: "34px" }} align="center" gap="14px">
      <BrandMark />
      <Text color="brand.500" fontSize={{ base: "22px", md: "27px" }} fontWeight="800" letterSpacing="2px">
        CASCADES
      </Text>
      <HStack ml="auto" spacing="11px">
        <NavButton label="Progress dashboard" icon={<Gauge size={20} />} />
        <NavButton label="Caseload" icon={<BriefcaseMedical size={20} />} />
        <NavButton label="Students" icon={<UsersRound size={20} />} />
        <NavButton label="Resources" icon={<BookOpen size={20} />} />
        <Box position="relative">
          <IconButton aria-label="Profile" icon={<UserRound size={21} />} color="white" bg="brand.500" _hover={{ bg: "brand.600" }} borderRadius="full" size="sm" />
          <Box position="absolute" right="-1px" bottom="1px" w="8px" h="8px" bg="#5FD083" border="2px solid white" borderRadius="full" />
        </Box>
      </HStack>
    </Flex>
  );
}

function BrandMark() {
  return (
    <Box position="relative" w="42px" h="34px" aria-hidden="true">
      <Box position="absolute" left="2px" bottom="0" w="19px" h="29px" bg="#245B96" borderRadius="5px 5px 3px 3px" transform="skewX(-30deg)" />
      <Box position="absolute" left="13px" bottom="0" w="19px" h="29px" bg="#2D7AAE" borderRadius="5px 5px 3px 3px" transform="skewX(-30deg)" />
      <Box position="absolute" left="24px" bottom="0" w="19px" h="31px" bg="#65D787" borderRadius="5px 5px 3px 3px" transform="skewX(-30deg)" />
    </Box>
  );
}

function NavButton({ label, icon }: { label: string; icon: React.ReactElement }) {
  return (
    <IconButton
      aria-label={label}
      icon={icon}
      display={{ base: "none", sm: "inline-flex" }}
      color="brand.500"
      bg="#EEF5FC"
      _hover={{ bg: "gray.100" }}
      borderRadius="full"
      size="sm"
    />
  );
}

function SurveySetup({
  surveys,
  selectedSurveyId,
  onSurveyChange
}: {
  surveys: SurveyDefinition[];
  selectedSurveyId: string;
  onSurveyChange: (value: string) => void;
}) {
  return (
    <Grid templateColumns={{ base: "1fr", sm: "1fr auto" }} gap="18px" alignItems="center" m={{ base: "16px 12px", md: "22px 20px" }} p="20px" bg="#F7FAFF" border="1px solid" borderColor="gray.200" borderRadius="8px" boxShadow="sm">
      <Box>
        <Text {...labelStyle}>Screener Manual Entry</Text>
        <Heading mt="6px" color="brand.500" fontSize="20px">Choose survey</Heading>
      </Box>
      <Flex as="label" align="center" gap="12px">
        <Text {...labelStyle}>Survey</Text>
        <Select value={selectedSurveyId} onChange={(event) => onSurveyChange(event.target.value)} minW="116px" h="42px" bg="white" borderColor="gray.400" borderRadius="8px" color="gray.700" fontWeight="700">
          {surveys.map((survey) => <option key={survey.id} value={survey.id}>{survey.shortName}</option>)}
        </Select>
      </Flex>
    </Grid>
  );
}

function SurveyForm({
  survey,
  responses,
  difficulty,
  completedCount,
  score,
  onDifficultyChange,
  onResponseChange,
  onSubmit,
  onSave,
  isComplete,
  isSaving
}: {
  survey: SurveyDefinition;
  responses: Record<string, number | undefined>;
  difficulty: string;
  completedCount: number;
  score: ScoreResult | null;
  onDifficultyChange: (value: string) => void;
  onResponseChange: (questionId: string, value: number) => void;
  onSubmit: () => void;
  onSave: () => void;
  isComplete: boolean;
  isSaving: boolean;
}) {
  const isScored = survey.scoring === "scored";
  const usesCompactFiveChoiceLayout = survey.id === "ucla-bts";
  const optionCount = survey.options.length;
  const currentQuestionColumnWidth = usesCompactFiveChoiceLayout ? compactQuestionColumnWidth : questionColumnWidth;
  const optionMinWidth = usesCompactFiveChoiceLayout ? 111 : isScored ? 120 : 120;
  const optionMaxWidth = usesCompactFiveChoiceLayout ? 111 : isScored ? 150 : 150;
  const answerGridTemplate = `repeat(${optionCount}, minmax(${optionMinWidth}px, 1fr))`;
  const answerColumnWidth = `minmax(${optionCount * optionMinWidth + (optionCount - 1) * 10}px, ${optionCount * optionMaxWidth}px)`;
  const radioVariant = isScored || usesCompactFiveChoiceLayout ? "solid" : "stacked";
  const responsePercent = survey.questions.length > 0 ? Math.round((completedCount / survey.questions.length) * 100) : 0;

  return (
    <Box m={{ base: "16px 12px 22px", md: "22px 20px 28px" }} p={{ base: "16px", md: "22px" }} border="1px solid" borderColor="gray.200" borderRadius="8px" boxShadow="sm">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap="20px" mb="18px">
        <Box>
          <Heading mt="5px" mb="6px" color="brand.500" fontSize="22px">{survey.title}</Heading>
          {survey.subtitle ? <Text color="brand.500" lineHeight="1.45">{survey.subtitle}</Text> : null}
        </Box>
        <HStack alignSelf="flex-start" px="12px" py="8px" color="gray.700" bg="#EDF6FF" borderRadius="full" fontWeight="900">
          <ClipboardList size={18} />
          <Text>{isScored ? `${completedCount}/${survey.questions.length}` : `${responsePercent}%`}</Text>
        </HStack>
      </Flex>

      <Grid display={{ base: "none", lg: "grid" }} templateColumns={`${currentQuestionColumnWidth} ${answerColumnWidth}`} gap="10px" py="8px">
        <Box />
        <Grid templateColumns={answerGridTemplate} gap="10px">
          {survey.options.map((option) => (
            <Flex key={option.value} minH="48px" px="12px" align="center" justify="center" color="brand.500" bg="#F7FAFF" border="1px solid" borderColor="gray.200" borderRadius="8px" fontSize="13px" fontWeight="900" lineHeight="1.2" textAlign="center">
              {option.label}
            </Flex>
          ))}
        </Grid>
      </Grid>

      <Stack spacing="10px">
        {survey.questions.map((question, index) => {
          const stretchAnswerRow = !usesCompactFiveChoiceLayout && stretchAnswerRowIds.has(question.id);
          const standardBoxHeight = "68px";

          return (
            <Grid key={question.id} role="group" aria-labelledby={`${question.id}-label`} templateColumns={{ base: "1fr", lg: `${currentQuestionColumnWidth} ${answerColumnWidth}` }} gap="10px" alignItems={stretchAnswerRow ? "stretch" : undefined} p={{ base: "12px", lg: "0" }} bg={{ base: "#F7FAFF", lg: "transparent" }} border={{ base: "1px solid", lg: "0" }} borderColor="gray.200" borderRadius="8px">
              <Flex id={`${question.id}-label`} minH="56px" h={stretchAnswerRow ? "100%" : { lg: standardBoxHeight }} p="12px 14px" align="center" gap="12px" color="gray.700" bg="white" border="1px solid" borderColor="gray.200" borderRadius="8px" fontWeight="700" lineHeight="1.35">
                <Flex flex="0 0 auto" w="24px" h="24px" align="center" justify="center" color="brand.500" bg="#EDF6FF" borderRadius="full" fontSize="12px" fontWeight="900">{index + 1}</Flex>
                <QuestionText id={question.id} text={question.text} maxLines={usesCompactFiveChoiceLayout ? 2 : 3} suppressTooltip={suppressedTooltipQuestionIds.has(question.id)} />
              </Flex>
              <RadioGroup h={stretchAnswerRow ? "100%" : undefined} value={responses[question.id]?.toString() ?? ""} onChange={(value) => onResponseChange(question.id, Number(value))}>
                <SimpleGrid h={stretchAnswerRow ? "100%" : undefined} columns={{ base: 2, sm: optionCount, lg: optionCount }} spacing="10px" alignItems={stretchAnswerRow ? "stretch" : undefined}>
                  {survey.options.map((option) => (
                    <Radio key={option.value} h={stretchAnswerRow ? "100%" : undefined} value={option.value.toString()} variant={radioVariant}>
                      {option.value}
                    </Radio>
                  ))}
                </SimpleGrid>
              </RadioGroup>
            </Grid>
          );
        })}
      </Stack>

      {survey.difficulty ? (
        <Box mt="22px" p="18px" bg="#F7FAFF" border="1px solid" borderColor="gray.200" borderRadius="8px" aria-labelledby={`${survey.difficulty.id}-prompt`}>
          <Text id={`${survey.difficulty.id}-prompt`} maxW="850px" color="brand.500" fontWeight="800" lineHeight="1.4">{survey.difficulty.prompt}</Text>
          <RadioGroup value={difficulty} onChange={onDifficultyChange} mt="15px">
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="10px">
              {survey.difficulty.options.map((option) => <Radio key={option} value={option}>{option}</Radio>)}
            </SimpleGrid>
          </RadioGroup>
        </Box>
      ) : null}

      <Flex justify={{ base: "stretch", md: "flex-end" }} mt="24px" pt="20px" borderTop="1px solid" borderColor="gray.200">
        {isScored ? (
          <Grid w={{ base: "100%", md: "auto" }} minW={{ md: "460px" }} templateColumns={{ base: "1fr", sm: "minmax(210px, 1fr) 180px" }} gap="14px" alignItems="stretch" p="14px" bg="#F7FAFF" border="1px solid" borderColor="gray.200" borderRadius="8px">
            {score ? <ScoreBand score={score} /> : (
              <Flex minH="106px" px="18px" direction="column" align="flex-start" justify="center" color="gray.500" bg="white" border="1px dashed" borderColor="gray.300" borderRadius="8px">
                <Text {...labelStyle}>Survey Score</Text>
                <Text mt="7px" fontWeight="800">Score appears after completion</Text>
              </Flex>
            )}
            <Stack spacing="10px">
              <Button leftIcon={<FilePlus2 size={18} />} minW="180px" minH="48px" color="white" bg="brand.500" _hover={{ bg: "brand.600" }} isDisabled={!isComplete} onClick={onSubmit}>Calculate Score</Button>
              <Button leftIcon={<Send size={18} />} minW="180px" minH="48px" color="white" bg="#1F6C57" _hover={{ bg: "#185746" }} isDisabled={!score || isSaving} isLoading={isSaving} onClick={onSave}>Save Survey</Button>
            </Stack>
          </Grid>
        ) : (
          <Button leftIcon={<Send size={18} />} w={{ base: "100%", sm: "auto" }} minW="180px" minH="48px" color="white" bg="#1F6C57" _hover={{ bg: "#185746" }} isDisabled={!isComplete || isSaving} isLoading={isSaving} onClick={onSave}>
            Save Survey
          </Button>
        )}
      </Flex>
    </Box>
  );
}

function QuestionText({ id, text, maxLines = 3, suppressTooltip = false }: { id: string; text: string; maxLines?: number; suppressTooltip?: boolean }) {
  const showFullTextControl = !suppressTooltip && text.length > (maxLines === 2 ? 70 : longQuestionCharacterLimit);

  return (
    <Flex flex="1" minW="0" align="center" gap="8px">
      <Text id={`${id}-text`} noOfLines={maxLines} lineHeight="1.35">
        {text}
      </Text>
      {showFullTextControl ? (
        <Popover placement="top-start" closeOnBlur>
          <PopoverTrigger>
            <IconButton
              aria-label={`Read full question: ${text}`}
              icon={<Info size={16} />}
              size="xs"
              flex="0 0 auto"
              color="brand.500"
              bg="#EDF6FF"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="full"
              _hover={{ bg: "#DDEEFF" }}
            />
          </PopoverTrigger>
          <PopoverContent maxW={{ base: "calc(100vw - 32px)", md: "520px" }} borderColor="gray.200" boxShadow="lg">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader color="brand.500" fontWeight="900">Full question</PopoverHeader>
            <PopoverBody color="gray.700" lineHeight="1.5" userSelect="text" pr="40px">
              {text}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : null}
    </Flex>
  );
}

function ScoreBand({ score }: { score: ScoreResult }) {
  const colors = scoreColors[score.band.tone];
  return (
    <Flex minH="106px" p="14px 16px" direction="column" justify="center" bg="white" border="1px solid" borderColor="gray.200" borderRadius="8px" overflow="hidden">
      <Text {...labelStyle}>Survey Score</Text>
      <HStack mt="8px" spacing="10px" align="end">
        <Flex px="10px" py="6px" align="center" bg={colors.bg} color={colors.color} borderRadius="6px">
          <Text fontSize="12px" fontWeight="900" letterSpacing="0.8px" textTransform="uppercase">{score.band.label}</Text>
        </Flex>
        <Text color={colors.color} fontSize="42px" fontWeight="800" lineHeight="0.95">{score.score}</Text>
        <Text pb="5px" color="gray.600" fontSize="12px" fontWeight="900">/ {score.maxScore}</Text>
      </HStack>
    </Flex>
  );
}

createRoot(document.getElementById("root")!).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
