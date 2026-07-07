import { SurveyDefinition, ScoreBand } from "./survey.types.js";

const frequencyOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];

const difficultyOptions = [
  "Not difficult at all",
  "Somewhat difficult",
  "Very difficult",
  "Extremely difficult"
];

const uclaBtsOptions = [
  { label: "None", value: 0 },
  { label: "Little", value: 1 },
  { label: "Some", value: 2 },
  { label: "Much", value: 3 },
  { label: "Most of the time", value: 4 }
];

export const scoreBands: ScoreBand[] = [
  { min: 0, max: 4, label: "Minimal", tone: "blue" },
  { min: 5, max: 9, label: "Mild", tone: "green" },
  { min: 10, max: 14, label: "Moderate", tone: "yellow" },
  { min: 15, max: 19, label: "Moderately severe", tone: "orange" },
  { min: 20, max: 27, label: "Severe", tone: "red" }
];

export const uclaBtsScoreBands: ScoreBand[] = [
  { min: 0, max: 10, label: "Minimal PTSD symptoms", tone: "blue" },
  { min: 11, max: 20, label: "Mild PTSD symptoms", tone: "green" },
  { min: 21, max: 44, label: "Potential PTSD", tone: "red" }
];

export const surveys: SurveyDefinition[] = [
  {
    id: "phq9",
    shortName: "PHQ9",
    title: "Patient Health Questionnaire",
    subtitle: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    timeframe: "Over the last 2 weeks",
    scoring: "scored",
    options: frequencyOptions,
    questions: [
      { id: "phq9_1", text: "Little interest or pleasure in doing things" },
      { id: "phq9_2", text: "Feeling down, depressed, or hopeless" },
      { id: "phq9_3", text: "Trouble falling or staying asleep, or sleeping too much" },
      { id: "phq9_4", text: "Feeling tired or having little energy" },
      { id: "phq9_5", text: "Poor appetite or overeating" },
      { id: "phq9_6", text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down" },
      { id: "phq9_7", text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
      { id: "phq9_8", text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual" },
      { id: "phq9_9", text: "Thoughts that you would be better off dead, or of hurting yourself in some way" }
    ],
    difficulty: {
      id: "phq9_difficulty",
      prompt: "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
      options: difficultyOptions
    },
    scoreBands,
    maxScore: 27
  },
  {
    id: "gad7",
    shortName: "GAD7",
    title: "Generalized Anxiety Disorder",
    subtitle: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    timeframe: "Over the last 2 weeks",
    scoring: "scored",
    options: frequencyOptions,
    questions: [
      { id: "gad7_1", text: "Feeling nervous, anxious, or on edge" },
      { id: "gad7_2", text: "Not being able to stop or control worrying" },
      { id: "gad7_3", text: "Worrying too much about different things" },
      { id: "gad7_4", text: "Trouble relaxing" },
      { id: "gad7_5", text: "Being so restless that it is hard to sit still" },
      { id: "gad7_6", text: "Becoming easily annoyed or irritable" },
      { id: "gad7_7", text: "Feeling afraid, as if something awful might happen" }
    ],
    difficulty: {
      id: "gad7_difficulty",
      prompt: "If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?",
      options: difficultyOptions
    },
    scoreBands,
    maxScore: 21
  },
  {
    id: "ucla-bts",
    shortName: "UCLA-BTS",
    title: "PTSD Symptoms",
    subtitle: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    timeframe: "Over the last 2 weeks",
    scoring: "scored",
    options: uclaBtsOptions,
    questions: [
      { id: "ucla_1", text: "I try to stay away from people, places, or things that remind me about what happened." },
      { id: "ucla_2", text: "I have irritable behavior or angry outbursts." },
      { id: "ucla_3", text: "I have problems concentrating." },
      { id: "ucla_4", text: "When something reminds me of what happened, I feel very upset or distressed." },
      { id: "ucla_5", text: "I have trouble feeling positive emotions like happiness, love, or satisfaction." },
      { id: "ucla_6", text: "I try to avoid thinking about what happened or talking about my feelings about it." },
      { id: "ucla_7", text: "When something reminds me of what happened, my body reacts (for example, heart racing, sweating, or feeling tense)." },
      { id: "ucla_8", text: "I have strong negative beliefs about myself, other people, or the world." },
      { id: "ucla_9", text: "I feel detached or estranged from others." },
      { id: "ucla_10", text: "Upsetting memories about what happened come into my mind when I don't want them to." },
      { id: "ucla_11", text: "I have sleep problems." }
    ],
    scoreBands: uclaBtsScoreBands,
    maxScore: 44
  }
];
