import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexTooltip, ApexDataLabels, ApexLegend, ApexPlotOptions, ApexYAxis, ApexStates, ApexTitleSubtitle, ApexGrid, ApexResponsive } from 'ng-apexcharts';
import { ChartService, PortfolioChartData } from '../../services/chart.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  states: ApexStates;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
  grid: ApexGrid;
  colors: string[];
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Portfolio Evolution Chart -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Evolução do Portfólio</h3>
          <div class="flex gap-2">
            @for (benchmark of availableBenchmarks; track benchmark) {
              <button 
                (click)="toggleBenchmark(benchmark)"
                [class]="isBenchmarkActive(benchmark) ? 'bg-blue-600' : 'bg-gray-700'"
                class="px-3 py-1 text-xs rounded-full transition-colors"
                [class.text-white]="isBenchmarkActive(benchmark)"
                [class.text-gray-400]="!isBenchmarkActive(benchmark)"
              >
                {{ benchmark }}
              </button>
            }
          </div>
        </div>
        
        @if (loadingEvolution()) {
          <div class="h-80 flex items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else {
          <div id="chart">
            <apx-chart
              [series]="evolutionChartOptions.series!"
              [chart]="evolutionChartOptions.chart!"
              [xaxis]="evolutionChartOptions.xaxis!"
              [stroke]="evolutionChartOptions.stroke!"
              [tooltip]="evolutionChartOptions.tooltip!"
              [dataLabels]="evolutionChartOptions.dataLabels!"
              [legend]="evolutionChartOptions.legend!"
              [colors]="evolutionChartOptions.colors!"
              [grid]="evolutionChartOptions.grid!"
            ></apx-chart>
          </div>
        }
      </div>

      <!-- Allocation Pie Chart -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-4">Alocação por Tipo</h3>
        
        @if (loadingAllocation()) {
          <div class="h-80 flex items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else {
          <div id="allocation-chart">
            <apx-chart
              [series]="allocationChartOptions.series!"
              [chart]="allocationChartOptions.chart!"
              [labels]="allocationChartOptions.labels!"
              [colors]="allocationChartOptions.colors!"
              [legend]="allocationChartOptions.legend!"
              [plotOptions]="allocationChartOptions.plotOptions!"
              [dataLabels]="allocationChartOptions.dataLabels!"
              [responsive]="allocationChartOptions.responsive!"
            ></apx-chart>
          </div>
        }
      </div>

      <!-- Performance Bar Chart -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 col-span-1 lg:col-span-2">
        <h3 class="text-lg font-semibold text-white mb-4">Desempenho por Ativo</h3>
        
        @if (loadingPerformance()) {
          <div class="h-64 flex items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else {
          <div id="performance-chart">
            <apx-chart
              [series]="performanceChartOptions.series!"
              [chart]="performanceChartOptions.chart!"
              [plotOptions]="performanceChartOptions.plotOptions!"
              [yaxis]="performanceChartOptions.yaxis!"
              [xaxis]="performanceChartOptions.xaxis!"
              [colors]="performanceChartOptions.colors!"
              [grid]="performanceChartOptions.grid!"
              [tooltip]="performanceChartOptions.tooltip!"
              [dataLabels]="performanceChartOptions.dataLabels!"
            ></apx-chart>
          </div>
        }
      </div>
    </div>
  `
})
export class ChartsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | undefined;
  
  chartService = inject(ChartService);

  loadingEvolution = signal(true);
  loadingAllocation = signal(true);
  loadingPerformance = signal(true);

  availableBenchmarks = ['Portfólio', 'CDI', 'Ibovespa'];
  activeBenchmarks = signal<string[]>(['Portfólio']);

  evolutionChartOptions: Partial<ChartOptions> = {};
  allocationChartOptions: Partial<ChartOptions> = {};
  performanceChartOptions: Partial<ChartOptions> = {};

  ngOnInit() {
    this.initEvolutionChart();
    this.initAllocationChart();
    this.initPerformanceChart();
  }

  initEvolutionChart() {
    this.chartService.getPortfolioEvolution(90).subscribe({
      next: (data) => {
        const activeSeries = data.series.filter(s => this.activeBenchmarks().includes(s.name));
        
        this.evolutionChartOptions = {
          series: activeSeries,
          chart: {
            type: "area",
            height: 320,
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
            toolbar: { show: true, tools: { download: true, selection: true, zoom: true, pan: true, reset: true } },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
          },
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: 2 },
          xaxis: {
            categories: data.dates,
            labels: { style: { colors: '#9CA3AF' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: {
            labels: { 
              style: { colors: '#9CA3AF' },
              formatter: (val) => (val / 1000).toFixed(1) + 'k'
            }
          },
          tooltip: { theme: 'dark', x: { show: true }, y: { formatter: (val) => 'R$ ' + val.toLocaleString('pt-BR') } },
          legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#9CA3AF' } },
          grid: { borderColor: '#374151', strokeDashArray: 4 },
          colors: ['#3B82F6', '#10B981', '#F59E0B']
        };
        this.loadingEvolution.set(false);
      },
      error: () => {
        this.loadingEvolution.set(false);
        this.setEmptyEvolutionChart();
      }
    });
  }

  setEmptyEvolutionChart() {
    this.evolutionChartOptions = {
      series: [{ name: 'Portfólio', data: [] }],
      chart: { type: "area", height: 320, fontFamily: 'Inter, sans-serif', background: 'transparent' },
      xaxis: { categories: [], labels: { style: { colors: '#9CA3AF' } } },
      stroke: { curve: "smooth", width: 2 },
      yaxis: { labels: { style: { colors: '#9CA3AF' } } },
      tooltip: { theme: 'dark' },
      legend: { labels: { colors: '#9CA3AF' } },
      grid: { borderColor: '#374151', strokeDashArray: 4 },
      colors: ['#3B82F6']
    };
  }

  initAllocationChart() {
    this.chartService.getAllocationByType().subscribe({
      next: (data) => {
        this.allocationChartOptions = {
          series: data.series.length > 0 ? data.series : [44, 55, 13, 43, 22],
          chart: { type: "donut", height: 320, fontFamily: 'Inter, sans-serif', background: 'transparent' },
          labels: data.labels.length > 0 ? data.labels : ['Ações', 'FIIs', 'Renda Fixa', 'Crypto', 'Outros'],
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', color: '#9CA3AF' } } } } },
          dataLabels: { style: { colors: ['#000'] } },
          responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
        };
        this.loadingAllocation.set(false);
      },
      error: () => {
        this.loadingAllocation.set(false);
        this.setEmptyAllocationChart();
      }
    });
  }

  setEmptyAllocationChart() {
    this.allocationChartOptions = {
      series: [],
      chart: { type: "donut", height: 320, fontFamily: 'Inter, sans-serif', background: 'transparent' },
      labels: [],
      legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
      plotOptions: { pie: { donut: { size: '70%' } } }
    };
  }

  initPerformanceChart() {
    this.chartService.getPerformanceByAsset().subscribe({
      next: (data) => {
        const profits = data.filter((d: any) => d.y >= 0).sort((a: any, b: any) => b.y - a.y).slice(0, 10);
        const losses = data.filter((d: any) => d.y < 0).sort((a: any, b: any) => a.y - b.y).slice(0, 10);
        const sortedData = [...losses, ...profits];

        this.performanceChartOptions = {
          series: [{ data: sortedData.map((d: any) => d.y) }],
          chart: { type: "bar", height: 250, fontFamily: 'Inter, sans-serif', background: 'transparent', toolbar: { show: false } },
          plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '70%' } },
          xaxis: { categories: sortedData.map((d: any) => d.x), labels: { style: { colors: '#9CA3AF' } } },
          yaxis: { labels: { style: { colors: '#9CA3AF' }, formatter: (val) => val.toFixed(1) + '%' } },
          colors: sortedData.map((d: any) => d.y >= 0 ? '#10B981' : '#EF4444'),
          grid: { borderColor: '#374151', strokeDashArray: 4 },
          tooltip: { theme: 'dark', y: { formatter: (val) => val.toFixed(2) + '%' } },
          dataLabels: { enabled: true, style: { colors: ['#000'] }, formatter: (val) => val.toFixed(1) + '%' },
          legend: { show: false }
        };
        this.loadingPerformance.set(false);
      },
      error: () => {
        this.loadingPerformance.set(false);
      }
    });
  }

  toggleBenchmark(benchmark: string) {
    this.activeBenchmarks.update(current => {
      if (current.includes(benchmark)) {
        return current.filter(b => b !== benchmark);
      }
      return [...current, benchmark];
    });
    this.initEvolutionChart();
  }

  isBenchmarkActive(benchmark: string): boolean {
    return this.activeBenchmarks().includes(benchmark);
  }
}