import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService extends Date {

  constructor() {
    super();
    this.setHours(0, 0, 0, 0)
  }

  withoutTime(date: Date) {
    var d = date;
    d.setHours(0, 0, 0, 0);
    return d;
    
  }
}
