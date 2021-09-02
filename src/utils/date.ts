import { formatISO } from 'date-fns'

class date {
    
    dateToBasicISODate(date: Date) {
        return formatISO(date, { format: 'basic' });
    }

    /*
    BasicISODateToISODate(date: string) {
        return new Date(date);
    }
    */

}   

export default new date();