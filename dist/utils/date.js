"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class date {
    dateToBasicISODate(date) {
        // expected output: 2011-10-05T14:48:00.000Z
        let ISODate = date.toISOString();
        return ISODate.replace(/\-/g, '').replace(/\:/g, '').replace(/\./g, '');
    }
}
exports.default = new date();
