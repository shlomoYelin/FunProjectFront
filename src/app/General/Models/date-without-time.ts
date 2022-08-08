export class DateWithoutTime extends Date {
    constructor(date: Date = new Date()) {
        super();
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
    }

    
  
}
