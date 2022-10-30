import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts';
import { distinctUntilChanged, isEmpty } from 'rxjs';
import { TotalMonthlyOrders } from '../../Models/total-monthly-orders';
import { OrdersService } from '../../Services/orders.service';

@Component({
  selector: 'app-orders-statistics',
  templateUrl: './orders-statistics.component.html',
  styleUrls: ['./orders-statistics.component.scss']
})
export class OrdersStatisticsComponent implements OnInit {
  @Input() monthsNumber!: number
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  yearControl: FormControl = new FormControl((new Date()).getFullYear());

  monthNames: string[] = [];
  ordersAmount: number[] = [];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      // 'January',
      // 'February',
      // 'March',
      // 'April',
      // 'May',
      // 'June',
      // 'July'
    ],
    datasets: [
      {
        data: [/*65, 59, 80, 81, 56, 55, 40*/],
        label: 'Orders summary',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(180, 180, 180)'
      }
    ]
  };
  constructor(private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.subscribeToYearCntrolChange();
    this.getOrdersAmount(this.yearControl.value);
  }

  fillMonthNameToChartLabels(date: Date) {
    this.lineChartData.labels?.push(date.toLocaleString('en-us', { month: 'short' }));
  }

  clearYearCntrolValWheneItsNuN(val: any) {
    if (isNaN(val) || !val) {
      this.yearControl.setValue('');
      return true;
    }
    return false;
  }

  subscribeToYearCntrolChange() {
    this.yearControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(
        {
          next: val => {
            if (this.clearYearCntrolValWheneItsNuN(val)) {
              return;
            }
            else {
              this.getOrdersAmount(val);
            }
          }
        }
      );
  }

  fillOrderAmountToChartData(amount: number) {
    this.lineChartData.datasets[0].data.push(amount);
  }

  fillChart(data: TotalMonthlyOrders[]) {
    this.cleanChart();
    data.forEach(item => {
      this.fillMonthNameToChartLabels(new Date(item.date));
      this.fillOrderAmountToChartData(item.sum);
    });
    this.chart.update();
  }

  cleanChart() {
    this.lineChartData.labels = [];
    this.lineChartData.datasets[0].data = [];
  }

  getOrdersAmount(year: number) {
    this.ordersService.getTotalMonthlyOrdersByYear(year)
      .subscribe({
        next: data => {
          this.fillChart(this.fillAllMonthsOfYear(data));
        }
      });
  }

  yearControlPromotion(num: number) {
    this.yearControl.setValue(this.yearControl.value + num);
  }

  fillAllMonthsOfYear(data: TotalMonthlyOrders[]) {
    let toReturn: TotalMonthlyOrders[] = [];

    for (let index = 0; index < 12; index++) {
      const currentTotalMonthlyOrders = data.find(item => item.date.getMonth() == index);
      
      toReturn.push(currentTotalMonthlyOrders ?? { date: new Date(1, index, 2022), sum: 0 });
    }
    return toReturn;
  }

}
