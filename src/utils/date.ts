class date {
  dateToBasicISODate(date: Date) {
    // Expected output: 2011-10-05T14:48:00.000Z
    const ISODate = date.toISOString();
    return ISODate.replace(/-/g, '').replace(/:/g, '').replace(/\./g, '');
  }

  //
  // BasicISODateToISODate(date: string) {
  //     return new Date(date);
  // }
  //
}

export default new date();
