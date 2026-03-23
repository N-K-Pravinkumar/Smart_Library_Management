import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page fade-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Library performance insights</p>
        </div>
        <button class="btn btn--outline">Export PDF</button>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card">
            <p class="kpi-label">{{ kpi.label }}</p>
            <p class="kpi-val">{{ kpi.value }}</p>
            <p class="kpi-delta" [style.color]="kpi.up ? 'var(--success)' : 'var(--crimson)'">
              {{ kpi.up ? '↑' : '↓' }} {{ kpi.delta }}% vs last month
            </p>
          </div>
        }
      </div>

      <div class="reports-grid">
        <!-- Monthly borrow chart (SVG bar chart) -->
        <div class="card">
          <h2 class="section-title">Monthly Borrows</h2>
          <div class="bar-chart">
            @for (bar of monthlyData; track bar.month) {
              <div class="bar-col">
                <div class="bar-wrap">
                  <div class="bar" [style.height.%]="bar.pct" [title]="bar.val + ' borrows'">
                    <span class="bar-val">{{ bar.val }}</span>
                  </div>
                </div>
                <span class="bar-label">{{ bar.month }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Top categories -->
        <div class="card">
          <h2 class="section-title">By Category</h2>
          <div class="cat-bars">
            @for (cat of categoryData; track cat.name) {
              <div class="cat-row">
                <span class="cat-name">{{ cat.name }}</span>
                <div class="cat-bar-wrap">
                  <div class="cat-bar" [style.width.%]="cat.pct" [style.background]="cat.color"></div>
                </div>
                <span class="cat-count">{{ cat.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Revenue table -->
        <div class="card reports-grid__wide">
          <h2 class="section-title">Revenue Breakdown</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Month</th><th>Membership</th><th>Fines</th><th>Total</th><th>Growth</th></tr></thead>
              <tbody>
                @for (row of revenueData; track row.month) {
                  <tr>
                    <td><strong>{{ row.month }}</strong></td>
                    <td>₹{{ row.membership | number }}</td>
                    <td>₹{{ row.fines | number }}</td>
                    <td style="font-weight:600">₹{{ (row.membership + row.fines) | number }}</td>
                    <td [style.color]="row.growth >= 0 ? 'var(--success)' : 'var(--crimson)'">
                      {{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    @media(max-width:900px){ .kpi-row{ grid-template-columns:1fr 1fr; } }
    .kpi-card { background:white; border:1px solid var(--ink-05); border-radius:var(--r-lg); padding:20px; transition:all var(--transition); }
    .kpi-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
    .kpi-label { font-size:13px; color:var(--ink-40); margin-bottom:6px; }
    .kpi-val   { font-family:var(--font-display); font-size:28px; font-weight:600; margin-bottom:4px; }
    .kpi-delta { font-size:12px; }

    .reports-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
    .reports-grid__wide { grid-column:span 2; }
    @media(max-width:900px){ .reports-grid{ grid-template-columns:1fr; } .reports-grid__wide{ grid-column:span 1; } }

    .section-title { font-family:var(--font-display); font-size:18px; margin-bottom:20px; }

    /* Bar chart */
    .bar-chart { display:flex; align-items:flex-end; gap:8px; height:180px; padding-top:20px; }
    .bar-col   { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; height:100%; }
    .bar-wrap  { flex:1; width:100%; display:flex; align-items:flex-end; }
    .bar { width:100%; background:var(--gold); border-radius:4px 4px 0 0; position:relative; transition:height .6s ease; min-height:4px; display:flex; align-items:flex-start; justify-content:center; cursor:pointer; }
    .bar:hover { background:var(--gold-light); }
    .bar-val   { font-size:10px; font-family:var(--font-mono); color:var(--ink); position:absolute; top:-18px; white-space:nowrap; }
    .bar-label { font-size:11px; color:var(--ink-40); }

    /* Category bars */
    .cat-bars { display:flex; flex-direction:column; gap:14px; }
    .cat-row   { display:flex; align-items:center; gap:12px; }
    .cat-name  { font-size:13px; width:90px; flex-shrink:0; color:var(--ink-40); }
    .cat-bar-wrap { flex:1; height:8px; background:var(--ink-05); border-radius:4px; overflow:hidden; }
    .cat-bar   { height:100%; border-radius:4px; transition:width .8s ease; }
    .cat-count { font-size:12px; font-family:var(--font-mono); color:var(--ink-40); width:32px; text-align:right; }
  `]
})
export class ReportsComponent {
  kpis = [
    { label:'Books Issued (Month)', value:'248',   delta:12, up:true  },
    { label:'New Members',          value:'34',    delta:8,  up:true  },
    { label:'Fine Collection',      value:'₹3,600', delta:5, up:true  },
    { label:'Avg. Borrow Days',     value:'11.4',  delta:2,  up:false },
  ];

  monthlyData = [
    { month:'Oct', val:180, pct:60 }, { month:'Nov', val:210, pct:70 },
    { month:'Dec', val:165, pct:55 }, { month:'Jan', val:240, pct:80 },
    { month:'Feb', val:195, pct:65 }, { month:'Mar', val:248, pct:83 },
  ];

  categoryData = [
    { name:'Fiction',    count:89, pct:100, color:'#2a9d8f' },
    { name:'Self-Help',  count:72, pct:81,  color:'#c8a84b' },
    { name:'Technology', count:54, pct:61,  color:'#457b9d' },
    { name:'Science',    count:40, pct:45,  color:'#8338ec' },
    { name:'History',    count:33, pct:37,  color:'#c1121f' },
  ];

  revenueData = [
    { month:'October',  membership:12400, fines:1800, growth:0   },
    { month:'November', membership:13200, fines:2100, growth:8   },
    { month:'December', membership:11800, fines:1400, growth:-7  },
    { month:'January',  membership:14600, fines:2400, growth:19  },
    { month:'February', membership:15200, fines:1900, growth:4   },
    { month:'March',    membership:16800, fines:3200, growth:11  },
  ];
}
