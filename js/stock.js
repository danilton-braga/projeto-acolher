/**
 * Projeto Acolher - Módulo de Estoque e Rastreabilidade de Lotes FEFO
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const StockModule = {
  currentCategoryFilter: 'all',
  currentExpiryFilter: 'all',
  currentSearch: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-stock');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase();
        this.render();
      });
    }

    const catFilter = document.getElementById('filter-stock-category');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.currentCategoryFilter = e.target.value;
        this.render();
      });
    }

    const expFilter = document.getElementById('filter-stock-expiry');
    if (expFilter) {
      expFilter.addEventListener('change', (e) => {
        this.currentExpiryFilter = e.target.value;
        this.render();
      });
    }
  },

  render() {
    const container = document.getElementById('stock-list-container');
    if (!container) return;

    let stock = window.appStore.getStock();

    // Filtro por texto
    if (this.currentSearch) {
      stock = stock.filter(item => 
        item.name.toLowerCase().includes(this.currentSearch) ||
        (item.brand && item.brand.toLowerCase().includes(this.currentSearch)) ||
        (item.lot && item.lot.toLowerCase().includes(this.currentSearch)) ||
        (item.category && item.category.toLowerCase().includes(this.currentSearch)) ||
        (item.donationSource && item.donationSource.toLowerCase().includes(this.currentSearch))
      );
    }

    // Filtro por categoria
    if (this.currentCategoryFilter !== 'all') {
      stock = stock.filter(item => item.category === this.currentCategoryFilter);
    }

    // Filtro por validade FEFO
    if (this.currentExpiryFilter !== 'all') {
      stock = stock.filter(item => {
        const fefo = FefoEngine.getStatus(item.expiryDate);
        return fefo.status === this.currentExpiryFilter;
      });
    }

    // Ordenação obrigatória por FEFO (Mais próximo do vencimento primeiro)
    stock = FefoEngine.sortStock(stock);

    // Atualiza contadores do topo da aba de estoque
    const allStock = window.appStore.getStock();
    const criticalCount = allStock.filter(i => FefoEngine.getStatus(i.expiryDate).status === 'critical').length;
    const expiredCount = allStock.filter(i => FefoEngine.getStatus(i.expiryDate).status === 'expired').length;
    
    const countBadge = document.getElementById('stock-count-badge');
    if (countBadge) countBadge.innerText = `${stock.length} lotes listados`;

    const critBadge = document.getElementById('stock-critical-badge');
    if (critBadge) {
      critBadge.innerHTML = `<span class="inline-flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-orange-600"></i> ${criticalCount} lotes em urgência FEFO (<30d)</span>`;
    }

    if (stock.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i data-lucide="boxes" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-semibold text-slate-700">Nenhum lote encontrado</h4>
          <p class="text-slate-500 text-sm mt-1">Ajuste os filtros de validade ou registre um novo lote de doação.</p>
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
              <th class="py-4 px-5">Alimento / Item</th>
              <th class="py-4 px-4">Categoria</th>
              <th class="py-4 px-4">Lote & Marca</th>
              <th class="py-4 px-4 text-center">Quantidade</th>
              <th class="py-4 px-4">Validade (FEFO)</th>
              <th class="py-4 px-4">Origem da Doação</th>
              <th class="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            ${stock.map(item => {
              const fefo = FefoEngine.getStatus(item.expiryDate);
              const isZero = Number(item.quantity) <= 0;

              return `
                <tr class="hover:bg-slate-50/80 transition-colors ${isZero ? 'opacity-50 bg-slate-50' : ''}">
                  <td class="py-4 px-5">
                    <div class="font-bold text-slate-900 flex items-center gap-2">
                      ${item.name}
                      ${isZero ? '<span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-normal">Esgotado</span>' : ''}
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">Entrada: ${item.entryDate ? new Date(item.entryDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</div>
                  </td>
                  <td class="py-4 px-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      ${item.category || 'Geral'}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-medium text-slate-800">${item.brand || 'Marca não informada'}</div>
                    <div class="text-xs font-mono text-slate-500">Lote: ${item.lot || 'S/L'}</div>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <div class="font-bold text-base ${isZero ? 'text-slate-400' : 'text-slate-900'}">${item.quantity}</div>
                    <div class="text-xs text-slate-500">${item.unit}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-slate-900">
                      ${item.expiryDate ? new Date(item.expiryDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'}
                    </div>
                    <span class="inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${fefo.badgeClass}">
                      ${fefo.label}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="text-xs font-medium text-slate-800 max-w-xs truncate" title="${item.donationSource}">
                      ${item.donationSource || 'Doação Geral'}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 italic truncate max-w-xs">${item.notes || ''}</div>
                  </td>
                  <td class="py-4 px-5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button onclick="StockModule.openEditModal('${item.id}')" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Editar Lote">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                      </button>
                      <button onclick="StockModule.openDiscardModal('${item.id}')" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Registrar Descarte / Avaria">
                        <i data-lucide="alert-octagon" class="w-4 h-4"></i>
                      </button>
                      <button onclick="StockModule.delete('${item.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir Lote">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
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
    document.getElementById('stock-form').reset();
    document.getElementById('stock-id').value = '';
    document.getElementById('stk-entry-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-stock-title').innerText = 'Cadastrar Novo Lote de Alimentos';
    document.getElementById('modal-stock').classList.remove('hidden');
    document.getElementById('modal-stock').classList.add('flex');
    lucide.createIcons();
  },

  openEditModal(id) {
    const item = window.appStore.getStock().find(s => s.id === id);
    if (!item) return;

    document.getElementById('stock-id').value = item.id;
    document.getElementById('stk-name').value = item.name || '';
    document.getElementById('stk-category').value = item.category || 'Grãos';
    document.getElementById('stk-brand').value = item.brand || '';
    document.getElementById('stk-lot').value = item.lot || '';
    document.getElementById('stk-quantity').value = item.quantity;
    document.getElementById('stk-unit').value = item.unit || 'pct 1kg';
    document.getElementById('stk-entry-date').value = item.entryDate || '';
    document.getElementById('stk-expiry-date').value = item.expiryDate || '';
    document.getElementById('stk-source').value = item.donationSource || 'Campanha do Quilo (Culto)';
    document.getElementById('stk-notes').value = item.notes || '';

    document.getElementById('modal-stock-title').innerText = 'Editar Lote de Alimento';
    document.getElementById('modal-stock').classList.remove('hidden');
    document.getElementById('modal-stock').classList.add('flex');
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modal-stock').classList.add('hidden');
    document.getElementById('modal-stock').classList.remove('flex');
  },

  save(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('stock-id').value;
    const name = document.getElementById('stk-name').value.trim();
    const expiryDate = document.getElementById('stk-expiry-date').value;
    const quantity = parseFloat(document.getElementById('stk-quantity').value);

    if (!name) {
      App.showToast('Informe o nome do alimento/item.', 'error');
      return;
    }
    if (!expiryDate) {
      App.showToast('A data de validade é obrigatória para o cálculo do FEFO.', 'error');
      return;
    }
    if (isNaN(quantity) || quantity < 0) {
      App.showToast('Informe uma quantidade válida.', 'error');
      return;
    }

    const payload = {
      name,
      category: document.getElementById('stk-category').value,
      brand: document.getElementById('stk-brand').value.trim(),
      lot: document.getElementById('stk-lot').value.trim() || 'LT-' + Math.floor(1000 + Math.random() * 9000),
      quantity,
      unit: document.getElementById('stk-unit').value,
      entryDate: document.getElementById('stk-entry-date').value || new Date().toISOString().split('T')[0],
      expiryDate,
      donationSource: document.getElementById('stk-source').value,
      notes: document.getElementById('stk-notes').value.trim()
    };

    if (id) {
      payload.id = id;
      window.appStore.updateStockItem(payload);
      App.showToast('Lote atualizado com sucesso!', 'success');
    } else {
      window.appStore.addStockItem(payload);
      App.showToast('Novo lote adicionado ao estoque FEFO!', 'success');
    }

    this.closeModal();
    this.render();
    if (window.DashboardModule) window.DashboardModule.update();
  },

  openDiscardModal(id) {
    const item = window.appStore.getStock().find(s => s.id === id);
    if (!item) return;

    const modal = document.getElementById('modal-discard');
    document.getElementById('discard-item-id').value = item.id;
    document.getElementById('discard-item-name').innerText = `${item.name} (${item.brand || 'S/Marca'}) - Lote: ${item.lot}`;
    document.getElementById('discard-max-qty').innerText = item.quantity;
    document.getElementById('discard-qty').value = 1;
    document.getElementById('discard-qty').max = item.quantity;
    document.getElementById('discard-reason').value = 'Vencimento sem consumo';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  closeDiscardModal() {
    document.getElementById('modal-discard').classList.add('hidden');
    document.getElementById('modal-discard').classList.remove('flex');
  },

  confirmDiscard() {
    const id = document.getElementById('discard-item-id').value;
    const qty = parseFloat(document.getElementById('discard-qty').value);
    const reason = document.getElementById('discard-reason').value;

    const item = window.appStore.getStock().find(s => s.id === id);
    if (!item || isNaN(qty) || qty <= 0 || qty > item.quantity) {
      App.showToast('Quantidade inválida para descarte.', 'error');
      return;
    }

    item.quantity -= qty;
    window.appStore.updateStockItem(item);
    
    App.showToast(`Descarte de ${qty} ${item.unit} registrado (${reason}).`, 'info');
    this.closeDiscardModal();
    this.render();
    if (window.DashboardModule) window.DashboardModule.update();
  },

  delete(id) {
    if (confirm('Tem certeza que deseja excluir permanentemente este lote de estoque?')) {
      window.appStore.deleteStockItem(id);
      App.showToast('Lote removido do estoque.', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.update();
    }
  }
};

window.StockModule = StockModule;
