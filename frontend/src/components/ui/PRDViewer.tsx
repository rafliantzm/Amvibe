import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import { Mermaid } from './Mermaid'

interface PRDViewerProps {
  content: string;
}

const allowedClassName = 'className'

const sanitizedSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'div',
    'span',
    'h5',
    'h6',
  ],
  attributes: {
    ...defaultSchema.attributes,
    '*': [
      ...((defaultSchema.attributes?.['*'] as string[] | undefined) ?? []),
      allowedClassName,
    ],
    a: [
      ...((defaultSchema.attributes?.a as string[] | undefined) ?? []),
      allowedClassName,
      'target',
      'rel',
    ],
    div: [allowedClassName],
    span: [allowedClassName],
    p: [allowedClassName],
    h1: [allowedClassName],
    h2: [allowedClassName],
    h3: [allowedClassName],
    h4: [allowedClassName],
    h5: [allowedClassName],
    h6: [allowedClassName],
    ul: [allowedClassName],
    ol: [allowedClassName],
    li: [allowedClassName],
    blockquote: [allowedClassName],
    strong: [allowedClassName],
    table: [allowedClassName],
    thead: [allowedClassName],
    tbody: [allowedClassName],
    tr: [allowedClassName],
    th: [allowedClassName],
    td: [allowedClassName],
    code: [allowedClassName],
    pre: [allowedClassName],
    hr: [allowedClassName],
  },
}

function PRDViewerComponent({ content }: PRDViewerProps) {
  return (
    <div className="bg-[#0a0a0a] rounded-[24px] md:rounded-[32px] p-5 md:p-14 border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-xl w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto min-w-0">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizedSchema], rehypeSlug]}
          components={{
            h1: (props) => <h1 className="text-3xl md:text-[44px] font-semibold text-[#ededed] mb-6 mt-4 tracking-tight leading-[1.2] break-words" {...props} />,
            h2: (props) => <h2 className="text-2xl md:text-[28px] font-medium text-[#ededed] mt-16 mb-8 pb-4 border-b border-dashed border-white/[0.08] break-words" {...props} />,
            h3: (props) => <h3 className="text-xl font-medium text-[#d4d4d4] mt-10 mb-4 tracking-tight break-words" {...props} />,
            h4: (props) => <h4 className="text-[17px] font-medium text-[#a1a1aa] mt-8 mb-4 uppercase tracking-[0.05em] break-words" {...props} />,
            p: (props) => <p className="font-sans text-[#888888] text-[16px] leading-[1.7] mb-6 font-light break-words" {...props} />,
            ul: (props) => <ul className="list-none space-y-3 mb-8 [&>li]:relative [&>li]:pl-6 [&>li::before]:content-[''] [&>li::before]:absolute [&>li::before]:left-0 [&>li::before]:top-[10px] [&>li::before]:h-1.5 [&>li::before]:w-1.5 [&>li::before]:rounded-full [&>li::before]:bg-[#34d399] [&>li::before]:opacity-50 break-words" {...props} />,
            ol: (props) => <ol className="list-decimal list-outside ml-5 space-y-3 mb-8 font-sans text-[#888888] text-[16px] leading-[1.7] font-light marker:text-[#555] break-words" {...props} />,
            li: (props) => <li className="font-sans text-[#888888] text-[16px] leading-[1.7] font-light break-words" {...props} />,
            strong: (props) => <strong className="font-medium text-[#ededed]" {...props} />,
            blockquote: (props) => <blockquote className="border-l-2 border-[#34d399] pl-4 md:pl-6 py-2 my-8 text-[#a1a1aa] font-light bg-white/[0.02] rounded-r-2xl break-words" {...props} />,
            hr: (props) => <hr className="my-12 border-t border-dashed border-white/[0.08]" {...props} />,
            pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => <div className="w-full min-w-0">{children}</div>,
            code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match && !className?.includes('language-')
              
              if (match && match[1] === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />
              }
              
              return isInline ? (
                <code className="font-mono text-[13px] text-[#34d399] bg-[#34d399]/10 px-1.5 py-0.5 rounded-md border border-[#34d399]/20 break-all" {...props}>{children}</code>
              ) : (
                <div className="relative group mb-8 w-full min-w-0">
                  <pre className="p-4 md:p-6 rounded-[20px] bg-[#030303] border border-white/[0.05] overflow-x-auto shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] w-full max-w-full">
                    <code className="font-mono text-[13px] text-[#a1a1aa] leading-[1.8]" {...props}>{children}</code>
                  </pre>
                  {/* Subtle Copy Button that appears on hover (visual representation, actual copy logic can be added later) */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg border border-white/[0.05] text-[#888] hover:text-[#ededed] transition-colors" title="Copy code">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  </div>
                </div>
              )
            },
            table: (props) => (
              <div className="w-full overflow-x-auto rounded-[16px] md:rounded-[20px] border border-white/[0.05] bg-[#030303] mb-10 min-w-0 max-w-full">
                <table className="w-full min-w-[500px] text-left text-sm" {...props} />
              </div>
            ),
            thead: (props) => <thead className="border-b border-white/[0.05] bg-white/[0.02]" {...props} />,
            th: (props) => <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.15em] text-[#888]" {...props} />,
            tbody: (props) => <tbody className="divide-y divide-white/[0.03]" {...props} />,
            tr: (props) => <tr className="hover:bg-white/[0.01] transition-colors" {...props} />,
            td: (props) => <td className="px-6 py-4 text-[#a1a1aa] font-mono text-[13px] leading-relaxed" {...props} />,
          }}
        >
          {content || '*No content available*'}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export const PRDViewer = React.memo(PRDViewerComponent);
