/**
 * Extracted from node-sanitize (https://github.com/parshap/node-sanitize-filename/blob/master/index.js)
 */
const truncate = require('truncate-utf8-bytes');

const illegalRe = /[/?<>\\:*|"]/gu;
const controlRe = /[\x00-\x1F\x80-\x9F]/gu;
const reservedRe = /^\.+$/u;
const windowsTrailingRe = /[. ]+$/u;

export const sanitize = (input: string, replacement = ''): string => {
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return truncate(sanitized, 255);
};
