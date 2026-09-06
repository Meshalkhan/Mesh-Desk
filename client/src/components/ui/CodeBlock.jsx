import { useCallback, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.jsx';
import { Button } from './Button.jsx';

function highlightCode(code, language) {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!language) return escaped;

  const rules = [
    { re: /(\/\/.*$|#.*$)/gm, cls: 'text-ink-subtle italic' },
    { re: /\b(const|let|var|function|return|if|else|for|while|class|import|from|export|async|await|try|catch|new|true|false|null|undefined|def|print)\b/g, cls: 'text-accent font-medium' },
    { re: /("[^"]*"|'[^']*'|`[^`]*`)/g, cls: 'text-success' },
    { re: /\b(\d+\.?\d*)\b/g, cls: 'text-warning' },
  ];

  let html = escaped;
  for (const { re, cls } of rules) {
    html = html.replace(re, (match) => `<span class="${cls}">${match}</span>`);
  }
  return html;
}

export function CodeBlock({ code, language = '' }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div
      className={`group relative my-3 overflow-hidden rounded-lg border border-border-subtle/70 ${
        isDark ? 'bg-surface-muted' : 'bg-surface-elevated'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border-subtle/60 px-3 py-1.5">
        <span className="font-mono text-meta-subtle text-ink-subtle">
          {language || 'code'}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs opacity-80 group-hover:opacity-100"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink">
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
      </pre>
    </div>
  );
}
