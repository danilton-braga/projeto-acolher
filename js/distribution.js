/**
 * Projeto Acolher - Módulo de Entregas e Controle de Frequência
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const DistributionModule = {
  currentSearch: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-delivery');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase();
        this.render();
      });
    }

    const benSelect = document.getElementById('del-beneficiary-select');
    if (benSelect) {
      benSelect.addEventListener('change', (e) => {
        this.handleBeneficiaryChange(e.target.value);
      });
    }
  },

  render() {
    const container = document.getElementById('deliveries-list-container');
    if (!container) return;

    let deliveries = window.appStore.getDeliveries();

    if (this.currentSearch) {
      deliveries = deliveries.filter(d => 
        d.beneficiaryName.toLowerCase().includes(this.currentSearch) ||
        (d.receiptNumber && d.receiptNumber.toLowerCase().includes(this.currentSearch)) ||
        (d.volunteerName && d.volunteerName.toLowerCase().includes(this.currentSearch)) ||
        (d.basketType && d.basketType.toLowerCase().includes(this.currentSearch))
      );
    }

    const countBadge = document.getElementById('delivery-count-badge');
    if (countBadge) countBadge.innerText = `${deliveries.length} entregas realizadas`;

    if (deliveries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i data-lucide="package-check" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-semibold text-slate-700">Nenhum atendimento registrado</h4>
          <p class="text-slate-500 text-sm mt-1">Clique em "Nova Entrega" para realizar a baixa e emissão de comprovante.</p>
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
              <th class="py-4 px-5">Data & Nº Recibo</th>
              <th class="py-4 px-4">Beneficiário Atendido</th>
              <th class="py-4 px-4">Tipo de Cesta / Itens</th>
              <th class="py-4 px-4">Voluntário Responsável</th>
              <th class="py-4 px-5 text-right">Comprovante</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            ${deliveries.map(del => {
              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-4 px-5">
                    <div class="font-bold text-slate-900">${new Date(del.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    <span class="inline-block font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100">
                      ${del.receiptNumber}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-slate-800">${del.beneficiaryName}</div>
                    <div class="text-xs text-slate-500">CPF: ${del.beneficiaryCpf || 'Não informado'}</div>
                    ${del.overrideReason ? `<div class="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 mt-1 border border-amber-200 inline-block font-medium">Justificativa: ${del.overrideReason}</div>` : ''}
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-semibold text-slate-900">${del.basketType}</div>
                    <div class="text-xs text-slate-500 max-w-xs truncate" title="${del.itemsDescription}">${del.itemsDescription}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="text-xs font-medium text-slate-700">${del.volunteerName}</div>
                    <div class="text-[11px] text-slate-400 italic">${del.notes || ''}</div>
                  </td>
                  <td class="py-4 px-5 text-right">
                    <button onclick="DistributionModule.printReceipt('${del.id}')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition">
                      <i data-lucide="printer" class="w-3.5 h-3.5"></i> Imprimir Recibo
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

  openDeliveryModalFor(beneficiaryId = null) {
    this.openAddModal();
    if (beneficiaryId) {
      document.getElementById('del-beneficiary-select').value = beneficiaryId;
      this.handleBeneficiaryChange(beneficiaryId);
    }
  },

  openAddModal() {
    const form = document.getElementById('delivery-form');
    form.reset();
    document.getElementById('del-date').value = new Date().toISOString().split('T')[0];
    
    // Preenche select de beneficiários
    const select = document.getElementById('del-beneficiary-select');
    const beneficiaries = window.appStore.getBeneficiaries().filter(b => b.status !== 'Inativo');
    
    select.innerHTML = `
      <option value="">-- Selecione a Família / Responsável --</option>
      ${beneficiaries.map(b => `
        <option value="${b.id}">${b.name} (${b.neighborhood}) - CPF: ${b.cpf || 'S/N'}</option>
      `).join('')}
    `;

    document.getElementById('frequency-warning-box').classList.add('hidden');
    document.getElementById('modal-delivery').classList.remove('hidden');
    document.getElementById('modal-delivery').classList.add('flex');
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modal-delivery').classList.add('hidden');
    document.getElementById('modal-delivery').classList.remove('flex');
  },

  handleBeneficiaryChange(benId) {
    const warningBox = document.getElementById('frequency-warning-box');
    if (!benId) {
      warningBox.classList.add('hidden');
      return;
    }

    const ben = window.appStore.getBeneficiaries().find(b => b.id === benId);
    if (!ben) return;

    const freq = BeneficiariesModule.getFrequencyStatus(ben.lastDeliveryDate);
    const minDays = window.appStore.getConfig().minDeliveryIntervalDays || 30;

    if (!freq.isEligible && ben.lastDeliveryDate) {
      warningBox.classList.remove('hidden');
      warningBox.innerHTML = `
        <div class="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
          <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <strong class="font-bold">Atenção ao Intervalo de Atendimento!</strong>
            <p class="mt-0.5">Esta família recebeu uma cesta há <strong>${freq.daysSince} dias</strong> (última entrega em ${new Date(ben.lastDeliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}).</p>
            <p class="text-[11px] text-amber-700 mt-1">O intervalo padrão de atendimento é de <strong>${minDays} dias</strong>. Por favor, forneça uma justificativa no campo abaixo caso trate-se de uma liberação emergencial.</p>
          </div>
        </div>
      `;
      lucide.createIcons();
    } else {
      warningBox.classList.add('hidden');
    }
  },

  save(e) {
    if (e) e.preventDefault();

    const benId = document.getElementById('del-beneficiary-select').value;
    if (!benId) {
      App.showToast('Selecione a família beneficiária.', 'error');
      return;
    }

    const ben = window.appStore.getBeneficiaries().find(b => b.id === benId);
    if (!ben) return;

    const autoFefoDeduct = document.getElementById('del-auto-fefo').checked;
    const basketType = document.getElementById('del-basket-type').value;
    const isStandardBasket = basketType.includes('Padrão') || basketType.includes('Familiar') || basketType.includes('Emergencial');

    // Executa baixa no estoque pelo FEFO se solicitado
    if (autoFefoDeduct && isStandardBasket) {
      const fefoResult = FefoEngine.assembleBaskets(1, `Entrega para beneficiário: ${ben.name}`);
      if (!fefoResult.success) {
        if (!confirm(`Aviso: ${fefoResult.error}\nDeseja continuar e registrar a entrega mesmo sem itens suficientes para dedução completa no estoque?`)) {
          return;
        }
      }
    }

    const payload = {
      beneficiaryId: ben.id,
      beneficiaryName: ben.name,
      beneficiaryCpf: ben.cpf,
      deliveryDate: document.getElementById('del-date').value || new Date().toISOString().split('T')[0],
      basketType: basketType,
      itemsDescription: document.getElementById('del-items-desc').value.trim() || '1x Cesta Básica Completa Padronizada FEFO',
      volunteerName: document.getElementById('del-volunteer').value.trim() || 'Voluntário do Setor Social',
      overrideReason: document.getElementById('del-override-reason').value.trim(),
      notes: document.getElementById('del-notes').value.trim()
    };

    const createdDelivery = window.appStore.addDelivery(payload);

    App.showToast(`Entrega registrada com sucesso! Recibo: ${createdDelivery.receiptNumber}`, 'success');
    this.closeModal();
    this.render();
    if (window.BeneficiariesModule) window.BeneficiariesModule.render();
    if (window.StockModule) window.StockModule.render();
    if (window.BasketsModule) window.BasketsModule.render();
    if (window.DashboardModule) window.DashboardModule.update();

    // Pergunta se deseja imprimir o recibo agora
    setTimeout(() => {
      if (confirm(`Deseja imprimir o Termo de Recebimento para ${ben.name} agora?`)) {
        this.printReceipt(createdDelivery.id);
      }
    }, 400);
  },

  printReceipt(id) {
    const del = window.appStore.getDeliveries().find(d => d.id === id);
    if (!del) return;

    const ben = window.appStore.getBeneficiaries().find(b => b.id === del.beneficiaryId) || {};
    const config = window.appStore.getConfig();

    const printArea = document.getElementById('printable-area');
    printArea.innerHTML = `
      <div class="p-8 max-w-3xl mx-auto border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-sans">
        <!-- Cabeçalho -->
        <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h2 class="text-xl font-bold uppercase tracking-wider">${config.institutionName}</h2>
          <h3 class="text-sm font-semibold text-slate-600">${config.departmentName} - ${config.address}</h3>
          <h4 class="text-xs font-mono text-blue-700 mt-1">${config.projectTitle}</h4>
        </div>

        <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <h1 class="text-base font-bold uppercase tracking-wide">
            TERMO DE RECEBIMENTO DE CESTA BÁSICA / ASSISTÊNCIA ALIMENTAR
          </h1>
          <span class="font-mono text-xs font-bold bg-slate-100 border border-slate-300 px-3 py-1 rounded">
            Nº ${del.receiptNumber}
          </span>
        </div>

        <!-- Conteúdo -->
        <div class="space-y-4 text-xs leading-relaxed">
          <p>
            Eu, abaixo assinado(a), declaro para os devidos fins que recebi gratuitamente do <strong>Departamento Social da ${config.institutionName}</strong> a doação descrita a seguir:
          </p>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div class="grid grid-cols-2 gap-2">
              <p><strong>Beneficiário(a):</strong> ${del.beneficiaryName}</p>
              <p><strong>CPF:</strong> ${del.beneficiaryCpf || 'Não informado'}</p>
              <p><strong>Endereço:</strong> ${ben.address || '-'}, ${ben.neighborhood || 'Santo André'}</p>
              <p><strong>Composição Familiar:</strong> ${ben.familyMembers || 1} pessoas</p>
            </div>
            <hr class="border-slate-200 my-2">
            <p><strong>Tipo de Benefício:</strong> ${del.basketType}</p>
            <p><strong>Composição dos Alimentos:</strong> ${del.itemsDescription}</p>
            <p><strong>Data de Entrega:</strong> ${new Date(del.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            ${del.overrideReason ? `<p><strong>Observação / Carência:</strong> ${del.overrideReason}</p>` : ''}
          </div>

          <p class="text-[11px] text-slate-600 italic">
            Declaro que os alimentos recebidos destinam-se exclusivamente ao consumo próprio e de meus dependentes, sendo vedada a comercialização. Atesto ter verificado a integridade das embalagens e prazos de validade no momento da retirada.
          </p>

          <!-- Assinaturas -->
          <div class="grid grid-cols-2 gap-8 pt-14 text-center">
            <div>
              <div class="border-t border-slate-400 pt-1.5 font-bold">${del.beneficiaryName}</div>
              <div class="text-[11px] text-slate-500">Assinatura do(a) Beneficiário(a)</div>
            </div>
            <div>
              <div class="border-t border-slate-400 pt-1.5 font-bold">${del.volunteerName}</div>
              <div class="text-[11px] text-slate-500">Voluntário Responsável pela Entrega</div>
            </div>
          </div>

          <div class="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100 mt-6">
            Projeto Acolher • Sistema de Gestão FEFO e Mapeamento Social • Santo André - SP • Emissão: ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    `;

    window.print();
  }
};

window.DistributionModule = DistributionModule;
