import { formatISO } from 'date-fns'

class date {
    
    dateToBasicISODate(date: Date) {
        let ISODate = formatISO(date, { format: 'basic' })
        // check if date has timezone
        if (ISODate.charAt(ISODate.length - 6) === '+') {
            return ISODate.slice(0, -6)
        }
        return ISODate;
    }

    /*
    BasicISODateToISODate(date: string) {
        return new Date(date);
    }
    */

}   

export default new date();