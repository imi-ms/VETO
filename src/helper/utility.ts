import { Linebreak } from "@/types/FileData";

/**
 * Searches the given text for the given linebreak.
 * @param text The text to search in.
 * @param linebreak The linebreak to be searched.
 * @returns An array containing the first index of all linebreak in the text.
 */
export function findLinebreaks(text: string, linebreak: Linebreak): number[] {
  const linebreakIndices: number[] = [];
  let startIndex = 0;
  let index = text.indexOf(linebreak, startIndex);

  while (index > -1) {
    linebreakIndices.push(index);
    startIndex = index + 1;
    index = text.indexOf(linebreak, startIndex);
  }

  return linebreakIndices;
}

/**
 * Detects the used linebreak in a text.
 * @param text The text.
 * @returns The detected linebreak.
 */
export function detectLinebreak(text: string): Linebreak | null {
  const supportedLinebreaks = ['\r\n', '\r', '\n', '\x0B', '\x0C', '\u0085', '\u2028', '\u2029'];
  for (const supportedLinebreak of supportedLinebreaks) {
    if (text.includes(supportedLinebreak)) {
      return supportedLinebreak as Linebreak;
    }
  }

  return null;
}

/**
 * Calculates the indices of the given range for the selected text by taking account the given prior range.
 * Fixes different linebreaks used in the imported text and in the text provided by the browser.
 *
 * @param priorRange Range of the text before the selection.
 * @param selectedRange Range of the selection.
 * @param targetLinebreak Linebreak of the original text.
 * @returns Start and end index of the selection.
 */
export function calculateIndices(
  priorRange: Range,
  selectedRange: Range,
  targetLinebreak: Linebreak,
): { start: number, end: number } {

  const priorText = priorRange.toString();
  const selectedText = selectedRange.toString();

  let start = priorText.length;
  let end = start + selectedText.length;

  // Fix different linebreak encodings from system and file
  let sourceLinebreak = detectLinebreak(priorText);
  if (sourceLinebreak === null) {
    sourceLinebreak = detectLinebreak(selectedText);
  }

  if (sourceLinebreak !== null) {
    const offsetPerLinebreak = targetLinebreak.length - sourceLinebreak.length;

    const linebreakIndicesPrior = findLinebreaks(priorText, sourceLinebreak);
    const startOffset = linebreakIndicesPrior.length * offsetPerLinebreak;
    start += startOffset;
    end += startOffset;

    const linebreakIndicesRange = findLinebreaks(selectedText, sourceLinebreak);
    end += linebreakIndicesRange.length * offsetPerLinebreak
  }

  return {start, end};
}
