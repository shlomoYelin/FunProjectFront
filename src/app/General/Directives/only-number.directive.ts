import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumberDirective {
  regExStr = '^[0-9]*$';

  constructor(private element: ElementRef) { }

  @HostListener('keypress', ['$event']) onKeyPress(event:any) { 
    return new RegExp(this.regExStr).test(event.key)
  }
}
