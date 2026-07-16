import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createAiModel } from '@/lib/getAiConfig'

import { createClient as createBackgroundClient } from '@supabase/supabase-js'

// Allow streaming responses up to 5 minutes for massive PRDs
export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  console.log('--- API /api/prd CALLED ---')
  try {
    const supabase = await createClient()
    const [
      { data: { user }, error: userError },
      { data: { session }, error: sessionError },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession(),
    ])

    if (userError || sessionError || !user || !session?.access_token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const token = session.access_token

    const { prompt, projectId, previousPrdContent } = await req.json()

    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 })
    }

    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('owner_id', user.id)
        .single()

      if (projectError || !project) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    const systemPrompt = `You are an elite Enterprise Product Manager and Systems Architect.
Your task is to generate an EXHAUSTIVE, highly detailed, and professional Product Requirements Document (PRD) based on the user's input.
You must use standard Markdown formatting. Keep the tone highly professional, authoritative, and actionable. Use tables, bold text, and lists where appropriate to make it scannable.

CRITICAL INSTRUCTION: You MUST structure the document exactly like a top-tier enterprise PRD with the following exhaustive sections. DO NOT skip any sections. Expand on details deeply.

1. Executive Summary & Vision (Provide a grand vision, pain points solved, and value proposition).
2. Problem Statement (You MUST output this directly as raw HTML, NOT in a code block, using this exact structure: <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> <div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-5"><h4 class="text-red-500 font-serif text-[11px] font-bold tracking-widest uppercase mb-3">Pain Points</h4>...</div> <div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-5"><h4 class="text-zinc-500 font-serif text-[11px] font-bold tracking-widest uppercase mb-3">Current Alternatives</h4>...</div> <div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-5"><h4 class="text-zinc-500 font-serif text-[11px] font-bold tracking-widest uppercase mb-3">Market Gap</h4>...</div> </div>).
3. Goals & Non-Goals (You MUST output this directly as raw HTML, NOT in a code block, similar to Problem Statement, with headers: BUSINESS GOALS (red), USER GOALS (red), NON-GOALS (zinc)).
4. Target Audience & Industry Verticals (You MUST output directly as raw HTML, NOT in a code block: a 3-column HTML grid with headers: PRIMARY (red), SECONDARY (zinc), MARKET SIZE (zinc)).
5. Detailed User Personas (You MUST output directly as raw HTML, NOT in a code block, using this structure: <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"><div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-6"><div class="flex justify-between items-start mb-4"><div><h4 class="text-white font-bold text-lg m-0">Name</h4><p class="text-zinc-500 text-sm m-0">Role â€¢ Age</p></div><span class="bg-zinc-800 text-zinc-300 text-[10px] uppercase px-2 py-1 rounded-md">High</span></div><p class="text-zinc-400 text-sm mb-4">Focus</p><h5 class="text-white text-sm font-bold mb-2">Goals</h5><ul class="text-sm text-zinc-300 space-y-1 list-none mb-4"><li><span class="text-zinc-500 mr-2">â†’</span> Goal</li></ul><h5 class="text-white text-sm font-bold mb-2">Frustrations</h5><ul class="text-sm text-zinc-300 space-y-1 list-none mb-4"><li><span class="text-red-500 mr-2">Ã—</span> Frustration</li></ul><blockquote class="border-l-2 border-red-500/50 pl-3 text-red-400/80 italic text-sm m-0">"Quote"</blockquote></div></div>).
6. Core Product Features (You MUST output each feature directly as raw HTML, NOT in a code block, using this structure: <div class="flex flex-col space-y-4 mb-8"><div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-6"><div class="flex justify-between items-start mb-4"><h4 class="text-white font-bold text-lg m-0">Feature Name</h4><div class="flex space-x-2"><span class="bg-red-950/40 text-red-400 border border-red-900/30 text-[10px] font-bold uppercase px-2 py-1 rounded">Must Have</span><span class="bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase px-2 py-1 rounded">High</span></div></div><p class="text-zinc-300 text-[15px] mb-4 leading-relaxed"><strong>Overview:</strong> Write a highly detailed 2-paragraph description of the feature.</p><p class="text-zinc-300 text-[14px] font-bold mb-6">User Benefit: <span class="font-normal text-zinc-400">Deep explanation of value.</span></p><h6 class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2 border-t border-[#2a2a2a] pt-4">System Logic & Data Integrity</h6><p class="text-zinc-400 text-[13px] mb-4 leading-relaxed">Explain the backend logic, state machines, and data validation rules in extreme detail.</p><h6 class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2 border-t border-[#2a2a2a] pt-4">Edge Cases & Fallbacks</h6><ul class="text-sm text-zinc-400 space-y-2 list-none m-0 p-0 mb-6"><li><span class="text-yellow-500 mr-2">âš </span> Edge case and exact mitigation strategy.</li></ul><h6 class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2 border-t border-[#2a2a2a] pt-4">Acceptance Criteria (BDD)</h6><ul class="text-sm text-zinc-400 space-y-2 list-none m-0 p-0 mb-4"><li><span class="text-red-500 mr-2">âœ“</span> Given [context], When [action], Then [outcome].</li></ul><p class="text-zinc-500 text-[12px] m-0">Est. Effort: X sprints</p></div></div>. CRUCIAL: DO NOT just fill this out briefly. You MUST write at least 150 words of deep engineering text inside EACH feature card!).
7. User Stories (You MUST output each user story directly as raw HTML, NOT in a code block, using this structure: <div class="flex flex-col space-y-4 mb-8"><div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-6"><div class="flex justify-between items-start mb-2"><p class="text-white font-bold text-[15px] m-0 pr-8">As a [Role], I want to [action] so that [benefit].</p><span class="bg-red-950/40 text-red-400 border border-red-900/30 text-[10px] font-bold uppercase px-2 py-1 rounded">Must Have</span></div><p class="text-zinc-500 text-sm mb-6">Persona: [Name]</p><h6 class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2">Acceptance Criteria</h6><ul class="text-sm text-zinc-400 space-y-1 list-none m-0 p-0"><li><span class="text-red-500 mr-2">âœ“</span> Criteria 1</li></ul></div></div>).
8. User Flows (You MUST output each flow directly as raw HTML, NOT in a code block, using this structure: <div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-6 mb-6"><h4 class="text-white font-bold text-md mb-4">Flow Name</h4><ol class="text-sm text-zinc-300 space-y-2 mb-4"><li><span class="text-red-500 font-bold mr-2">1.</span> Step 1</li></ol><p class="text-[13px] text-zinc-400 mb-4"><strong class="text-zinc-200">Happy Path:</strong> Path description.</p><h6 class="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Edge Cases</h6><ul class="text-[13px] text-zinc-400 space-y-1 list-none m-0 p-0"><li><span class="text-yellow-500 mr-2">âš </span> Edge case 1</li></ul></div>).
9. Tech Stack Recommendation (You MUST output directly as raw HTML using a grid: <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-5"><h6 class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Frontend</h6><h4 class="text-white font-bold text-md mb-2">Next.js</h4><p class="text-zinc-400 text-[13px]">Fast rendering.</p></div></div><div class="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-xl p-5 mb-8"><h6 class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Third-Party Services</h6><p class="text-zinc-300 text-sm"><strong class="text-white">Redis</strong> â€” Caching</p></div>).
10. System Architecture (You MUST include a massive, highly complex Mermaid Flowchart (\`mermaid flowchart TD\` or \`graph TD\`) showing the entire system topology: Client, CDN, Load Balancers, API Gateways, Microservices, Event Buses (Kafka/RabbitMQ), and Databases (Primary/Read-Replicas, Redis). Then, write an exhaustive text breakdown of the Infrastructure, Security Policies, Scalability strategies, and CI/CD pipelines).
11. User Journey (You MUST provide a Mermaid sequence diagram inside a standard markdown code block: \`\`\`mermaid\nsequenceDiagram\nparticipant U as User\n...\n\`\`\`. USE STRICTLY STANDARD ARROWS like ->> and -->>. DO NOT use invalid syntaxes like O--).
12. Information Architecture (You MUST use standard Markdown. Do NOT use raw HTML. Provide an exhaustive, deeply nested directory tree representing the Routing Structure (e.g., Next.js App Router format \`app/(dashboard)/...\`). Also provide a state management overview (Redux/Zustand logic) and authorization boundary maps).
10. System Architecture (Include Mermaid Flowchart and concise infrastructure description).
11. User Journey (Include Mermaid sequence diagram).
12. Information Architecture (Markdown directory tree and state management).
13. Data Model & ERD (Mermaid ER diagram and 8 standard Markdown tables).
14. API Design Specification (Standard Markdown tables for 8 endpoints).
15. Non-Functional Requirements (Bullet points).
16. Delivery Milestones (HTML cards as specified).
17. Success Metrics (HTML cards as specified).
18. Risks & Mitigations (HTML cards as specified).
19. Open Architectural Questions.

When generating the PRD, DO NOT output a short summary. You MUST output all 19 sections, but be concise and direct. Use bullet points heavily.
You are writing for Senior Silicon Valley Engineers and VCs. Adopt the 'Amazon Working Backwards' and 'Agile Epic' mentalities.

MANDATORY REQUIREMENTS:
- Generate 2 Detailed User Personas.
- Generate 5 Core Product Features.
- Generate 4 User Stories. Use standard BDD format (Given/When/Then).
- Generate 2 User Flows. YOU MUST WRAP THESE IN THE EXACT HTML TEMPLATE PROVIDED!
- Generate 8 Data Model tables in the ERD section using standard Markdown Tables.
- Generate 8 API Endpoints. Provide method, JSON schemas, and HTTP status codes.
- For System Architecture, detail the exact infrastructure concisely.

CRITICAL: DO NOT OUTPUT PLAIN TEXT FOR SECTIONS THAT REQUIRE HTML GRIDS/CARDS. YOU MUST USE THE HTML WRAPPERS EXACTLY AS SPECIFIED.

You must be comprehensive but balance depth with brevity to ensure you finish all 19 sections.`

    let finalPrompt = prompt;

    if (projectId && previousPrdContent) {
      finalPrompt = `You are revising an existing Product Requirements Document (PRD).

User request: "${prompt}"

Please output the ENTIRE document from Section 1 to Section 19. Do not skip any existing sections. Integrate the user's requested changes into the appropriate section while keeping the rest of the document intact.

EXISTING DOCUMENT:
${previousPrdContent}`;
    }

    const { model } = await createAiModel()

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.7,
      maxOutputTokens: 8192,
      onFinish: async ({ text }) => {
        try {
          if (!user?.id || !token) {
            console.error('Missing user or token in onFinish');
            return;
          }
          
          const backgroundSupabase = createBackgroundClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              global: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            }
          );
          
          let finalProjectId = projectId;
          let nextVersion = 1;

          if (projectId) {
            const { data: latestVersion, error: fetchError } = await backgroundSupabase
              .from('prd_versions')
              .select('version_number')
              .eq('project_id', projectId)
              .order('version_number', { ascending: false })
              .limit(1)
              .single();
            
            if (latestVersion && !fetchError) {
              nextVersion = latestVersion.version_number + 1;
            }
          } else {
            const projectName = prompt.substring(0, 40).trim() + (prompt.length > 40 ? '...' : '');

            const { data: project, error: projectError } = await backgroundSupabase
              .from('projects')
              .insert({
                owner_id: user.id,
                name: projectName,
              })
              .select('id')
              .single();

            if (projectError || !project) {
              console.error('Error creating project:', projectError);
              return;
            }
            finalProjectId = project.id;
          }

          const { error: prdError } = await backgroundSupabase
            .from('prd_versions')
            .insert({
              project_id: finalProjectId,
              version_number: nextVersion,
              content: text,
              author_id: user.id,
            });

          if (prdError) {
            console.error('Error saving PRD version:', prdError);
          } else {
            console.log(`âœ… Successfully saved PRD v${nextVersion} to project ${finalProjectId}`);
          }
        } catch (err) {
          console.error('Failed to save PRD in onFinish:', err);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating PRD:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
