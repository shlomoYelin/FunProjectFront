import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

  transform(value: string): string {
    const index = value.length - 7;
    const [perfix, number] = [value.slice(0, index), value.slice(index)];
    return `${perfix}-${number}`;
    // return `${perfix}-${number.slice(0,3)}-${number.slice(3)}`;
  }
}
