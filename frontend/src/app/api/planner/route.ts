import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { createAiModel } from '@/lib/getAiConfig'
import { NextResponse } from 'next/server'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

// Agent-specific configuration with professional context
const AGENT_CONFIG: Record<string, {
  setup: string
  contextFile: string
  specialCapabilities: string
  bestPractices: string
}> = {
  'claude-code': {
    setup: 'Install: npm install -g @anthropic-ai/claude-code. Authenticate via: claude login',
    contextFile: 'CLAUDE.md at project root (project overview, commands, architecture decisions)',
    specialCapabilities: 'CLI-based. Supports multi-file edits, bash execution, git operations. Use /compact to compress context.',
    bestPractices: 'Use CLAUDE.md for persistent instructions. Chain tasks with &&. Use --dangerously-skip-permissions for automated workflows.'
  },
  'antigravity': {
    setup: 'Google DeepMind Antigravity IDE. Use Planning Mode for complex multi-step tasks.',
    contextFile: '.antigravityignore + Knowledge Items (KI) in .gemini/antigravity-ide/',
    specialCapabilities: 'Planning Mode, Background Tasks, Subagents, Write/Read/Execute permissions, MCP server integrations.',
    bestPractices: 'Set goals with /goal for overnight tasks. Use subagents for parallel work. Leverage KI system for persistent project context.'
  },
  'github-copilot': {
    setup: 'Enable in VS Code or JetBrains. Configure .github/copilot-instructions.md for workspace-level context.',
    contextFile: '.github/copilot-instructions.md (persistent instructions for all Copilot interactions)',
    specialCapabilities: '@workspace, @terminal, /fix, /tests, /explain, /doc. Copilot Workspace for multi-file changes.',
    bestPractices: 'Use #file: references in prompts. Set up copilot-instructions.md before starting. Use /new for fresh sessions.'
  },
  'codex': {
    setup: 'Install: npm install -g @openai/codex. Authenticate: export OPENAI_API_KEY=your_key',
    contextFile: 'AGENTS.md or codex.md at project root for persistent instructions.',
    specialCapabilities: 'Three modes: suggest (preview), auto-edit (apply), full-auto (execute). Sandboxed Docker execution available.',
    bestPractices: 'Use --approval-mode full-auto for automation. Reference AGENTS.md for team-wide context. Use --quiet for CI pipelines.'
  },
  'kiro': {
    setup: 'Amazon Kiro IDE. Use spec-driven development workflow: Requirements → Design → Tasks → Execute.',
    contextFile: '.kiro/steering/ directory for persistent agent instructions (product.md, tech.md, structure.md)',
    specialCapabilities: 'Spec-Driven Dev, Steering Rules (always-on/auto/manual hooks), deep AWS integration, requirement traceability.',
    bestPractices: 'Always create specs before coding. Use hooks for automated tasks on file save. Link requirements to implementation for traceability.'
  },
  'cursor': {
    setup: 'Cursor IDE. Configure .cursorrules in project root for agent behavior. Use Agent Mode for autonomous coding.',
    contextFile: '.cursorrules (project-level AI instructions) or .cursor/rules/ for scoped rules.',
    specialCapabilities: 'Composer for multi-file edits, Agent Mode, Notepads, @file @docs @web @codebase references, MCP integration.',
    bestPractices: 'Write detailed .cursorrules. Use @codebase for context-aware completions. Use Composer Agent for complex features.'
  },
  'windsurf': {
    setup: 'Windsurf IDE by Codeium. Use Cascade for agentic coding flows.',
    contextFile: '.windsurfrules at project root (global rules for all Cascade sessions).',
    specialCapabilities: 'Cascade agent with Flows, Supercomplete inline suggestions, deep codebase indexing, MCP server support.',
    bestPractices: 'Define .windsurfrules with coding standards. Use Flows for multi-step workflows. Trust Cascade to handle multi-file refactors autonomously.'
  }
}

