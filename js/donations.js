/**
 * Projeto Acolher - Módulo de Entrada de Doações e Penas Alternativas
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const DonationsModule = {
  currentFilter: 'all',
  currentSearch: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-donation');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase();
        this.render();
      });
    }

    const typeFilter = document.getElementById('filter-donation-type');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.render();
      });
    }
  },

  render() {
    const container = document.getElementById('donations-list-container');
    if (!container) return;

    let donations = window.appStore.getDonations();

    if (this.currentSearch) {
      donations = donations.filter(d => 
        d.donorName.toLowerCase().includes(this.currentSearch) ||
        (d.documentRef && d.documentRef.toLowerCase().includes(this.currentSearch)) ||
        (d.sourceType && d.sourceType.toLowerCase().includes(this.currentSearch)) ||
        (d.itemsSummary && d.itemsSummary.toLowerCase().includes(this.currentSearch))
      );
    }

    if (this.currentFilter !== 'all') {
      donations = donations.filter(d => d.sourceType === this.currentFilter);
    }

    const countBadge = document.getElementById('donation-count-badge');
    if (countBadge) countBadge.innerText = `${donations.length} entradas`;

    if (donations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i data-lucide="hand-heart" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-semibold text-slate-700">Nenhuma doação registrada</h4>
          <p class="text-slate-500 text-sm mt-1">Registre entradas de cultos, doações diretas ou prestação pecuniária.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th class="py-4 px-5">Data & Origem</th>
              <th class="py-4 px-4">Doador / Referência Judicial</th>
              <th class="py-4 px-4">Itens / Resumo da Doação</th>
              <th class="py-4 px-4">Receptor / Voluntário</th>
              <th class="py-4 px-5 text-right">Comprovante</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            ${donations.map(don => {
              const isJudicial = don.sourceType && don.sourceType.includes('Pena Alternativa');
              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-4 px-5">
                    <div class="font-bold text-slate-900">${new Date(don.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${isJudicial ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
                      <i data-lucide="${isJudicial ? 'scale' : 'heart'}" class="w-3 h-3"></i> ${don.sourceType}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-slate-800">${don.donorName}</div>
                    <div class="text-xs text-slate-500 font-mono mt-0.5">${don.documentRef || '-'}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-medium text-slate-900">${don.itemsSummary}</div>
                    <div class="text-xs text-slate-500 mt-0.5">${don.category || 'Alimentos'}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="text-xs text-slate-700 font-medium">${don.volunteerReceiver || 'Equipe Social'}</div>
                    <div class="text-[11px] text-slate-400 italic truncate max-w-xs">${don.notes || ''}</div>
                  </td>
                  <td class="py-4 px-5 text-right">
                    <button onclick="DonationsModule.printReceipt('${don.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition">
                      <i data-lucide="printer" class="w-3.5 h-3.5"></i> Emitir Declaração
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    lucide.createIcons();
  },

  openAddModal() {
    document.getElementById('donation-form').reset();
    document.getElementById('don-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-donation').classList.remove('hidden');
    document.getElementById('modal-donation').classList.add('flex');
    this.handleTypeChange();
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modal-donation').classList.add('hidden');
    document.getElementById('modal-donation').classList.remove('flex');
  },

  handleTypeChange() {
    const type = document.getElementById('don-type').value;
    const judicialGroup = document.getElementById('judicial-fields-group');
    if (judicialGroup) {
      if (type.includes('Pena Alternativa')) {
        judicialGroup.classList.remove('hidden');
      } else {
        judicialGroup.classList.add('hidden');
      }
    }
  },

  save(e) {
    if (e) e.preventDefault();

    const donorName = document.getElementById('don-donor-name').value.trim();
    const itemsSummary = document.getElementById('don-items').value.trim();
    if (!donorName || !itemsSummary) {
      App.showToast('Preencha o nome do doador/origem e o resumo dos alimentos.', 'error');
      return;
    }

    const payload = {
      sourceType: document.getElementById('don-type').value,
      donorName,
      documentRef: document.getElementById('don-doc-ref').value.trim() || 'Doação Espontânea',
      date: document.getElementById('don-date').value || new Date().toISOString().split('T')[0],
      category: document.getElementById('don-category').value,
      itemsSummary,
      volunteerReceiver: document.getElementById('don-receiver').value.trim() || 'Equipe do Departamento Social',
      notes: document.getElementById('don-notes').value.trim()
    };

    const created = window.appStore.addDonation(payload);

    // Se o usuário marcou para lançar automaticamente um lote no estoque FEFO
    const autoStockItem = document.getElementById('don-auto-stock').checked;
    if (autoStockItem) {
      const foodName = document.getElementById('don-stock-food-name').value.trim();
      const foodQty = parseFloat(document.getElementById('don-stock-qty').value);
      const foodExpiry = document.getElementById('don-stock-expiry').value;

      if (foodName && foodQty > 0 && foodExpiry) {
        window.appStore.addStockItem({
          name: foodName,
          category: document.getElementById('don-stock-cat').value,
          brand: document.getElementById('don-stock-brand').value.trim() || 'Diversas',
          lot: 'LT-' + Math.floor(1000 + Math.random() * 9000),
          quantity: foodQty,
          unit: document.getElementById('don-stock-unit').value,
          entryDate: payload.date,
          expiryDate: foodExpiry,
          donationSource: `${payload.sourceType} (${payload.donorName})`,
          notes: 'Lançamento automático via registro de doação'
        });
      }
    }

    App.showToast('Doação registrada com sucesso!', 'success');
    this.closeModal();
    this.render();
    if (window.StockModule) window.StockModule.render();
    if (window.DashboardModule) window.DashboardModule.update();
  },

  printReceipt(id) {
    const don = window.appStore.getDonations().find(d => d.id === id);
    if (!don) return;

    const config = window.appStore.getConfig();
    const isJudicial = don.sourceType.includes('Pena Alternativa');

    const printArea = document.getElementById('printable-area');
    printArea.innerHTML = `
      <div class="p-8 max-w-3xl mx-auto border-2 border-slate-300 rounded-xl bg-white text-slate-800">
        <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h2 class="text-xl font-bold uppercase tracking-wider">${config.institutionName}</h2>
          <h3 class="text-sm font-semibold text-slate-600">${config.departmentName} - ${config.address}</h3>
          <h4 class="text-xs font-mono text-blue-700 mt-1">${config.projectTitle}</h4>
        </div>

        <div class="text-center my-6">
          <h1 class="text-lg font-bold uppercase border-y border-slate-300 py-2 inline-block px-6">
            ${isJudicial ? 'TERMO DE RECEBIMENTO DE PRESTAÇÃO PECUNIÁRIA / PENA ALTERNATIVA' : 'DECLARAÇÃO DE RECEBIMENTO DE DOAÇÃO SOCIAL'}
          </h1>
        </div>

        <div class="space-y-4 text-sm leading-relaxed">
          <p>
            Declaramos para os devidos fins de direito e prestação de contas que o <strong>Departamento Social da ${config.institutionName}</strong> recebeu em <strong>${new Date(don.date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> a seguinte doação:
          </p>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <p><strong>Origem / Modalidade:</strong> ${don.sourceType}</p>
            <p><strong>Doador / Responsável:</strong> ${don.donorName}</p>
            <p><strong>Documento / Processo de Referência:</strong> ${don.documentRef || 'Não informado'}</p>
            <p><strong>Especificação dos Itens Recebidos:</strong> ${don.itemsSummary}</p>
            <p><strong>Destinação:</strong> Composição de Cestas Básicas e Mapeamento de Famílias em Vulnerabilidade Social (Projeto Acolher).</p>
          </div>

          <p class="text-xs text-slate-500 italic">
            Esta entidade atesta que todos os itens recebidos são devidamente triados por data de validade com base na metodologia FEFO (Primeiro a Vencer, Primeiro a Sair) e distribuídos gratuitamente às famílias assistidas.
          </p>

          <div class="grid grid-cols-2 gap-8 pt-16 text-center text-xs">
            <div>
              <div class="border-t border-slate-400 pt-2 font-bold">${don.volunteerReceiver}</div>
              <div class="text-slate-500">Representante do Setor Social</div>
            </div>
            <div>
              <div class="border-t border-slate-400 pt-2 font-bold">${don.donorName}</div>
              <div class="text-slate-500">Doador / Cumpridor da Medida</div>
            </div>
          </div>

          <div class="text-center text-[10px] text-slate-400 pt-8 border-t border-slate-100">
            Documento emitido eletronicamente pelo Sistema Web Projeto Acolher • Data de Impressão: ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    `;

    window.print();
  }
};

window.DonationsModule = DonationsModule;
