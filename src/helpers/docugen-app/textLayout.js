const MARKUP_TAGS = ['bold', 'semibold', 'italic', 'underlined'];
const createTextStyle = (depths) => ({
  bold: depths.bold > 0,
  semibold: depths.semibold > 0,
  italic: depths.italic > 0,
  underlined: depths.underlined > 0,
});
const areTextStylesEqual = (left, right) =>
  MARKUP_TAGS.every((tag) => left[tag] === right[tag]);

export const parseTextMarkup = (value) => {
  const runs = [];
  const tokens = String(value ?? '').split(/(<\/?(?:bold|semibold|italic|underlined)>)/gi);
  const depths = Object.fromEntries(MARKUP_TAGS.map((tag) => [tag, 0]));

  tokens.forEach((token) => {
    const match = token.match(/^<(\/)?(bold|semibold|italic|underlined)>$/i);
    if (match) {
      const tag = match[2].toLowerCase();
      depths[tag] = match[1] ? Math.max(0, depths[tag] - 1) : depths[tag] + 1;
      return;
    }
    if (!token) return;

    const style = createTextStyle(depths);
    const previous = runs[runs.length - 1];
    if (previous && areTextStylesEqual(previous, style)) previous.text += token;
    else runs.push({ text: token, ...style });
  });

  return runs;
};

export const parseBoldMarkup = (value) =>
  parseTextMarkup(value).map(({ text, bold }) => ({ text, bold }));

const appendTextRun = (runs, text, style) => {
  if (!text) return;
  const previous = runs[runs.length - 1];
  if (previous && areTextStylesEqual(previous, style)) previous.text += text;
  else runs.push({ ...style, text });
};

const getRunsWidth = (runs, measureText) =>
  runs.reduce((width, run) => width + measureText(run.text, run), 0);

export const wrapTextToWidth = (value, maxWidth, measureText) => {
  const width = Math.max(1, Number(maxWidth) || 1);
  const sourceParagraphs = [[]];
  parseTextMarkup(value).forEach((run) => {
    run.text.replace(/\r\n?/g, '\n').split('\n').forEach((part, index, parts) => {
      if (part) appendTextRun(sourceParagraphs[sourceParagraphs.length - 1], part, run);
      if (index < parts.length - 1) sourceParagraphs.push([]);
    });
  });
  const lines = [];

  sourceParagraphs.forEach((paragraphRuns) => {
    const paragraphText = paragraphRuns.map(({ text }) => text).join('');
    if (!paragraphText.trim()) {
      lines.push({ text: '', runs: [] });
      return;
    }

    const words = [];
    let currentWord = [];
    let hasSpaceBefore = false;
    let currentWordSpaceBefore = false;
    paragraphRuns.forEach((run) => {
      const { text } = run;
      Array.from(text).forEach((character) => {
        if (/\s/u.test(character)) {
          if (currentWord.length) {
            words.push({ runs: currentWord, spaceBefore: currentWordSpaceBefore });
            currentWord = [];
            hasSpaceBefore = true;
          } else if (words.length) {
            hasSpaceBefore = true;
          }
          return;
        }
        if (!currentWord.length) {
          currentWordSpaceBefore = hasSpaceBefore;
          hasSpaceBefore = false;
        }
        appendTextRun(currentWord, character, run);
      });
    });
    if (currentWord.length) words.push({ runs: currentWord, spaceBefore: currentWordSpaceBefore });
    let currentLine = [];

    words.forEach((word) => {
      const candidate = currentLine.map((run) => ({ ...run }));
      if (candidate.length && word.spaceBefore) {
        appendTextRun(candidate, ' ', candidate[candidate.length - 1]);
      }
      word.runs.forEach((run) => appendTextRun(candidate, run.text, run));
      if (getRunsWidth(candidate, measureText) <= width) {
        currentLine = candidate;
        return;
      }

      if (currentLine.length) {
        lines.push({
          runs: currentLine,
          text: currentLine.map((run) => run.text).join(''),
        });
      }

      if (getRunsWidth(word.runs, measureText) <= width) {
        currentLine = word.runs.map((run) => ({ ...run }));
        return;
      }

      let segment = [];
      word.runs.forEach((run) => {
        for (const character of Array.from(run.text)) {
          const nextSegment = segment.map((item) => ({ ...item }));
          appendTextRun(nextSegment, character, run);
          if (segment.length && getRunsWidth(nextSegment, measureText) > width) {
            lines.push({
              runs: segment,
              text: segment.map((item) => item.text).join(''),
            });
            segment = [{ ...run, text: character }];
          } else {
            segment = nextSegment;
          }
        }
      });
      currentLine = segment;
    });

    if (currentLine.length) {
      lines.push({
        runs: currentLine,
        text: currentLine.map((run) => run.text).join(''),
      });
    }
  });

  return lines.length ? lines : [{ text: '', runs: [] }];
};

export const getTextLineHeight = (fontSize, lineSpacing) =>
  Math.max(
    Number(fontSize || 16),
    Number(lineSpacing) || Number(fontSize || 16) * 1.35
  );

export const getTextContentHeight = (lineCount, fontSize, lineSpacing) => {
  const lines = Math.max(1, lineCount);
  const font = Number(fontSize) || 16;
  const lineHeight = getTextLineHeight(font, lineSpacing);
  return Math.ceil(font * 1.35 + (lines - 1) * lineHeight);
};
