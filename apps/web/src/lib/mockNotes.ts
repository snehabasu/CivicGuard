import type { FullCaseNote, ApprovedCaseNote } from "@carenotes/shared";
import { getAllNotes, saveNote } from "./noteStorage";

export type MockNote = {
  id: string;
  visitId: string;
  patientName: string;
  initials: string;
  avatarColor: string;
  time: string;
  tags: string[];
  status: "draft" | "approved";
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
        visitId: "visit_demo_lisa_today",
        patientName: "Lisa Smith",
        initials: "LS",
        avatarColor: "bg-teal-light",
        time: "12:21pm",
        tags: ["Foot Fx", "Pain"],
        status: "draft",
      },
      {
        id: "2",
        visitId: "visit_demo_jennifer_today",
        patientName: "Jennifer Simpson",
        initials: "JS",
        avatarColor: "bg-amber",
        time: "10:45am",
        tags: ["PTSD", "Anxiety"],
        status: "approved",
      },
      {
        id: "3",
        visitId: "visit_demo_jonny_today",
        patientName: "Jonny Clarkson",
        initials: "JC",
        avatarColor: "bg-teal",
        time: "9:15am",
        tags: ["Intake", "Housing"],
        status: "draft",
      },
    ],
  },
  {
    label: "Yesterday",
    notes: [
      {
        id: "4",
        visitId: "visit_demo_sarah_yesterday",
        patientName: "Sarah Mitchell",
        initials: "SM",
        avatarColor: "bg-surface-hover",
        time: "4:00pm",
        tags: ["Crisis", "Safety Plan"],
        status: "approved",
      },
      {
        id: "5",
        visitId: "visit_demo_david_yesterday",
        patientName: "David Okafor",
        initials: "DO",
        avatarColor: "bg-teal-lighter",
        time: "11:30am",
        tags: ["Follow-up", "Medication"],
        status: "approved",
      },
    ],
  },
  {
    label: "Feb 25",
    notes: [
      {
        id: "6",
        visitId: "visit_demo_lisa_feb25",
        patientName: "Lisa Smith",
        initials: "LS",
        avatarColor: "bg-teal-light",
        time: "3:00pm",
        tags: ["Group Session", "Coping Skills"],
        status: "draft",
      },
    ],
  },
];

// --- Dummy FullCaseNote data (drafts) ---

