class date {
  public dateToBasicISODate(_date: Date): string {
    // Expected output: 2011-10-05T14:48:00.000Z
    const ISODate = _date.toISOString();
    return ISODate.replace(/-/gu, '').replace(/:/gu, '').replace(/\./gu, '');
  }

  //
  // BasicISODateToISODate(date: string) {
  //     return new Date(date);
  // }
  //
}

export default new date();
