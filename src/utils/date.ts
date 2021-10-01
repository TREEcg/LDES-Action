import { formatISO } from 'date-fns';

class date {
	dateToBasicISODate(date: Date) {
		// expected output: 2011-10-05T14:48:00.000Z
		let ISODate = date.toISOString();
		return ISODate.replace(/\-/g, '').replace(/\:/g, '').replace(/\./g, '');
	}

	/*
    BasicISODateToISODate(date: string) {
        return new Date(date);
    }
    */
}

export default new date();
