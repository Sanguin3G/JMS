import { Component} from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  standalone: false,
  selector: 'app-sales-by-month',
  templateUrl: './sales-by-month.component.html',
  styleUrls: ['./sales-by-month.component.css']
})
export class SalesByMonthComponent{
  chart2 = 'alo';
  chart = new Chart({
    chart: {
      type: 'arearange',
      height: 325
    },
    title: {
      text: 'Thống Kê Phát Triển'
    },
    xAxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
    },
    yAxis: {
      title: {
        text: 'Số Lượt'
      }
    },
    series: [
      {
        name: "Đăng Ký Ứng Tuyển",
        type: "line",
        color: '#525FE1',
        data: [70, 69, 95, 145, 182, 215, 252, 265, 233, 183, 139, 196]
      },
      {
        name: 'CV Được Tạo',
        type: 'line',
        color: '#FE0000',
        data: [
          47, 52, 44, 35, 58, 69, 32, 53, 71, 82, 99, 159
        ]
      },
      {
        name: 'Bài Tuyển Dụng Mới',
        type: 'line',
        color: '#F07DEA',
        data: [
          17, 22, 14, 25, 18, 19, 22, 43, 11, 32, 29, 59
        ]
      },
    ],
    credits: {
      enabled: false
    }
  })
}
