/**
 * Extracted from node-sanitize (https://github.com/parshap/node-sanitize-filename/blob/master/index.js)
 */
const truncate = require('truncate-utf8-bytes');

const illegalRe = /[/?<>\\:*|"]/gu;
const controlRe = /[\u0000-\u001F\u0080-\u009F]/gu;
const reservedRe = /^\.+$/u;
const windowsTrailingRe = /[. ]+$/u;
const diacritic = /\p{Diacritic}/gu;

export const sanitize = (input: string, replacement = ''): string => {
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsTrailingRe, replacement)
    .replace(diacritic, '');
  return truncate(sanitized, 255);
};
