'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

function parseInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;
  const key = () => `${keyBase}-${idx++}`;

  while (remaining.length > 0) {
    // Code span `...`
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`\n]+)`/);
    if (codeMatch) {
      if (codeMatch[1]) nodes.push(<span key={key()}>{codeMatch[1]}</span>);
      nodes.push(
        <code key={key()} className="k-inline-code font-mono text-[0.79em] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--k-accent-soft)', color: 'var(--k-accent-text)', border: '1px solid var(--k-accent-border)' }}>
          {codeMatch[2]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }
    // Bold **...**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*/);
    if (boldMatch) {
      if (boldMatch[1]) nodes.push(<span key={key()}>{boldMatch[1]}</span>);
      nodes.push(<strong key={key()} style={{ fontWeight: 600, color: 'var(--k-text)' }}>{parseInline(boldMatch[2], key())}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    // Italic *...*
    const itMatch = remaining.match(/^([\s\S]*?)\*([^*]+)\*/);
    if (itMatch) {
      if (itMatch[1]) nodes.push(<span key={key()}>{itMatch[1]}</span>);
      nodes.push(<em key={key()} style={{ fontStyle: 'italic', color: 'var(--k-text-2)' }}>{itMatch[2]}</em>);
      remaining = remaining.slice(itMatch[0].length);
      continue;
    }
    // Link [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      if (linkMatch[1]) nodes.push(<span key={key()}>{linkMatch[1]}</span>);
      nodes.push(
        <a key={key()} href={linkMatch[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--k-accent-text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {linkMatch[2]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }
    nodes.push(<span key={key()}>{remaining}</span>);
    break;
  }
  return nodes;
}

function renderLine(line: string, keyIdx: number): React.ReactNode {
  const k = String(keyIdx);
  if (line.startsWith('# '))
    return <h1 key={k} style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--k-text)', margin:'0.65rem 0 0.35rem', lineHeight:1.3 }}>{parseInline(line.slice(2), k)}</h1>;
  if (line.startsWith('## '))
    return <h2 key={k} style={{ fontSize:'1rem', fontWeight:600, color:'var(--k-text)', margin:'0.5rem 0 0.3rem' }}>{parseInline(line.slice(3), k)}</h2>;
  if (line.startsWith('### '))
    return <h3 key={k} style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--k-text)', margin:'0.4rem 0 0.25rem' }}>{parseInline(line.slice(4), k)}</h3>;
  if (line === '---' || line === '***')
    return <hr key={k} style={{ border:'none', borderTop:'1px solid var(--k-border)', margin:'0.65rem 0' }} />;
  if (line.startsWith('> '))
    return (
      <blockquote key={k} style={{ borderLeft:'3px solid var(--k-accent)', paddingLeft:'0.85rem', margin:'0.5rem 0', color:'var(--k-text-2)', fontStyle:'italic' }}>
        {parseInline(line.slice(2), k)}
      </blockquote>
    );
  if (/^[-*+] /.test(line))
    return <li key={k} style={{ marginLeft:'1.1rem', listStyleType:'disc', lineHeight:1.7, color:'var(--k-text)', marginBottom:'0.15rem' }}>{parseInline(line.replace(/^[-*+] /,''), k)}</li>;
  const olMatch = line.match(/^(\d+)\. (.*)/);
  if (olMatch)
    return <li key={k} style={{ marginLeft:'1.1rem', listStyleType:'decimal', lineHeight:1.7, color:'var(--k-text)', marginBottom:'0.15rem' }}>{parseInline(olMatch[2], k)}</li>;
  if (line.trim() === '')
    return <div key={k} style={{ height:'0.55rem' }} />;
  return <p key={k} style={{ fontSize:'0.875rem', lineHeight:1.75, color:'var(--k-text)', margin:'0.15rem 0' }}>{parseInline(line, k)}</p>;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let lang = '';
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        lang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCode = false;
        elements.push(
          <div key={key++} style={{ margin: '0.65rem 0' }}>
            {lang && (
              <div className="k-code-lang">
                <span>{lang}</span>
              </div>
            )}
            <pre
              style={{
                background: 'var(--k-surface-3)',
                border: '1px solid var(--k-border)',
                borderTop: lang ? 'none' : '1px solid var(--k-border)',
                borderRadius: lang ? '0 0 10px 10px' : 10,
                padding: '0.85rem 1rem',
                overflowX: 'auto',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78em',
                lineHeight: 1.65,
                color: 'var(--k-text)',
              }}
            >
              <code style={{ color: 'var(--k-text)' }}>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        lang = '';
        codeLines = [];
      }
    } else if (inCode) {
      codeLines.push(line);
    } else {
      elements.push(renderLine(line, key++));
    }
  }

  return <div className="k-prose">{elements}</div>;
}
