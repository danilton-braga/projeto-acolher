/**
 * Projeto Acolher - Painel de Indicadores e Dashboard Social
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const DashboardModule = {
  charts: {},

  init() {
    this.renderMetrics();
    this.renderCharts();
    this.renderFefoActionBoard();
  },

  update() {
    this.renderMetrics();
    this.renderCharts();
    this.renderFefoActionBoard();
  },

  renderMetrics() {
    const stock = window.appStore.getStock();
    const beneficiaries = window.appStore.getBeneficiaries();
    const deliveries = window.appStore.getDeliveries();
    const donations = window.appStore.getDonations();

    // 1. Total Famílias
    const activeFamilies = beneficiaries.filter(b => b.status !== 'Inativo').length;
    const totalPeople = beneficiaries.reduce((acc, b) => acc + (parseInt(b.familyMembers) || 1), 0);

    // 2. Cestas Entregues no Mês Atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const deliveriesThisMonth = deliveries.filter(d => {
      const dt = new Date(d.deliveryDate + 'T00:00:00');
      return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
    }).length;

    // 3. Total Itens em Estoque
    const totalItemsCount = stock.reduce((acc, s) => acc + Number(s.quantity), 0);

    // 4. Alertas FEFO Críticos (<30 dias)
    const criticalLots = stock.filter(s => {
      const fefo = FefoEngine.getStatus(s.expiryDate);
      return (fefo.status === 'critical' || fefo.status === 'expired') && Number(s.quantity) > 0;
    });

    const metricsContainer = document.getElementById('dashboard-metrics-container');
    if (metricsContainer) {
      metricsContainer.innerHTML = `
        <!-- Card 1: Famílias -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Famílias Assistidas</p>
            <h4 class="text-2xl font-extrabold text-slate-900 mt-1">${activeFamilies}</h4>
            <p class="text-xs text-blue-600 font-medium mt-0.5">~${totalPeople} pessoas impactadas</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <i data-lucide="users" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 2: Cestas Entregues -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Cestas no Mês</p>
            <h4 class="text-2xl font-extrabold text-slate-900 mt-1">${deliveriesThisMonth}</h4>
            <p class="text-xs text-emerald-600 font-medium mt-0.5">Total histórico: ${deliveries.length}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <i data-lucide="package-check" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 3: Itens em Estoque -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Volume em Estoque</p>
            <h4 class="text-2xl font-extrabold text-slate-900 mt-1">${totalItemsCount} <span class="text-sm font-normal text-slate-500">un/kg</span></h4>
            <p class="text-xs text-indigo-600 font-medium mt-0.5">${stock.length} lotes rastreados</p>
          </div>
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <i data-lucide="boxes" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 4: Alerta FEFO -->
        <div class="bg-white p-5 rounded-2xl border ${criticalLots.length > 0 ? 'border-orange-300 bg-orange-50/20' : 'border-slate-200'} shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider ${criticalLots.length > 0 ? 'text-orange-700' : 'text-slate-500'}">Urgência FEFO (&lt;30d)</p>
            <h4 class="text-2xl font-extrabold ${criticalLots.length > 0 ? 'text-orange-600' : 'text-slate-900'} mt-1">${criticalLots.length} lotes</h4>
            <p class="text-xs ${criticalLots.length > 0 ? 'text-orange-700 font-bold' : 'text-slate-500'} mt-0.5">
              ${criticalLots.length > 0 ? 'Requer saída prioritária' : 'Estoque 100% seguro'}
            </p>
          </div>
          <div class="w-12 h-12 ${criticalLots.length > 0 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-slate-100 text-slate-600'} rounded-2xl flex items-center justify-center">
            <i data-lucide="alarm-clock" class="w-6 h-6"></i>
          </div>
        </div>
      `;
    }

    lucide.createIcons();
  },

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    // Destrói gráficos antigos se existirem
    if (this.charts.monthly) this.charts.monthly.destroy();
    if (this.charts.categories) this.charts.categories.destroy();
    if (this.charts.sources) this.charts.sources.destroy();

    const deliveries = window.appStore.getDeliveries();
    const stock = window.appStore.getStock();
    const donations = window.appStore.getDonations();

    // 1. Gráfico de Entregas por Mês
    const monthlyCtx = document.getElementById('chart-deliveries-monthly');
    if (monthlyCtx) {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyCounts = new Array(12).fill(0);

      deliveries.forEach(d => {
        const dt = new Date(d.deliveryDate + 'T00:00:00');
        monthlyCounts[dt.getMonth()] += 1;
      });

      this.charts.monthly = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: monthNames,
          datasets: [{
            label: 'Cestas Entregues',
            data: monthlyCounts,
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    }

    // 2. Gráfico de Categorias em Estoque
    const catCtx = document.getElementById('chart-stock-categories');
    if (catCtx) {
      const categoryMap = {};
      stock.forEach(s => {
        const cat = s.category || 'Outros';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(s.quantity);
      });

      const labels = Object.keys(categoryMap);
      const data = Object.values(categoryMap);

      this.charts.categories = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 3. Gráfico de Origem das Doações
    const srcCtx = document.getElementById('chart-donations-source');
    if (srcCtx) {
      const sourceMap = {};
      donations.forEach(d => {
        const src = d.sourceType || 'Outros';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });

      this.charts.sources = new Chart(srcCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(sourceMap),
          datasets: [{
            data: Object.values(sourceMap),
            backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  },

  renderFefoActionBoard() {
    const container = document.getElementById('fefo-action-board-container');
    if (!container) return;

    const stock = window.appStore.getStock();
    const urgentItems = stock
      .filter(s => {
        const fefo = FefoEngine.getStatus(s.expiryDate);
        return (fefo.status === 'critical' || fefo.status === 'expired') && Number(s.quantity) > 0;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (urgentItems.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          <i data-lucide="check-circle-2" class="w-8 h-8 text-emerald-500 mx-auto mb-2"></i>
          <p class="font-bold text-slate-700 text-sm">Nenhum item com vencimento crítico (&lt;30 dias)</p>
          <p class="text-xs text-slate-400 mt-0.5">O estoque está saudável e alinhado com a estratégia FEFO.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="space-y-2.5">
        ${urgentItems.map(item => {
          const fefo = FefoEngine.getStatus(item.expiryDate);
          return `
            <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-orange-200 shadow-sm hover:border-orange-400 transition">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                  FEFO
                </div>
                <div>
                  <h6 class="font-bold text-slate-900 text-sm">${item.name} (${item.brand || 'S/Marca'})</h6>
                  <p class="text-xs text-slate-500">Lote: ${item.lot} • Validade: <strong>${new Date(item.expiryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${fefo.badgeClass}">
                    ${fefo.label}
                  </span>
                  <div class="text-xs font-bold text-slate-700 mt-0.5">${item.quantity} ${item.unit}</div>
                </div>
                <button onclick="App.navigateTo('baskets')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm" title="Usar em Cestas">
                  Alocar
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    lucide.createIcons();
  }
};

window.DashboardModule = DashboardModule;
