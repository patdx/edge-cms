const INDENT = 2;

/**
 * For obj and array, remove the outer `{}` or `[]` and one level of
 * indentation. For other objects, it is the same as JSON.stringify.
 */
export const compactStringify = (obj: any) => {
  const stringified = JSON.stringify(obj, undefined, INDENT);

  if (Array.isArray(obj) || typeof obj === 'object') {
    const lines = stringified.split('\n');
    return lines
      .slice(1, -1)
      .map((line) => line.slice(INDENT))
      .join('\n');
  } else {
    return stringified;
  }
};
