import { logUser, Turnos } from './../../../models/Interfaces';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export default class EstadisticasComponent implements OnInit {

  listaLogUser: logUser[] = [];
  listaTurnos: Turnos[] = [];

  startDate: string;
  endDate: string;
  startDateDos: string;
  endDateDos: string;

  constructor(private auth: AuthService, private db: DataService) { }

  async ngOnInit() {
    this.listaLogUser = await this.db.traerColeccion<logUser>("loguser");
    this.listaTurnos = await this.db.traerColeccion<Turnos>("turnos");

    this.generateSpecialtyData();
    this.generateDayOfWeekData();
  }

  generateSpecialtyData() {
    const specialtyCounts: any = {};
    this.listaTurnos.forEach((turno: Turnos) => {
      if (turno.especialidad) {
        if (!specialtyCounts[turno.especialidad]) {
          specialtyCounts[turno.especialidad] = 0;
        }
        specialtyCounts[turno.especialidad]++;
      }
    });

    const labels = Object.keys(specialtyCounts);
    const values: any = Object.values(specialtyCounts);
    const colors = labels.map(() => this.getRandomColor());

    // Renderizar el gráfico de torta
    this.renderPieChart(labels, values, colors);
  }

  generateDayOfWeekData() {
    const dayCounts: any = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0
    };

    this.listaTurnos.forEach((turno: Turnos) => {
      if (turno.horarioFechaTurno && turno.horarioFechaTurno.fecha) {
        const dateParts = turno.horarioFechaTurno.fecha.split('/');
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        const dayIndex = date.getDay(); // Sunday - Saturday : 0 - 6
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const day = daysOfWeek[dayIndex];
        if (dayCounts[day] !== undefined) {
          dayCounts[day]++;
        }
      }
    });

    const labels = Object.keys(dayCounts);
    const values: any = Object.values(dayCounts);
    const colors = labels.map(() => this.getRandomColor());

    // Renderizar el gráfico de barras
    this.renderBarChart(labels, values, colors);
  }

  generateDoughnutChartData(startDate: string, endDate: string) {
    const doctorCounts: any = {};

    const start = new Date(startDate);
    const end = new Date(endDate);

    this.listaTurnos.forEach((turno: Turnos) => {
      if (turno.horarioFechaTurno && turno.horarioFechaTurno.fecha && turno.estadoTurno !== 'Finalizado') {
        const dateParts = turno.horarioFechaTurno.fecha.split('/');
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

        if (date >= start && date <= end) {
          const doctor = turno.nombreEspecialista || 'Desconocido';
          if (!doctorCounts[doctor]) {
            doctorCounts[doctor] = 0;
          }
          doctorCounts[doctor]++;
        }
      }
    });

    const labels = Object.keys(doctorCounts);
    const values: any = Object.values(doctorCounts);
    const colors = labels.map(() => this.getRandomColor());

    // Renderizar el gráfico de doughnut
    this.renderDoughnutChart(labels, values, colors);
  }

  generateDoughnutChartDataFinalizado(startDate: string, endDate: string) {
    const doctorCounts: any = {};

    const start = new Date(startDate);
    const end = new Date(endDate);

    this.listaTurnos.forEach((turno: Turnos) => {
      if (turno.horarioFechaTurno && turno.horarioFechaTurno.fecha && turno.estadoTurno === 'Finalizado') {
        const dateParts = turno.horarioFechaTurno.fecha.split('/');
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

        if (date >= start && date <= end) {
          const doctor = turno.nombreEspecialista || 'Desconocido';
          if (!doctorCounts[doctor]) {
            doctorCounts[doctor] = 0;
          }
          doctorCounts[doctor]++;
        }
      }
    });

    const labels = Object.keys(doctorCounts);
    const values: any = Object.values(doctorCounts);
    const colors = labels.map(() => this.getRandomColor());

    // Renderizar el gráfico de doughnut
    this.renderDoughnutChartDos(labels, values, colors);
  }

  renderPieChart(labels: string[], values: number[], colors: string[]) {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Turnos por Especialidad',
            data: values,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || 0;
                  return `${label}: ${value} turno(s)`;
                }
              }
            }
          }
        }
      });
    }
  }

  renderBarChart(labels: string[], values: number[], colors: string[]) {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Turnos por Día',
            data: values,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || 0;
                  return `${label}: ${value} turno(s)`;
                }
              }
            }
          }
        }
      });
    }
  }

  renderDoughnutChart(labels: string[], values: number[], colors: string[]) {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Turnos por Médico',
            data: values,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || 0;
                  return `${label}: ${value} turno(s)`;
                }
              }
            }
          }
        }
      });
    }
  }
  renderDoughnutChartDos(labels: string[], values: number[], colors: string[]) {
    const ctx = document.getElementById('doughnutChartDos') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Turnos por Médico',
            data: values,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || 0;
                  return `${label}: ${value} turno(s)`;
                }
              }
            }
          }
        }
      });
    }
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  updateDoughnutChart() {
    if (this.startDate && this.endDate) {
      this.generateDoughnutChartData(this.startDate, this.endDate);
    }
  }
  updateDoughnutChartFinalizado() {
    if (this.startDateDos && this.endDateDos) {
      this.generateDoughnutChartDataFinalizado(this.startDateDos, this.endDateDos);
    }
  }
}
