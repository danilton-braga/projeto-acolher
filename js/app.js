/**
 * Projeto Acolher - Controlador Principal da Aplicação
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const App = {
  currentTab: 'dashboard',

  init() {
    this.bindNavigation();
    this.bindGlobalShortcuts();
    this.refreshAll();
    lucide.createIcons();
  },

  bindNavigation() {
    const navButtons = document.querySelectorAll('[data-tab-target]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-tab-target');
        this.navigateTo(target);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
      });
    }
  },

  bindGlobalShortcuts() {
    // Tecla ESC fecha modais abertos
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.fixed.flex:not(.hidden)');
        openModals.forEach(m => {
          m.classList.add('hidden');
          m.classList.remove('flex');
        });
      }
    });
  },

  navigateTo(tabId) {
    this.currentTab = tabId;

    // Atualiza classes dos botões de navegação
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const isCurrent = btn.getAttribute('data-tab-target') === tabId;
      if (isCurrent) {
        btn.classList.add('bg-blue-50', 'text-blue-700', 'font-bold');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
      } else {
        btn.classList.remove('bg-blue-50', 'text-blue-700', 'font-bold');
        btn.classList.add('text-slate-600', 'hover:bg-slate-50');
      }
    });

    // Esconde todas as abas e mostra a selecionada
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    const activeTabEl = document.getElementById(`tab-${tabId}`);
    if (activeTabEl) {
      activeTabEl.classList.add('active');
    }

    // Fecha o menu lateral no mobile se estiver aberto
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth < 768) {
      sidebar.classList.add('-translate-x-full');
    }

    // Executa renderização específica da aba
    if (tabId === 'dashboard' && window.DashboardModule) window.DashboardModule.update();
    if (tabId === 'stock' && window.StockModule) window.StockModule.render();
    if (tabId === 'baskets' && window.BasketsModule) window.BasketsModule.render();
    if (tabId === 'donations' && window.DonationsModule) window.DonationsModule.render();
    if (tabId === 'beneficiaries' && window.BeneficiariesModule) window.BeneficiariesModule.render();
    if (tabId === 'deliveries' && window.DistributionModule) window.DistributionModule.render();
    if (tabId === 'reports' && window.ReportsModule) window.ReportsModule.render();

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  refreshAll() {
    if (window.DashboardModule) window.DashboardModule.init();
    if (window.StockModule) window.StockModule.init();
    if (window.BasketsModule) window.BasketsModule.init();
    if (window.DonationsModule) window.DonationsModule.init();
    if (window.BeneficiariesModule) window.BeneficiariesModule.init();
    if (window.DistributionModule) window.DistributionModule.init();
    if (window.ReportsModule) window.ReportsModule.init();
    lucide.createIcons();
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
