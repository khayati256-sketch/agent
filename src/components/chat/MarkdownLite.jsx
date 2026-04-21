import { Fragment } from 'react';

const INLINE_TOKEN_REGEX = /(`[^`]+`|\*\*[^*]+\*\*)/g;

const renderInline = (value) => {
  const text = String(value ?? '');
  const tokens = text.split(INLINE_TOKEN_REGEX).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={`code-${index}`}>{token.slice(1, -1)}</code>;
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`strong-${index}`}>{token.slice(2, -2)}</strong>;
    }

    return <Fragment key={`text-${index}`}>{token}</Fragment>;
  });
};

function MarkdownLite({ content }) {
  const lines = String(content ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const language = line.trim().replace('```', '').trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length && lines[index].trim().startsWith('```')) {
        index += 1;
      }

      blocks.push({
        type: 'code',
        language: language || null,
        content: codeLines.join('\n'),
      });
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paragraphLines = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('```') &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: 'paragraph', content: paragraphLines.join(' ') });
  }

  return (
    <div className="message-markdown whitespace-pre-wrap break-words text-sm leading-6">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'code') {
          return (
            <pre key={`code-block-${blockIndex}`} data-language={block.language || undefined}>
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h3 key={`h1-${blockIndex}`} className="mb-2 text-base font-semibold text-cyan-100">
                {renderInline(block.content)}
              </h3>
            );
          }

          if (block.level === 2) {
            return (
              <h4 key={`h2-${blockIndex}`} className="mb-2 text-sm font-semibold text-cyan-100">
                {renderInline(block.content)}
              </h4>
            );
          }

          return (
            <h5 key={`h3-${blockIndex}`} className="mb-1 text-sm font-medium text-zinc-100">
              {renderInline(block.content)}
            </h5>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${blockIndex}`} className="list-disc text-zinc-200">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-item-${blockIndex}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={`ol-${blockIndex}`} className="list-decimal text-zinc-200">
              {block.items.map((item, itemIndex) => (
                <li key={`ol-item-${blockIndex}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`p-${blockIndex}`} className="text-zinc-100">
            {renderInline(block.content)}
          </p>
        );
      })}
    </div>
  );
}

export default MarkdownLite;

