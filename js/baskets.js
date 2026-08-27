/**
 * Projeto Acolher - Assistente de Montagem de Cestas Básicas FEFO
 * Algoritmo de Otimização e Previsão Logística
 * Projeto Integrador II - UNIVESP
 */

const BasketsModule = {
  init() {
    this.render();
  },

  render() {
    const capacity = FefoEngine.calculateBasketCapacity();
    
    // Card de Capacidade Total
    const capacityBox = document.getElementById('basket-capacity-box');
    if (capacityBox) {
      capacityBox.innerHTML = `
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-lg">
          <div class="space-y-2 text-center md:text-left">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Motor Logístico FEFO Ativo
            </span>
            <h3 class="text-2xl md:text-3xl font-extrabold font-heading">Capacidade Máxima Atual: ${capacity.maxBaskets} Cestas</h3>
            <p class="text-blue-100 text-sm max-w-xl">
              O algoritmo calculou a montagem completa priorizando os lotes com datas de validade mais próximas.
              ${capacity.bottlenecks.length > 0 ? `<br><strong class="text-amber-200">Gargalo de estoque:</strong> ${capacity.bottlenecks.join(', ')}.` : ''}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <button onclick="BasketsModule.openAssembleModal(${capacity.maxBaskets})" 
              ${capacity.maxBaskets === 0 ? 'disabled' : ''}
              class="px-6 py-3.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-blue-900 font-bold rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
              <i data-lucide="package-plus" class="w-5 h-5 text-blue-600"></i> Montar Cestas Agora
            </button>
          </div>
        </div>
      `;
    }

    // Tabela de Composição da Receita e Disponibilidade
    const tableContainer = document.getElementById('basket-recipe-table-container');
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th class="py-4 px-5">Item da Cesta</th>
                <th class="py-4 px-4">Categoria</th>
                <th class="py-4 px-4 text-center">Qtd. por Cesta</th>
                <th class="py-4 px-4 text-center">Disponível em Estoque</th>
                <th class="py-4 px-4 text-center">Capacidade Unitária</th>
                <th class="py-4 px-4">Status de Suprimento</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${capacity.recipeDetails.map(item => {
                const isBottleneck = capacity.bottlenecks.includes(item.name);
                return `
                  <tr class="hover:bg-slate-50/80 transition-colors ${isBottleneck ? 'bg-amber-50/40' : ''}">
                    <td class="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      ${item.name}
                      ${isBottleneck ? '<span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Limitante</span>' : ''}
                    </td>
                    <td class="py-3.5 px-4 text-xs text-slate-500">${item.category}</td>
                    <td class="py-3.5 px-4 text-center font-semibold text-slate-900">${item.requiredPerBasket} ${item.unit}</td>
                    <td class="py-3.5 px-4 text-center font-bold text-slate-800">${item.available}</td>
                    <td class="py-3.5 px-4 text-center font-extrabold text-blue-700">${item.possibleBaskets} cestas</td>
                    <td class="py-3.5 px-4">
                      ${item.possibleBaskets === 0 ? `
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Sem Estoque
                        </span>
                      ` : item.possibleBaskets <= 5 ? `
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Estoque Baixo
                        </span>
                      ` : `
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Abastecido
                        </span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    lucide.createIcons();
  },

  openAssembleModal(maxAvailable) {
    const modal = document.getElementById('modal-assemble-baskets');
    document.getElementById('assemble-qty').value = Math.min(maxAvailable, 5);
    document.getElementById('assemble-qty').max = maxAvailable;
    document.getElementById('assemble-max-hint').innerText = `Capacidade calculada: ${maxAvailable} cesta(s)`;
    
    this.updateAssemblePreview();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  closeAssembleModal() {
    document.getElementById('modal-assemble-baskets').classList.add('hidden');
    document.getElementById('modal-assemble-baskets').classList.remove('flex');
  },

  updateAssemblePreview() {
    const qty = parseInt(document.getElementById('assemble-qty').value) || 0;
    const previewContainer = document.getElementById('assemble-fefo-preview');
    if (!previewContainer) return;

    if (qty <= 0) {
      previewContainer.innerHTML = `<div class="text-sm text-slate-500 italic p-3">Selecione uma quantidade válida para simular o FEFO.</div>`;
      return;
    }

    const recipe = window.appStore.getBasketRecipe();
    const currentStock = window.appStore.getStock();
    const lotsPreview = [];

    recipe.forEach(recipeItem => {
      let needed = recipeItem.quantity * qty;
      const matchingLots = currentStock
        .filter(lot => 
          lot.name.toLowerCase().trim() === recipeItem.name.toLowerCase().trim() &&
          lot.quantity > 0 &&
          FefoEngine.getStatus(lot.expiryDate).status !== 'expired'
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      matchingLots.forEach(lot => {
        if (needed <= 0) return;
        const take = Math.min(lot.quantity, needed);
        needed -= take;
        const fefo = FefoEngine.getStatus(lot.expiryDate);
        lotsPreview.push({
          item: lot.name,
          brand: lot.brand || '-',
          lot: lot.lot,
          take,
          unit: lot.unit,
          expiry: lot.expiryDate,
          fefoStatus: fefo.label,
          fefoClass: fefo.badgeClass
        });
      });
    });

    previewContainer.innerHTML = `
      <div class="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
        <span>Lotes que serão consumidos pela ordem FEFO:</span>
        <span class="text-blue-600 font-mono">${lotsPreview.length} lotes alocados</span>
      </div>
      <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
        ${lotsPreview.map(lp => `
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <strong class="text-slate-800">${lp.item}</strong> (${lp.brand} • ${lp.lot})
              <div class="text-[11px] text-slate-500">Validade: ${new Date(lp.expiry + 'T00:00:00').toLocaleDateString('pt-BR')} (${lp.fefoStatus})</div>
            </div>
            <div class="text-right">
              <span class="font-bold text-blue-700 font-mono">-${lp.take}</span>
              <span class="text-slate-500">${lp.unit}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  confirmAssembly() {
    const qty = parseInt(document.getElementById('assemble-qty').value) || 0;
    if (qty <= 0) {
      App.showToast('Informe uma quantidade válida de cestas.', 'error');
      return;
    }

    const result = FefoEngine.assembleBaskets(qty, 'Montagem e preparação de cestas básicas');
    if (!result.success) {
      App.showToast(result.error, 'error');
      return;
    }

    App.showToast(`Sucesso! ${qty} cesta(s) montada(s) com baixa automática por FEFO.`, 'success');
    this.closeAssembleModal();
    this.render();
    if (window.StockModule) window.StockModule.render();
    if (window.DashboardModule) window.DashboardModule.update();
  }
};

window.BasketsModule = BasketsModule;
