import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { CodeBlock } from './ui/CodeBlock.jsx';

function sanitizeUri(uri) {
  const cleaned = DOMPurify.sanitize(uri, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  if (/^(https?:|mailto:|#)/i.test(cleaned)) {
    return cleaned;
  }
  return '';
}

function extractLanguage(className) {
  const match = /language-(\w+)/.exec(className || '');
  return match ? match[1] : '';
}

export function SafeMessageContent({ content, className = '', invert = false }) {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(content || '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }),
    [content],
  );

  return (
    <ReactMarkdown
      className={`prose-chat break-words ${invert ? 'text-bubble-sent-ink [&_a]:text-white/90 [&_code]:bg-white/15 [&_code]:text-white' : ''} ${className}`}
      remarkPlugins={[remarkGfm]}
      disallowedElements={['script', 'iframe', 'object', 'embed', 'style']}
      unwrapDisallowed
      components={{
        a: ({ href, children }) => (
          <a href={sanitizeUri(href)} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
        code: ({ inline, className: codeClass, children }) => {
          const text = String(children).replace(/\n$/, '');
          if (inline) {
            return <code>{text}</code>;
          }
          return <CodeBlock code={text} language={extractLanguage(codeClass)} />;
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {sanitized}
    </ReactMarkdown>
  );
}
