import { formatISO } from 'date-fns'

class date {
    
    dateToBasicISODate(date: Date) {
        return formatISO(date, { format: 'basic' }).slice(0, -6);
    }

    /*
    BasicISODateToISODate(date: string) {
        return new Date(date);
    }
    */

}   

export default new date();