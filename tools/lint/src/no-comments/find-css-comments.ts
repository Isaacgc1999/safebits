import postcss from 'postcss';

export function findCssComments(text: string): readonly number[] {
  const lines: number[] = [];
  postcss.parse(text).walkComments((comment) => {
    lines.push(comment.positionInside(0).line);
  });
  return lines;
}
