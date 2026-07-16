export interface ExtractedPrompt {
  phaseName: string
  objective: string
  tasks: string[]
  prompt: string
  files: { file: string; purpose: string }[]
  acceptanceCriteria: string[]
  verification: string
}

export function extractPrompts(markdown: string): ExtractedPrompt[] {
  const blocks = markdown.split(/(?=### Phase \d)/)
  const parsed: ExtractedPrompt[] = []

  for (const block of blocks) {
    if (!block.trim().startsWith('### Phase')) continue

    const lines = block.split('\n')
    const headerLine = lines[0].replace('### ', '').trim()
    const phaseName = headerLine

    const objectiveMatch = block.match(/\*\*Objective\*\*:\s*(.+)/)
    const objective = objectiveMatch ? objectiveMatch[1].trim() : ''

    const tasksSection = block.match(/####\s*ðŸ“‹\s*Tasks([\s\S]*?)(?=####|$)/)
    const tasks: string[] = []
    if (tasksSection) {
      const taskLines = tasksSection[1].match(/- \[ \] (.+)/g) || []
      taskLines.forEach((task) => tasks.push(task.replace('- [ ] ', '').trim()))
    } else {
      const taskMatch = block.match(/\*\*Tasks:\*\*\s*(.+)/)
      if (taskMatch) tasks.push(taskMatch[1].trim())
    }

    let prompt = ''
    const promptCodeBlock = block.match(/####\s*ðŸ¤–\s*Agent Prompt[\s\S]*?```(?:bash|text)?\n?([\s\S]*?)```/)
    if (promptCodeBlock) {
      prompt = promptCodeBlock[1].trim()
    } else {
      const oldFormat = block.match(/\*\*Agent Prompt:\*\*\s*`([^`]+)`/)
      if (oldFormat) prompt = oldFormat[1].trim()
    }

    const files: { file: string; purpose: string }[] = []
    const tableSection = block.match(/####\s*ðŸ“\s*Expected Files[\s\S]*?(\|.+\|[\s\S]*?)(?=####|---\n|$)/)
    if (tableSection) {
      const tableRows = tableSection[1].split('\n').filter((row) => row.includes('|') && !row.includes('---'))
      tableRows.slice(1).forEach((row) => {
        const cols = row.split('|').map((col) => col.trim()).filter(Boolean)
        if (cols.length >= 2) {
          files.push({ file: cols[0].replace(/`/g, ''), purpose: cols[1] })
        }
      })
    } else {
      const filesMatch = block.match(/\*\*Expected Files:\*\*\s*(.+)/)
      if (filesMatch) files.push({ file: filesMatch[1].trim(), purpose: '' })
    }

    const acceptanceCriteria: string[] = []
    const acSection = block.match(/####\s*âœ…\s*Acceptance Criteria([\s\S]*?)(?=####|$)/)
    if (acSection) {
      const acLines = acSection[1].match(/- \[ \] (.+)/g) || []
      acLines.forEach((criterion) => acceptanceCriteria.push(criterion.replace('- [ ] ', '').trim()))
    }

    let verification = ''
    const verifySection = block.match(/####\s*ðŸ”\s*Verification[\s\S]*?```bash\n([\s\S]*?)```/)
    if (verifySection) {
      verification = verifySection[1].trim()
    } else {
      const oldVerify = block.match(/\*\*Verification:\*\*\s*`([^`]+)`/)
      if (oldVerify) verification = oldVerify[1].trim()
    }

    if (prompt || tasks.length > 0) {
      parsed.push({ phaseName, objective, tasks, prompt, files, acceptanceCriteria, verification })
    }
  }

  return parsed
}