const draftLisaToday: FullCaseNote = {
  visitId: "visit_demo_lisa_today",
  patientName: "Lisa Smith",
  isDraft: true,
  draftLabel: "DRAFT — pending clinician review",
  generatedAtIso: new Date().toISOString(),
  transcript:
    "Clinician: Good afternoon, Lisa. How have you been since our last visit?\nClient: Hi. Not great, honestly. My foot is still really bothering me. The pain has been worse this week, especially at night.\nClinician: I'm sorry to hear that. Can you describe the pain?\nClient: It's a sharp, throbbing pain around the fracture site. I've been trying to stay off it, but it's hard with everything going on.\nClinician: Are you still using the crutches?\nClient: Yes, but they hurt my hands. I'm exhausted from it all.\nClinician: Let's talk about pain management strategies and see if we need to adjust anything.",
  narrativeSummary:
    "Client presented for a follow-up regarding a foot fracture sustained two weeks ago. Client reports worsening pain, particularly at night, and difficulty with mobility despite use of crutches. Client expressed fatigue related to limited mobility. Clinician discussed pain management options and coping strategies for activity limitations.",
  soap: {
    subjective:
      "Client reports worsening pain at the fracture site, particularly at night. States 'It's a sharp, throbbing pain.' Reports difficulty using crutches due to hand discomfort. Expresses fatigue and frustration with limited mobility.",
    objective:
      "Client appeared fatigued but alert and oriented x4. Affect congruent with reported mood. Client was using crutches appropriately. No signs of acute distress. Foot still in walking boot per orthopedic instructions.",
    assessment:
      "Client continues to recover from left foot fracture with increasing pain that may require reassessment. Adjustment to temporary disability is a psychosocial stressor. No safety concerns at this time.",
    plan:
      "1. Coordinate with primary care regarding pain management.\n2. Introduce relaxation techniques for pain coping.\n3. Discuss activity modifications for daily functioning.\n4. Follow-up appointment in one week.",
  },
  psychosocial: {
    crisisReason: {
      value: "Pain from foot fracture impacting daily functioning and sleep quality.",
      confidence: "high",
    },
    substanceUse: {
      value: "No substance use concerns reported.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value: "Foot fracture occurred 2 weeks ago. Pain has been worsening over the past week.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "No history of aggression reported.",
      confidence: "medium",
    },
    supportSystems: {
      value: "Client has a supportive spouse who assists with daily activities.",
      confidence: "high",
    },
    pastInterventions: {
      value: "Client has attended physical therapy in the past for a previous knee injury.",
      confidence: "medium",
    },
  },
  stressFlags: [
    { keyword: "chronic pain", severity: "high", context: "Client reports worsening foot fracture pain." },
    { keyword: "sleep disturbance", severity: "medium", context: "Pain is disrupting client's sleep." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [],
    insurancePhrasing: [
      "Session focused on pain coping and psychosocial adjustment to temporary disability.",
    ],
  },
  icdCodes: [
    { code: "M84.372A", description: "Stress fracture, left ankle and foot, initial encounter", confidence: "high" },
    { code: "Z96.641", description: "Presence of right artificial hip joint", confidence: "low" },
  ],
  followUpQuestions: [
    { question: "Has pain management changed since the last visit, and are you using any over-the-counter medications?", rationale: "Assessing current pain regimen helps coordinate care with primary physician." },
    { question: "How is the limited mobility affecting your mood and daily routine?", rationale: "Adjustment to physical limitation is a key psychosocial stressor warranting monitoring." },
  ],
};

const draftJonnyToday: FullCaseNote = {
  visitId: "visit_demo_jonny_today",
  patientName: "Jonny Clarkson",
  isDraft: true,
  draftLabel: "DRAFT — pending clinician review",
  generatedAtIso: new Date().toISOString(),
  transcript:
    "Clinician: Hi Jonny, welcome. This is your intake session, so I'd like to learn a bit about what brings you here today.\nClient: Yeah, thanks. I've been having a really hard time finding stable housing. I got evicted about two months ago and I've been couch surfing since then.\nClinician: That sounds very stressful. How has that been affecting you?\nClient: I can't focus on anything. I feel like I'm always in survival mode. I can't even look for a job properly because I don't have a stable address.\nClinician: Are you currently connected with any housing assistance programs?\nClient: I applied to one but haven't heard back. I don't really know what else is out there.",
  narrativeSummary:
    "Client presented for an intake session. Client reports housing instability following eviction two months ago, currently couch surfing. Client describes difficulty concentrating, persistent survival-mode thinking, and inability to pursue employment without stable housing. Client has applied to one housing assistance program but is not aware of other available resources.",
  soap: {
    subjective:
      "Client reports housing instability for 2 months following eviction. States he has been couch surfing. Reports difficulty concentrating, feeling 'always in survival mode,' and inability to seek employment. Applied to one housing program with no response yet.",
    objective:
      "Client appeared anxious but cooperative. Alert and oriented x4. Speech was pressured at times when discussing housing situation. Affect anxious, congruent with content. Grooming appropriate. No safety concerns identified during intake.",
    assessment:
      "Client presents with adjustment disorder with mixed anxiety and depressed mood (F43.23) secondary to housing instability. Psychosocial stressors are significant. Risk level currently low but situation is destabilizing.",
    plan:
      "1. Complete full psychosocial assessment at next visit.\n2. Provide resource list for housing assistance programs.\n3. Refer to case management for housing coordination.\n4. Schedule weekly sessions.\n5. Screen for depression and anxiety with standardized measures at next visit.",
  },
  psychosocial: {
    crisisReason: {
      value: "Housing instability following eviction, impacting ability to function and seek employment.",
      confidence: "high",
    },
    substanceUse: {
      value: "Not assessed during this intake session.",
      confidence: "insufficient_data",
    },
    longevityOfIssues: {
      value: "Housing instability began 2 months ago following eviction.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "Not assessed during intake.",
      confidence: "insufficient_data",
    },
    supportSystems: {
      value: "Client has friends willing to let him stay temporarily. No family support mentioned.",
      confidence: "medium",
    },
    pastInterventions: {
      value: "No prior mental health treatment reported.",
      confidence: "medium",
    },
  },
  stressFlags: [
    { keyword: "housing instability", severity: "high", context: "Client evicted 2 months ago, couch surfing." },
    { keyword: "unemployment", severity: "medium", context: "Cannot pursue employment without stable address." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [
      "Do not document specific addresses or names of individuals providing temporary housing.",
    ],
    insurancePhrasing: [
      "Intake session for adjustment disorder with psychosocial stressors related to housing.",
    ],
  },
  icdCodes: [
    { code: "F43.23", description: "Adjustment disorder with mixed anxiety and depressed mood", confidence: "high" },
    { code: "Z59.0", description: "Homelessness", confidence: "high" },
    { code: "Z56.0", description: "Unemployment, unspecified", confidence: "medium" },
  ],
  followUpQuestions: [
    { question: "Have you received any response from the housing assistance program you applied to?", rationale: "Monitoring housing application status is critical to case management planning." },
    { question: "Can you tell me more about your support network — who you are staying with and their capacity to continue hosting?", rationale: "Assessing housing stability timeline informs urgency of intervention." },
    { question: "Have you experienced any symptoms of depression or anxiety beyond difficulty concentrating?", rationale: "Intake did not fully screen for depression/anxiety; standardized assessment is warranted." },
  ],
};

const draftLisaFeb25: FullCaseNote = {
  visitId: "visit_demo_lisa_feb25",
  patientName: "Lisa Smith",
  isDraft: true,
  draftLabel: "DRAFT — pending clinician review",
  generatedAtIso: "2026-02-25T15:00:00.000Z",
  transcript:
    "Clinician: Welcome back to group, everyone. Lisa, would you like to share how your week went?\nClient: Sure. I tried the deep breathing exercise we talked about last session. It actually helped when I was feeling overwhelmed at the pharmacy.\nClinician: That's great progress. Can you tell the group more about that situation?\nClient: I was waiting in line and started feeling really anxious, so I did the 4-7-8 breathing. It didn't make the anxiety go away completely, but I felt more in control.\nClinician: That's exactly how coping skills work — they give you tools to manage the intensity.",
  narrativeSummary:
    "Client participated in group therapy session focused on coping skills practice. Client reported successfully using deep breathing (4-7-8 technique) during an anxiety episode at a pharmacy. Client demonstrated improved understanding of coping skill application and shared experience with group.",
  soap: {
    subjective:
      "Client reports using 4-7-8 breathing technique learned in previous session during an anxiety episode at a pharmacy. States it helped her feel 'more in control' though anxiety was not eliminated. Expressed willingness to continue practicing coping strategies.",
    objective:
      "Client was an active participant in group session. Shared personal experience voluntarily. Affect was calm, mood appeared improved from previous sessions. Engaged positively with other group members.",
    assessment:
      "Client is making progress with coping skills acquisition. Ability to apply techniques in real-world settings indicates skill generalization. Anxiety symptoms persisting but becoming more manageable.",
    plan:
      "1. Continue group therapy sessions weekly.\n2. Introduce grounding techniques as additional coping tools.\n3. Encourage continued practice of breathing exercises.\n4. Individual session follow-up as needed.",
  },
  psychosocial: {
    crisisReason: {
      value: "Ongoing anxiety management; no acute crisis at this time.",
      confidence: "high",
    },
    substanceUse: {
      value: "No substance use reported in group setting.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value: "Anxiety issues have been present for several months per previous documentation.",
      confidence: "medium",
    },
    aggressionHistory: {
      value: "No aggression history noted.",
      confidence: "medium",
    },
    supportSystems: {
      value: "Group therapy peers serve as additional support system.",
      confidence: "medium",
    },
    pastInterventions: {
      value: "Currently engaged in group therapy. Previously in individual sessions.",
      confidence: "high",
    },
  },
  stressFlags: [
    { keyword: "anxiety", severity: "medium", context: "Ongoing anxiety with improving coping." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [],
    insurancePhrasing: [
      "Group therapy session focused on evidence-based coping skills training and practice.",
    ],
  },
  icdCodes: [
    { code: "F41.1", description: "Generalized anxiety disorder", confidence: "medium" },
  ],
  followUpQuestions: [
    { question: "In which other situations this week did you experience anxiety, and did you attempt the coping techniques?", rationale: "Tracking generalization of skills across settings informs treatment effectiveness." },
    { question: "On a scale of 1–10, how would you rate your overall anxiety level this week compared to the previous week?", rationale: "Quantifying symptom trajectory supports outcome monitoring and insurance documentation." },
  ],
};

// --- Dummy ApprovedCaseNote data ---

const approvedJenniferToday: ApprovedCaseNote = {
  visitId: "visit_demo_jennifer_today",
  patientName: "Jennifer Simpson",
  isDraft: false,
  approvedAtIso: new Date().toISOString(),
  approvedBy: "Dr. Maria Chen",
  transcript:
    "Clinician: Jennifer, how have you been managing since our last session?\nClient: It's been rough. I had a nightmare again about the incident. Woke up in a cold sweat.\nClinician: I'm sorry to hear that. How often are the nightmares occurring now?\nClient: About three times this week. During the day, I get these flashbacks too, especially when I hear loud noises.\nClinician: We've been working on the grounding techniques. Were you able to use them when the flashbacks happened?\nClient: Sometimes. The 5-4-3-2-1 thing helps a bit, but in the moment it's hard to remember.\nClinician: That's very normal. Let's keep practicing and talk about some additional strategies today.",
  narrativeSummary:
    "Client presented for ongoing PTSD treatment. Reports continued nightmares (3 times this week) and daytime flashbacks triggered by loud noises. Client is partially utilizing grounding techniques (5-4-3-2-1 method) but reports difficulty accessing them during acute episodes. Session focused on reinforcing existing coping strategies and introducing additional trauma-informed interventions.",
  soap: {
    subjective:
      "Client reports nightmares approximately 3 times per week related to traumatic incident. Describes daytime flashbacks triggered by loud noises. States grounding technique (5-4-3-2-1) is 'sometimes' helpful but difficult to access during acute episodes. Denies suicidal ideation.",
    objective:
      "Client appeared tired but engaged. Affect was constricted when discussing trauma content, brightened when discussing coping successes. Alert and oriented x4. No psychomotor abnormalities. Hypervigilance noted when office door closed unexpectedly.",
    assessment:
      "PTSD (F43.10) with ongoing re-experiencing symptoms. Nightmares and flashbacks remain frequent but client is developing coping repertoire. Treatment response is gradual. Risk level remains moderate due to symptom severity.",
    plan:
      "1. Continue weekly trauma-focused therapy.\n2. Introduce cognitive processing therapy techniques.\n3. Reinforce grounding skills with written cue card for client to carry.\n4. Discuss sleep hygiene strategies for nightmare management.\n5. Reassess symptom severity with PCL-5 at next session.",
  },
  psychosocial: {
    crisisReason: {
      value: "PTSD symptoms including nightmares and flashbacks impacting sleep and daily functioning.",
      confidence: "high",
    },
    substanceUse: {
      value: "No current substance use reported.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value: "PTSD symptoms began approximately 8 months ago following traumatic incident.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "No aggression history reported.",
      confidence: "medium",
    },
    supportSystems: {
      value: "Client has a supportive partner and attends a peer support group biweekly.",
      confidence: "high",
    },
    pastInterventions: {
      value: "Client has been in individual therapy for 4 months. Previously tried medication (SSRI) with partial response.",
      confidence: "high",
    },
  },
  stressFlags: [
    { keyword: "PTSD", severity: "high", context: "Active PTSD with nightmares and flashbacks." },
    { keyword: "sleep disturbance", severity: "high", context: "Nightmares disrupting sleep 3x per week." },
    { keyword: "hypervigilance", severity: "medium", context: "Observed startle response during session." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [
      "Do not include specific details of the traumatic incident in documentation.",
    ],
    insurancePhrasing: [
      "Trauma-focused therapy session utilizing evidence-based interventions for PTSD.",
    ],
  },
  icdCodes: [
    { code: "F43.10", description: "Post-traumatic stress disorder, unspecified", confidence: "high" },
    { code: "G47.00", description: "Insomnia, unspecified", confidence: "medium" },
  ],
  followUpQuestions: [
    { question: "How many nights this week did nightmares occur, and what time of night did they typically happen?", rationale: "Tracking nightmare frequency and timing informs sleep intervention planning." },
    { question: "When a flashback occurred during the week, were you able to use the grounding technique before or only after the episode peaked?", rationale: "Understanding timing of coping skill activation helps calibrate future skill-building." },
    { question: "Are there specific locations or times of day where hypervigilance feels most intense?", rationale: "Identifying high-trigger environments supports exposure hierarchy development." },
  ],
};

const approvedSarahYesterday: ApprovedCaseNote = {
  visitId: "visit_demo_sarah_yesterday",
  patientName: "Sarah Mitchell",
  isDraft: false,
  approvedAtIso: new Date(Date.now() - 86400000).toISOString(),
  approvedBy: "Dr. Maria Chen",
  transcript:
    "Clinician: Sarah, I understand you called the crisis line last night. Can you tell me what happened?\nClient: I just felt so overwhelmed. Everything piled up — the bills, the kids, my ex showing up unannounced. I didn't want to hurt myself, but I just didn't know what to do.\nClinician: I'm glad you reached out. That took real courage. Are you having any thoughts of self-harm right now?\nClient: No, not right now. Talking to the counselor last night helped. I just need a plan for when things get that bad again.\nClinician: Absolutely. Let's work on a safety plan together today.",
  narrativeSummary:
    "Client presented for an urgent session following contact with crisis line the previous evening. Client reports feeling overwhelmed by financial stressors, childcare responsibilities, and unexpected contact from ex-partner. Client explicitly denies current suicidal ideation or self-harm intent. Session focused on developing a comprehensive safety plan and identifying crisis triggers.",
  soap: {
    subjective:
      "Client reports calling crisis line previous evening due to feeling overwhelmed. Identifies financial stress, childcare demands, and ex-partner contact as precipitating factors. Denies current suicidal ideation or intent to self-harm. States crisis line contact was helpful.",
    objective:
      "Client appeared emotionally drained but cooperative. Affect tearful at times, congruent with content. Alert and oriented x4. Speech normal. Denies access to means. Engaged actively in safety planning process.",
    assessment:
      "Adjustment disorder with mixed disturbance of emotions and conduct (F43.25). Acute stressor response with appropriate help-seeking behavior. Risk level moderate — client demonstrated protective factors including crisis line utilization and therapy engagement. Safety plan developed.",
    plan:
      "1. Complete safety plan with identified coping strategies and emergency contacts.\n2. Increase session frequency to twice weekly for next 2 weeks.\n3. Refer to financial counseling services.\n4. Coordinate with case manager regarding ex-partner safety concerns.\n5. Follow-up phone check-in tomorrow.",
  },
  psychosocial: {
    crisisReason: {
      value: "Acute overwhelm from cumulative stressors — financial, parenting, and interpersonal conflict.",
      confidence: "high",
    },
    substanceUse: {
      value: "Client denies substance use.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value: "Financial and co-parenting stressors ongoing for approximately 6 months since separation.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "No self-directed or other-directed aggression history. Ex-partner contact raises safety considerations.",
      confidence: "medium",
    },
    supportSystems: {
      value: "Client has a close friend and a sister who provide emotional support. Connected with crisis services.",
      confidence: "high",
    },
    pastInterventions: {
      value: "Client has been in therapy for 3 months. First crisis line utilization.",
      confidence: "high",
    },
  },
  stressFlags: [
    { keyword: "crisis contact", severity: "high", context: "Client called crisis line previous evening." },
    { keyword: "safety plan", severity: "high", context: "Safety plan developed during session." },
    { keyword: "domestic concern", severity: "medium", context: "Ex-partner showing up unannounced." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [
      "Do not document specific financial details or amounts.",
      "Limit documentation of ex-partner details to clinically relevant safety information.",
    ],
    insurancePhrasing: [
      "Crisis intervention session with safety planning for adjustment disorder.",
    ],
  },
  icdCodes: [
    { code: "F43.25", description: "Adjustment disorder with mixed disturbance of emotions and conduct", confidence: "high" },
    { code: "Z63.5", description: "Disruption of family by separation and divorce", confidence: "high" },
    { code: "Z59.9", description: "Problem related to housing and economic circumstances, unspecified", confidence: "medium" },
  ],
  followUpQuestions: [
    { question: "Since developing the safety plan, have you identified which coping strategy felt most accessible during a moment of overwhelm?", rationale: "Evaluating safety plan effectiveness ensures it is actionable in future crises." },
    { question: "Has your ex-partner made any additional unannounced contact since our last session?", rationale: "Monitoring safety threat is essential given the interpersonal stressor documented at crisis intake." },
  ],
};

const approvedDavidYesterday: ApprovedCaseNote = {
  visitId: "visit_demo_david_yesterday",
  patientName: "David Okafor",
  isDraft: false,
  approvedAtIso: new Date(Date.now() - 86400000).toISOString(),
  approvedBy: "Dr. Maria Chen",
  transcript:
    "Clinician: David, good to see you. How has the new medication been working for you?\nClient: I think it's helping. My mood has been more stable. I'm not having those big dips like before.\nClinician: That's encouraging. Any side effects?\nClient: A little nausea in the morning for the first few days, but that went away. I'm sleeping better too.\nClinician: Great. And how about the therapy homework — the thought record?\nClient: I did it most days. I noticed my negative thoughts usually come up around work situations.\nClinician: That's a really good insight. Let's explore that pattern today.",
  narrativeSummary:
    "Client presented for a medication follow-up and therapy session. Client reports improved mood stability since starting new medication with minimal initial side effects (nausea, resolved). Sleep has improved. Client completed thought records and identified work-related situations as primary triggers for negative thinking patterns. Session focused on cognitive restructuring around work-related automatic thoughts.",
  soap: {
    subjective:
      "Client reports improved mood stability on current medication. Initial nausea resolved within first few days. Reports improved sleep. Completed thought record homework and identified work situations as primary trigger for negative thinking patterns.",
    objective:
      "Client appeared well-groomed and engaged. Affect was brighter than previous sessions, mood described as 'more stable.' Alert and oriented x4. Speech normal rate and volume. Thought process logical and goal-directed. Brought completed thought records to session.",
    assessment:
      "Major depressive disorder, recurrent, moderate (F33.1), showing treatment response. Medication adjustment appears effective with improved mood and sleep. Cognitive behavioral therapy is progressing well — client demonstrating insight into thought patterns. Risk level low.",
    plan:
      "1. Continue current medication regimen.\n2. Continue weekly CBT sessions.\n3. Focus next session on cognitive restructuring techniques for work-related thoughts.\n4. Assign behavioral activation exercise for pleasant activities.\n5. Medication management follow-up with psychiatrist in 4 weeks.",
  },
  psychosocial: {
    crisisReason: {
      value: "Recurrent depression managed with medication and therapy; no acute crisis.",
      confidence: "high",
    },
    substanceUse: {
      value: "No substance use reported. No concerns noted.",
      confidence: "medium",
    },
    longevityOfIssues: {
      value: "Depressive episodes recurring over 3 years. Current treatment initiated 6 weeks ago.",
      confidence: "high",
    },
    aggressionHistory: {
      value: "No aggression history.",
      confidence: "medium",
    },
    supportSystems: {
      value: "Client has supportive wife and is active in church community.",
      confidence: "high",
    },
    pastInterventions: {
      value: "Previous trial of SSRI with partial response. Current regimen is second medication trial. Engaged in CBT for 6 weeks.",
      confidence: "high",
    },
  },
  stressFlags: [
    { keyword: "depression", severity: "medium", context: "Recurrent depression, currently improving with treatment." },
    { keyword: "work stress", severity: "low", context: "Work situations identified as cognitive trigger." },
  ],
  boundaries: {
    legalStatusOmitted: true,
    overdocumentationWarnings: [],
    insurancePhrasing: [
      "Medication management follow-up and CBT session for recurrent major depressive disorder.",
    ],
  },
  icdCodes: [
    { code: "F33.1", description: "Major depressive disorder, recurrent, moderate", confidence: "high" },
  ],
  followUpQuestions: [
    { question: "Which specific work situations triggered the most negative automatic thoughts this week, and what were the thoughts?", rationale: "Identifying specific cognitive triggers enables targeted restructuring in the next session." },
    { question: "Have you been able to complete the behavioral activation exercise, and how did it affect your mood?", rationale: "Monitoring homework completion and mood response tracks treatment progress." },
  ],
};

const dummyNotes: (FullCaseNote | ApprovedCaseNote)[] = [
  draftLisaToday,
  approvedJenniferToday,
  draftJonnyToday,
  approvedSarahYesterday,
  approvedDavidYesterday,
  draftLisaFeb25,
];

const SEED_KEY = "caseNotesSeeded_v2";

export function seedDummyNotes(): void {
  if (typeof window === "undefined") return;
  // Only seed if we haven't before
  if (localStorage.getItem(SEED_KEY)) return;
  const existing = getAllNotes();
  const existingIds = new Set(existing.map((n) => n.visitId));
  for (const note of dummyNotes) {
    if (!existingIds.has(note.visitId)) {
      saveNote(note);
    }
  }
  localStorage.setItem(SEED_KEY, "true");
}
