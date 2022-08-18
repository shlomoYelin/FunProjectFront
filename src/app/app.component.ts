import { Component } from '@angular/core';
import { PhoneCategory } from './General/Enums/phone-category';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  phoneCategory!: PhoneCategory;

  // ff() {
  //   this.phoneCategory = PhoneCategory.Emergency;
  // }
}
