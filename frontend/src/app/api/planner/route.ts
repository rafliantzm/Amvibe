import { streamText } from 'ai'
import { NextResponse } from 'next/server'

import { createAiModel } from '@/lib/getAiConfig'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

const AGENT_CONFIG: Record<
  string,
  {
    setup: string
    contextFile: string
    specialCapabilities: string
    bestPractices: string
  }
> = {
  'claude-code': {
    setup: 'Install: npm install -g @anthropic-ai/claude-code. Authenticate via: claude login',
    contextFile: 'CLAUDE.md at project root',
    specialCapabilities: 'CLI-based with multi-file edits, bash execution, and git operations.',
    bestPractices: 'Use CLAUDE.md for persistent context and provide concrete file references.',
  },
  antigravity: {
    setup: 'Use Google DeepMind Antigravity IDE with Planning Mode for complex execution.',
    contextFile: '.antigravityignore + Knowledge Items in .gemini/antigravity-ide/',
    specialCapabilities: 'Planning Mode, background tasks, subagents, and MCP integrations.',
    bestPractices: 'Use goals for long-running work and split large tasks into subagents.',
  },
  'github-copilot': {
    setup: 'Enable in VS Code or JetBrains and configure workspace instructions.',
    contextFile: '.github/copilot-instructions.md',
    specialCapabilities: '@workspace, @terminal, /fix, /tests, and Workspace flows.',
    bestPractices: 'Reference specific files and keep prompts explicit about expected output.',
  },
  codex: {
    setup: 'Install: npm install -g @openai/codex and configure API credentials.',
    contextFile: 'AGENTS.md or codex.md at project root',
    specialCapabilities: 'Suggest, auto-edit, and full-auto execution modes.',
    bestPractices: 'Use explicit file ownership, verification commands, and environment notes.',
  },
  kiro: {
    setup: 'Use Amazon Kiro with spec-driven development workflow.',
    contextFile: '.kiro/steering/',
    specialCapabilities: 'Requirement specs, design tasks, and hook-driven workflows.',
    bestPractices: 'Translate requirements into structured phases before implementation.',
  },
  cursor: {
    setup: 'Use Cursor IDE and configure .cursorrules or .cursor/rules.',
    contextFile: '.cursorrules',
    specialCapabilities: 'Composer, Agent Mode, @codebase, and IDE-native multi-file editing.',
    bestPractices: 'Write prompts that name files, architecture boundaries, and success checks.',
  },
  windsurf: {
    setup: 'Use Windsurf with Cascade and project rules.',
    contextFile: '.windsurfrules',
    specialCapabilities: 'Cascade flows, autonomous code assistance, and deep codebase indexing.',
    bestPractices: 'Keep prompts scoped by milestones and verify each phase with commands.',
  },
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { prdContent, selectedAgent, projectName, projectId } = await req.json()

    if (!prdContent || !selectedAgent || !projectId) {
      return new NextResponse('PRD content, agent selection, and projectId are required', { status: 400 })
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .single()

    if (projectError || !project) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const agentCfg = AGENT_CONFIG[selectedAgent] ?? {
      setup: 'Configure your AI coding assistant before execution.',
      contextFile: 'README.md',
      specialCapabilities: 'General coding assistance.',
      bestPractices: 'Provide precise prompts with file paths, constraints, and verification steps.',
    }

    const systemPrompt = `You are a Principal Engineer and Technical Project Manager with deep experience translating product requirements into production-grade implementation plans for AI coding agents.

Your output must be specific, actionable, and structured for real engineering execution.

Selected AI coding agent: ${selectedAgent}
- Setup: ${agentCfg.setup}
- Context file: ${agentCfg.contextFile}
- Special capabilities: ${agentCfg.specialCapabilities}
- Best practices: ${agentCfg.bestPractices}

You must generate Phase 0 through Phase 12 and end with a final pre-launch checklist.

For every phase, use this exact structure:

### Phase [N]: [Phase Name]
> **Objective**: [One sentence goal]

#### Tasks
- [ ] Task 1
- [ ] Task 2

#### Agent Prompt
\`\`\`
[Paste-ready prompt tailored to the selected agent and this project]
\`\`\`

#### Expected Files & Artifacts
| File/Directory | Purpose |
|---|---|
| path/to/file | reason |

#### Acceptance Criteria
- [ ] Criterion 1

#### Verification Commands
\`\`\`bash
command_here
\`\`\`

Required phase coverage:
- Phase 0: Pre-Flight & Environment Setup
- Phase 1: Architecture & Project Scaffolding
- Phase 2: Database & Data Layer
- Phase 3: Authentication & Authorization
- Phase 4: Core Backend API
- Phase 5: Frontend Architecture
- Phase 6: Feature Implementation
- Phase 7: Third-Party Integrations
- Phase 8: Testing Strategy
- Phase 9: Security Hardening
- Phase 10: CI/CD Pipeline
- Phase 11: Production Deployment
- Phase 12: Observability & Monitoring

End with:
### Final Pre-Launch Checklist

Close the response with exactly:
/// END OF PLAN ///`

    const finalPrompt = `Generate a complete implementation plan for project "${projectName || 'Project'}".

Selected AI coding agent: ${selectedAgent}

PRD:
${prdContent}

Instructions:
1. Read the full PRD carefully.
2. Reference actual entities, features, APIs, and technical constraints from the PRD.
3. Make every Agent Prompt directly usable inside the selected coding tool.
4. Include all phases from 0 to 12.
5. End with the final pre-launch checklist.
6. Finish with exactly "/// END OF PLAN ///".`

    const { model } = await createAiModel()

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.5,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating plan:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
