import DOMPurify from 'dompurify';

// Allow KaTeX/MathML tags and attributes through DOMPurify
const PURIFY_CONFIG = {
  ADD_TAGS: [
    'math', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'mfrac', 'mroot',
    'msqrt', 'mtable', 'mtr', 'mtd', 'mtext', 'mspace', 'mover', 'munder',
    'munderover', 'semantics', 'annotation',
  ],
  ADD_ATTR: [
    'xmlns', 'mathvariant', 'encoding', 'display', 'stretchy', 'fence',
    'separator', 'lspace', 'rspace', 'columnalign', 'rowalign', 'width',
    'height', 'depth', 'minsize', 'maxsize', 'accent', 'accentunder',
    'style', 'class', 'aria-hidden',
  ],
};

export default function QuestionBody({ html, diagram }) {
  const clean = DOMPurify.sanitize(html || '', PURIFY_CONFIG);

  return (
    <div className="question-body">
      <div
        className="prose prose-sm max-w-none text-gray-900 leading-relaxed
                   [&_.katex]:text-base [&_.katex]:leading-normal
                   [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6
                   [&_li]:mb-1 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {diagram && (
        <div className="mt-4">
          <img
            src={diagram}
            alt="Question diagram"
            className="max-w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
