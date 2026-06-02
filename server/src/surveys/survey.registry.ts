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

export const scoreBands: ScoreBand[] = [
  { min: 0, max: 4, label: "Minimal", tone: "blue" },
  { min: 5, max: 9, label: "Mild", tone: "green" },
  { min: 10, max: 14, label: "Moderate", tone: "yellow" },
  { min: 15, max: 19, label: "Moderately severe", tone: "orange" },
  { min: 20, max: 27, label: "Severe", tone: "red" }
];

export const surveys: SurveyDefinition[] = [
  {
    id: "phq9",
    shortName: "PHQ9",
    title: "Patient Health Questionnaire",
    subtitle: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    timeframe: "Over the last 2 weeks",
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
  }
];
