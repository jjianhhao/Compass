import DOMPurify from 'dompurify';

// Allow KaTeX/MathML tags and attributes through DOMPurify
const PURIFY_CONFIG = {
  ADD_TAGS: [
    // MathML tags
    'math', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'mfrac', 'mroot',
    'msqrt', 'mtable', 'mtr', 'mtd', 'mtext', 'mspace', 'mover', 'munder',
    'munderover', 'semantics', 'annotation', 'mstyle', 'mpadded', 'merror',
    'mphantom', 'menclose', 'mlabeledtr', 'mmultiscripts', 'mprescripts',
    'none', 'maligngroup', 'malignmark',
    // KaTeX wrapper spans are standard HTML (span/div) — allowed by default
  ],
  ADD_ATTR: [
    'xmlns', 'mathvariant', 'encoding', 'display', 'stretchy', 'fence',
    'separator', 'lspace', 'rspace', 'columnalign', 'rowalign', 'width',
    'height', 'depth', 'minsize', 'maxsize', 'accent', 'accentunder',
    'style', 'class', 'aria-hidden',
    // Additional MathML attributes used in KaTeX output
    'columnspacing', 'rowspacing', 'scriptlevel', 'displaystyle',
    'voffset', 'mathbackground', 'mathcolor', 'mathsize',
    'linethickness', 'notation', 'href', 'data-mml-node',
  ],
};

export default function QuestionBody({ html, diagram }) {
  const clean = DOMPurify.sanitize(html || '', PURIFY_CONFIG);

  return (
    <div className="question-body">
      {/*
        The CSV questions contain pre-rendered KaTeX with only <span class="katex-mathml">
        (MathML) but no <span class="katex-html"> (visual spans). KaTeX CSS hides
        .katex-mathml by default, so we override it to show native MathML rendering.
      */}
      <style>{`
        .question-body .katex-mathml {
          position: static !important;
          width: auto !important;
          height: auto !important;
          overflow: visible !important;
          clip: unset !important;
          clip-path: none !important;
          padding: 0 !important;
          border: 0 !important;
          opacity: 1 !important;
        }
        .question-body .katex-mathml math {
          font-size: 1.1em;
        }
        .question-body .katex-display .katex-mathml {
          display: block;
          text-align: center;
          margin: 0.5em 0;
        }
      `}</style>
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
