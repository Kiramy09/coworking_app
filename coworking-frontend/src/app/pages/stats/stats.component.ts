import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
import {
  ChartType,
  ChartDataset,
  ChartOptions
} from 'chart.js';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  viewMode: 'global' | 'metropole' | 'type' = 'global';
  startDate: string = '';
  endDate: string = '';
  chartType: ChartType = 'bar';

  stats: {
    chartData: {
      labels: string[],
      datasets: ChartDataset<'bar'>[]
    },
    details: { label: string, percentage: number }[]
  } | null = null;

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.loadStats();
  }

  loadStats(): void {
    const payload = {
      start_date: this.startDate,
      end_date: this.endDate,
      view_mode: this.viewMode
    };

    this.coworkingService.getDashboardStats(payload).subscribe({
      next: (data) => {
        this.stats = {
          chartData: {
            labels: data.stats.map((item: any) => item.label),
            datasets: [
              {
                label: "Taux d'occupation (%)",
                data: data.stats.map((item: any) => item.value),
                backgroundColor: '#0d6efd'
              }
            ]
          },
          details: data.stats.map((item: any) => ({
            label: item.label,
            percentage: item.value
          }))
        };
      },
      error: (err) => {
        console.error('Erreur chargement des statistiques', err);
        this.stats = null;
      }
    });
  }

  changeViewMode(mode: 'global' | 'metropole' | 'type'): void {
    this.viewMode = mode;
    this.loadStats();
  }
}
