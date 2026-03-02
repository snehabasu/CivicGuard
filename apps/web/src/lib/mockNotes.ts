import type { FullCaseNote } from "@civicguard/shared";

/**
 * Hardcoded mock FullCaseNote for UI development / demo.
 * `visitId` and `transcript` are placeholders — overwritten at runtime.
 */
export const mockFullCaseNote: Omit<FullCaseNote, "visitId" | "patientName" | "transcript"> = {
  isDraft: true,
  draftLabel: "DRAFT — pending clinician review",
  generatedAtIso: new Date().toISOString(),
  narrativeSummary:
    "Client presented for a scheduled follow-up session to discuss ongoing challenges with housing instability and associated anxiety. Client reported difficulty sleeping due to uncertainty about their housing situation and described feeling overwhelmed by the application process for transitional housing. Client demonstrated appropriate coping strategies discussed in previous sessions, including deep breathing and journaling. Clinician provided psychoeducation on stress management techniques and assisted client in identifying next steps for their housing application. A follow-up appointment was scheduled for next week.",
  soap: {
    subjective:
      "Client reports increased anxiety related to housing instability. States 'I can't sleep because I don't know where I'll be living next month.' Reports using journaling as a coping mechanism but finds it insufficient during peak stress. Denies suicidal ideation or self-harm.",
    objective:
      "Client appeared alert and oriented x4. Affect was anxious but congruent with reported mood. Speech was normal in rate and volume. Client maintained good eye contact and was cooperative throughout the session. No signs of acute distress observed.",
    assessment:
      "Client continues to experience adjustment disorder with anxiety (F43.22) related to housing instability. Current coping strategies are partially effective. Client would benefit from continued support and skill-building around distress tolerance. Risk level remains low.",
    plan:
      "1. Continue weekly individual therapy sessions.\n2. Introduce grounding techniques for acute anxiety episodes.\n3. Assist client with transitional housing application at next session.\n4. Reassess anxiety symptoms and coping effectiveness in 2 weeks.\n5. Coordinate with case manager regarding housing resources.",
  },
  psychosocial: {
    crisisReason: {
      value:
        "Housing instability and associated anxiety impacting sleep and daily functioning.",
      confidence: "high",
    },
    substanceUse: {
      value: "Client denies current substance use. No history of substance use disorder reported.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value:
        "Housing instability began approximately 3 months ago following job loss. Anxiety symptoms have been present for 6 weeks.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "No history of aggression or violent behavior reported or observed.",
      confidence: "medium",
    },
    supportSystems: {
      value:
        "Client identifies a close friend and a sibling as primary supports. Client is connected with a community case manager.",
      confidence: "high",
    },
    pastInterventions: {
      value:
        "Client participated in group therapy at a community mental health center approximately 2 years ago. Reports it was helpful for developing coping skills.",
      confidence: "medium",
    },
  },
  stressFlags: [
    {
      keyword: "housing instability",
      severity: "high",
      context: "Client expressed significant distress about uncertain living situation.",
    },
    {
      keyword: "sleep disturbance",
      severity: "medium",
      context: "Client reports difficulty sleeping due to anxiety about housing.",
    },
    {
      keyword: "job loss",
      severity: "medium",
      context: "Recent job loss is the precipitating factor for current housing crisis.",
    },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [
      "Avoid documenting specific addresses or locations of shelters client has visited.",
      "Do not include details about client's immigration or legal status if disclosed.",
    ],
    insurancePhrasing: [
      "Session focused on evidence-based interventions for adjustment disorder with anxiety.",
      "Therapeutic techniques included psychoeducation, cognitive restructuring, and resource coordination.",
    ],
  },
};

export type MockNote = {
  id: string;
  patientName: string;
  initials: string;
  avatarColor: string;
  time: string;
  tags: string[];
};

export type NoteGroup = {
  label: string;
  notes: MockNote[];
};

export const mockPatients = [
  { name: "Lisa Smith", initials: "LS", avatarColor: "bg-teal-light" },
  { name: "Jennifer Simpson", initials: "JS", avatarColor: "bg-amber" },
  { name: "Jonny Clarkson", initials: "JC", avatarColor: "bg-teal" },
  { name: "Sarah Mitchell", initials: "SM", avatarColor: "bg-surface-hover" },
  { name: "David Okafor", initials: "DO", avatarColor: "bg-teal-lighter" },
];

export const mockNoteGroups: NoteGroup[] = [
  {
    label: "Today",
    notes: [
      {
        id: "1",
        patientName: "Lisa Smith",
        initials: "LS",
        avatarColor: "bg-teal-light",
        time: "12:21pm",
        tags: ["Foot Fx", "Pain"],
      },
      {
        id: "2",
        patientName: "Jennifer Simpson",
        initials: "JS",
        avatarColor: "bg-amber",
        time: "10:45am",
        tags: ["PTSD", "Anxiety"],
      },
      {
        id: "3",
        patientName: "Jonny Clarkson",
        initials: "JC",
        avatarColor: "bg-teal",
        time: "9:15am",
        tags: ["Intake", "Housing"],
      },
    ],
  },
  {
    label: "Yesterday",
    notes: [
      {
        id: "4",
        patientName: "Sarah Mitchell",
        initials: "SM",
        avatarColor: "bg-surface-hover",
        time: "4:00pm",
        tags: ["Crisis", "Safety Plan"],
      },
      {
        id: "5",
        patientName: "David Okafor",
        initials: "DO",
        avatarColor: "bg-teal-lighter",
        time: "11:30am",
        tags: ["Follow-up", "Medication"],
      },
    ],
  },
  {
    label: "Feb 25",
    notes: [
      {
        id: "6",
        patientName: "Lisa Smith",
        initials: "LS",
        avatarColor: "bg-teal-light",
        time: "3:00pm",
        tags: ["Group Session", "Coping Skills"],
      },
    ],
  },
];
