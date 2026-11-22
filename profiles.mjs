// A stage specifies its name, action, human decision and observable check.
export const modes = {
  Basic: ["Document or email", "Image or media prompt", "Other bounded task"],
  Advanced: ["Research", "Coding", "Debugging"],
  Personalized: ["App building", "Multi-app automation"]
};
export const statuses = ["Not started","Awaiting approval","In progress","Waiting for user","Blocked","Complete"];
const basic = [
  ["Confirm approach","Outline the deliverable against each must-have.","Approve the outline and resolve material gaps.","An agreed outline covers each required item."],
  ["Produce and validate","Draft the requested artifact and check each requirement.","Review the result.","Deliver the artifact plus a short checklist with pass or open beside each requirement."]
];
export const profiles = {
  "Document or email": ["Editor", "Audience and intent → outline → draft → editorial check","A ready-to-use draft",["Audience and intended use","Tone and length"],basic],
  "Image or media prompt": ["Visual director","Subject → composition → lighting and style → descriptive prompt","One reusable visual prompt",["Subject and composition","Style, aspect ratio and exclusions"],basic],
  "Other bounded task": ["Task specialist","Define the outcome → outline the work → produce and check the artifact","A concise finished deliverable",["Intended use","Quality or format preferences"],basic],
  Research: ["Research analyst","Decision → research questions → sources → evidence table → synthesis","A sourced briefing with evidence gaps",["Decision supported","Industry, geography and exclusions","As-of date and period","Preferred sources, freshness and citations","Criteria and weights"],[
    ["Scope approval","Frame answerable questions and define the evidence cutoff.","Approve scope and decision criteria.","Each question maps to a decision criterion."],
    ["Research plan","Map each question to sources and a retrieval method.","Provide access to private materials if needed.","Source plan covers every question."],
    ["Evidence collection","Record source, date, claim and supporting passage for material findings.","Supply unavailable documents or accept a documented gap.","Each factual finding has a retrievable citation or an explicit gap."],
    ["Analysis","Compare findings against agreed criteria and surface conflicts.","Resolve consequential weighting choices.","The evidence table supports each recommendation."],
    ["Validation and delivery","Check coverage, dates, citations and conflicting evidence.","Review the briefing.","Deliver the briefing with working references, uncertainties and limits."]
  ]],
  Coding: ["Software developer","Existing components → interfaces → data flow → focused change → tests","A focused patch with test results",["Language, framework and versions","Repository, allowed files and dependency rules","Inputs, outputs and edge cases","Test commands and restore point"],[
    ["Inspect and plan","Inspect the approved files and map the change against existing behavior.","Identify the repository and allowed paths.","Cite the relevant files and current behavior."],
    ["Architecture approval","Propose interfaces, dependencies, tests and rollback.","Approve the design and dependency changes.","Record agreed interfaces and test cases."],
    ["Implement","Make the scoped change in the approved workspace.","Nothing beyond stage approval.","Show the diff and explain each changed path."],
    ["Test","Run approved tests and exercise the target behavior.","Run commands if the agent lacks terminal access.","Record commands, exit status and observed results. Label unexecuted code."],
    ["Review and handoff","Summarize changes, limitations, startup and rollback steps.","Review outstanding risks.","Reconcile the diff and test evidence with each requirement."]
  ]],
  Debugging: ["Debugging engineer","Observed evidence → hypotheses → discriminating test → fix → regression","A diagnosis, targeted fix and regression evidence",["Expected behavior","Actual behavior and error","Reproduction steps and frequency","Environment and recent changes","Attempted fixes, allowed changes and restore point"],[
    ["Collect evidence","Capture expected and actual behavior and reproduce in an authorized environment.","Supply redacted logs and reproduction conditions.","Record the observed failure or mark reproduction blocked."],
    ["Diagnose","List plausible causes and test a prediction for each.","Clarify environmental differences if blocking.","Distinguish supported causes from untested hypotheses."],
    ["Approve fix","Propose the smallest correction, side effects and restore point.","Approve affected files and rollback.","Record a reversible fix plan."],
    ["Apply fix","Apply the approved patch.","Nothing beyond stage approval.","Show the focused diff and preserved restore point."],
    ["Verify and hand off","Rerun the original case and nearby regression checks.","Confirm user-visible behavior if needed.","Report before/after observations and unresolved issues."]
  ]],
  "App building": ["Application architect and developer","User journey → screens → services → data and permissions → tests → release","A runnable MVP with setup and handoff notes",["Intended users and main journeys","Must-have features and deferred scope","Platform, screens and roles","Data entities, permissions and integrations","Budget and existing assets","Release target and rollback"],[
    ["Discovery and MVP","Turn the goal into user journeys and observable acceptance cases.","Approve primary users and deferred scope.","Each must-have maps to a journey and acceptance case."],
    ["Architecture and tools","Map screens, services, data and tool placement.","Approve stack, budget and data movement.","Record selected tools and interfaces."],
    ["Access and setup","Prepare configuration placeholders and verify allowed access.","Grant minimum permissions through each service dashboard.","Report successful checks or exact missing access."],
    ["Build","Implement one approved component and journey at a time.","Resolve product decisions that affect scope.","The scoped journey works with representative data."],
    ["Testing and security review","Exercise normal, failure and unauthorized cases.","Confirm which roles may access each dataset.","Record checks and evidence for each acceptance case."],
    ["Deployment","Prepare release and rollback; activate only with explicit approval.","Approve the named target and production release.","Verify the running version and rollback procedure."],
    ["Handoff","Document setup, operation, maintenance and remaining work.","Name the maintenance owner.","Deliver a reproducible launch procedure and limitations."]
  ]],
  "Multi-app automation": ["Workflow designer","Trigger → validate → transform → draft → review → final action → monitor","A tested workflow package with activation and recovery instructions",["Trigger event or schedule","Field mapping, filters and branching","Data movement and permission limits","Sample success and failure records","Monitoring owner and alert destination","Rollout and disable procedure"],[
    ["Scope and mapping","Trace one example record from trigger through final action.","Approve mappings and sensitive data movement.","Record input/output fields and protected actions."],
    ["Access and setup","Define minimum permissions and test connections using placeholders.","Authorize each service in its own dashboard.","Confirm connection checks without exposing secrets."],
    ["Workflow build","Configure trigger, transforms, deduplication, review and monitoring.","Resolve ambiguous mapping rules.","A draft workflow maps every approved step."],
    ["Test and recover","Run sandbox samples including duplicate, invalid and partial-success cases.","Provide sanitized samples.","Show one intended effect per event and recoverable failures."],
    ["Activation","Prepare enable/disable steps and check a limited rollout.","Approve the named live target and activation.","Observe the first authorized result and its audit entry."],
    ["Handoff","Document owner, alerts, recovery and disable controls.","Accept ownership of monitoring.","Owner can locate a failed record and disable the workflow."]
  ]]
};