export async function POST(req: Request) {
  console.log('--- API /api/planner CALLED ---')
  try {
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      console.warn('⚠️ Planner API: no valid session.')
    }

    const { prdContent, selectedAgent, projectName, projectId } = await req.json()

    if (!prdContent || !selectedAgent || !projectId) {
      return new NextResponse('PRD content, agent selection, and projectId are required', { status: 400 })
    }

    const agentCfg = AGENT_CONFIG[selectedAgent] || {
      setup: 'Configure your AI coding assistant.',
      contextFile: 'README.md',
      specialCapabilities: 'General coding assistance.',
      bestPractices: 'Provide clear, specific prompts with file paths and context.'
    }

    const systemPrompt = `You are a Principal Engineer and Technical Project Manager with 15+ years of experience at top-tier tech companies (Google, Stripe, Netflix). You specialize in translating PRDs into battle-tested, production-grade implementation plans for AI coding agents.

Your implementation plans are used by development teams at Fortune 500 companies. They must be:
- **Specific**: Reference actual file names, function names, and data types from the PRD.
- **Actionable**: Every Agent Prompt must be a complete, paste-ready instruction.
- **Professional**: Follow industry standards (12-factor app, SOLID, Clean Architecture).
- **Comprehensive**: Cover every phase from environment setup to production monitoring.

## Agent Being Used: ${selectedAgent.toUpperCase()}
- **Setup**: ${agentCfg.setup}
- **Context File**: ${agentCfg.contextFile}
- **Special Capabilities**: ${agentCfg.specialCapabilities}
- **Best Practices**: ${agentCfg.bestPractices}

## Output Format (MANDATORY - follow exactly)

For EACH phase, use this structure:

---

### Phase [N]: [Phase Name]

> **Objective**: [One sentence explaining the goal of this phase.]

#### 📋 Tasks
- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

#### 🤖 Agent Prompt
\`\`\`
[Complete, paste-ready prompt for ${selectedAgent}. Must be specific to the project. Reference actual entities, file paths, and technologies from the PRD. Be detailed enough that the agent can execute without clarification.]
\`\`\`

#### 📁 Expected Files & Artifacts
| File/Directory | Purpose |
|---|---|
| \`path/to/file.ext\` | What this file does |

#### ✅ Acceptance Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]

#### 🔍 Verification Commands
\`\`\`bash
# Command to verify this phase is complete
verification_command --flag
\`\`\`

---

## MANDATORY PHASES (ALL 12 must be present):

**Phase 0: Pre-Flight & Environment Setup**
Cover: OS dependencies, language runtimes, package managers, cloud account creation (AWS/GCP/Vercel/Supabase), API keys, secrets management (.env setup), agent context file creation (${agentCfg.contextFile}), git repository initialization, branch strategy.

**Phase 1: Architecture & Project Scaffolding**
Cover: Tech stack justification, directory structure, monorepo vs. polyrepo decision, framework setup, linting (ESLint/Prettier/Biome), TypeScript strict config, path aliases, initial commit.

**Phase 2: Database & Data Layer**
Cover: Schema design with all entities from PRD, migrations, indexing strategy, ORM setup, seed data, connection pooling, backup strategy.

**Phase 3: Authentication & Authorization**
Cover: Auth method (JWT/OAuth/session), user registration/login/logout flows, role-based access control (RBAC) from PRD requirements, middleware, session management.

**Phase 4: Core Backend API**
Cover: RESTful or GraphQL API design, every endpoint from the PRD, request validation (Zod/Joi), error handling middleware, API versioning, pagination strategy.

**Phase 5: Frontend Architecture**
Cover: Design system setup (Shadcn/Radix/custom), global state management, routing, layout components, responsive design tokens, dark mode.

**Phase 6: Feature Implementation**
Cover: Implement EVERY feature listed in the PRD. Break each feature into: component → API hook → state → UI. Be very specific.

**Phase 7: Third-Party Integrations**
Cover: All external APIs mentioned in the PRD (payments, email, storage, etc.), webhook handling, API key rotation strategy, integration testing.

**Phase 8: Testing Strategy**
Cover: Unit tests (business logic), integration tests (API endpoints), E2E tests (critical user flows with Playwright/Cypress), coverage requirements (minimum 80%), snapshot tests for UI.

**Phase 9: Security Hardening**
Cover: OWASP Top 10 checklist, input sanitization, SQL injection prevention, rate limiting, CORS policy, CSP headers, dependency vulnerability scanning (npm audit/Snyk).

**Phase 10: CI/CD Pipeline**
Cover: GitHub Actions / GitLab CI workflow, automated testing on PR, staging deployment, production deployment with manual approval gate, Docker containerization, environment promotion strategy.

**Phase 11: Production Deployment**
Cover: Infrastructure provisioning (IaC with Terraform or platform-specific), environment variables in production, SSL/TLS, CDN setup, database migration in production, zero-downtime deployment strategy, rollback procedure.

**Phase 12: Observability & Monitoring**
Cover: Error tracking (Sentry), application performance monitoring (APM), uptime monitoring, alerting thresholds, log aggregation, dashboard setup (Grafana/Datadog), on-call runbook.

---

### 🏁 Final Pre-Launch Checklist

#### Security Audit
- [ ] All secrets in environment variables (none hardcoded)
- [ ] Authentication on all protected endpoints
- [ ] Input validation on all user-facing endpoints
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

#### Performance
- [ ] Lighthouse score > 90 on all core pages
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Database queries optimized (EXPLAIN ANALYZE)
- [ ] Images optimized and served via CDN

#### Quality
- [ ] All acceptance criteria met
- [ ] Code review completed
- [ ] Test coverage > 80%
- [ ] No critical or high severity vulnerabilities

#### Operations
- [ ] Rollback plan documented and tested
- [ ] Runbook written for on-call team
- [ ] Monitoring dashboards configured
- [ ] Alert channels (Slack/PagerDuty) set up

---

CRITICAL INSTRUCTIONS:
1. You MUST generate ALL phases (0-12) plus the Final Checklist. Do NOT stop early.
2. Every Agent Prompt MUST reference the actual project name, entities, and technologies from the PRD.
3. Be precise with file paths. Do NOT use generic names like "your-file.ts". Use the actual project structure.
4. Every Verification Command must be a real, runnable command.
5. The output will be read by senior engineers. Maintain professional, technical language.`

    const finalPrompt = `Generate the COMPLETE, PROFESSIONAL implementation plan for the project: "${projectName || 'Project'}".

Selected AI Coding Agent: ${selectedAgent}

## PRD (Product Requirements Document):
${prdContent}

---

INSTRUCTIONS:
1. Read the entire PRD above carefully before writing a single line.
2. Extract all entities, features, APIs, tech stack details, and non-functional requirements.
3. Reference them SPECIFICALLY in every phase — especially in the Agent Prompts.
4. The Agent Prompts must be so detailed that a developer can copy-paste them without reading the PRD separately.
5. Use the exact output format specified in your system prompt.
6. Generate ALL 13 phases (Phase 0 through Phase 12) PLUS the Final Pre-Launch Checklist.
7. DO NOT truncate or skip any phase. This plan will be used in production.

Begin the implementation plan now:`

    const { model } = await createAiModel()

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.3,
      onFinish: async ({ text }) => {
        try {
          if (!projectId) return;
          
          const fs = require('fs');
          const path = require('path');
          const dataDir = path.join(process.cwd(), 'data');
          const historyFile = path.join(dataDir, 'planner_history.json');
          
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }

          let history: any[] = [];
          if (fs.existsSync(historyFile)) {
            try {
              history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
            } catch (e) {
              history = [];
            }
          }

          history.unshift({
            id: Date.now().toString(),
            project_id: projectId,
            agent_name: selectedAgent,
            content: text,
            created_at: new Date().toISOString()
          });

          fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
          console.log('✅ Planner history saved to local file system successfully');

        } catch (e) {
          console.error('Failed to save planner in onFinish:', e);
        }
      }
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Error generating plan:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
