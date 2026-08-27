/**
 * Projeto Acolher - Gestão de Beneficiários e Mapeamento de Famílias
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const BeneficiariesModule = {
  currentFilter: 'all',
  currentSearch: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-beneficiary');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase();
        this.render();
      });
    }

    const filterSelect = document.getElementById('filter-beneficiary-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.render();
      });
    }
  },

  getFrequencyStatus(lastDeliveryDate) {
    if (!lastDeliveryDate) {
      return {
        code: 'never',
        label: 'Primeiro Atendimento',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        isEligible: true,
        daysSince: null
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(lastDeliveryDate + 'T00:00:00');
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const minDays = window.appStore.getConfig().minDeliveryIntervalDays || 30;

    if (diffDays >= minDays) {
      return {
        code: 'eligible',
        label: `Apto (${diffDays} dias)`,
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        isEligible: true,
        daysSince: diffDays
      };
    } else {
      return {
        code: 'recent',
        label: `Atendido há ${diffDays}d (Atenção)`,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        isEligible: false,
        daysSince: diffDays
      };
    }
  },

  render() {
    const container = document.getElementById('beneficiaries-list-container');
    if (!container) return;

    let beneficiaries = window.appStore.getBeneficiaries();

    // Filtro por texto
    if (this.currentSearch) {
      beneficiaries = beneficiaries.filter(b => 
        (b.name && b.name.toLowerCase().includes(this.currentSearch)) ||
        (b.cpf && b.cpf.includes(this.currentSearch)) ||
        (b.neighborhood && b.neighborhood.toLowerCase().includes(this.currentSearch)) ||
        (b.address && b.address.toLowerCase().includes(this.currentSearch))
      );
    }

    // Filtro por status / elegibilidade
    if (this.currentFilter === 'eligible') {
      beneficiaries = beneficiaries.filter(b => this.getFrequencyStatus(b.lastDeliveryDate).isEligible);
    } else if (this.currentFilter === 'recent') {
      beneficiaries = beneficiaries.filter(b => !this.getFrequencyStatus(b.lastDeliveryDate).isEligible && b.lastDeliveryDate);
    } else if (this.currentFilter === 'never') {
      beneficiaries = beneficiaries.filter(b => !b.lastDeliveryDate);
    }

    // Contador no título
    const countBadge = document.getElementById('beneficiary-count-badge');
    if (countBadge) countBadge.innerText = `${beneficiaries.length} famílias`;

    if (beneficiaries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i data-lucide="users-round" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-semibold text-slate-700">Nenhum beneficiário encontrado</h4>
          <p class="text-slate-500 text-sm mt-1">Tente ajustar seus termos de busca ou filtros.</p>
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
              <th class="py-4 px-5">Responsável / Família</th>
              <th class="py-4 px-4">Localização</th>
              <th class="py-4 px-4">Composição Familiar</th>
              <th class="py-4 px-4">Vulnerabilidade</th>
              <th class="py-4 px-4 text-center">Status de Frequência</th>
              <th class="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            ${beneficiaries.map(ben => {
              const freq = this.getFrequencyStatus(ben.lastDeliveryDate);
              const cleanPhone = (ben.phone || '').replace(/\D/g, '');
              const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent('Olá ' + ben.name + ', entramos em contato do Departamento Social da Assembleia de Deus de Utinga.')}` : null;
              
              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-4 px-5">
                    <div class="font-bold text-slate-900 flex items-center gap-2">
                      ${ben.name}
                      ${ben.status === 'Inativo' ? '<span class="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Inativo</span>' : ''}
                    </div>
                    <div class="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span>CPF: ${ben.cpf || 'Não informado'}</span>
                      ${ben.phone ? `
                        <span class="flex items-center gap-1 text-blue-600">
                          <i data-lucide="phone" class="w-3.5 h-3.5"></i> ${ben.phone}
                        </span>
                      ` : ''}
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-medium text-slate-800">${ben.neighborhood || 'Santo André'}</div>
                    <div class="text-xs text-slate-500">${ben.address || 'Endereço não informado'}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <i data-lucide="users" class="w-3 h-3 mr-1"></i> ${ben.familyMembers || 1} pessoas
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                      ${ben.childrenCount ? `${ben.childrenCount} criança(s)` : ''} 
                      ${ben.elderlyCount ? `• ${ben.elderlyCount} idoso(s)` : ''}
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="text-xs font-medium text-slate-700 max-w-xs truncate" title="${ben.vulnerability || '-'}">
                      ${ben.vulnerability || 'Vulnerabilidade Social Padrão'}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">Renda: ${ben.income || 'Não declarada'}</div>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-bold border ${freq.badgeClass}">
                      ${freq.label}
                    </span>
                    <div class="text-[11px] text-slate-400 mt-1">
                      ${ben.lastDeliveryDate ? `Última: ${new Date(ben.lastDeliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : 'Nenhuma entrega anterior'}
                    </div>
                  </td>
                  <td class="py-4 px-5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${waUrl ? `
                        <a href="${waUrl}" target="_blank" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Conversar no WhatsApp">
                          <i data-lucide="message-circle" class="w-4 h-4"></i>
                        </a>
                      ` : ''}
                      <button onclick="BeneficiariesModule.viewDetails('${ben.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Histórico e Detalhes">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                      <button onclick="BeneficiariesModule.openEditModal('${ben.id}')" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Editar Cadastro">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                      </button>
                      <button onclick="BeneficiariesModule.delete('${ben.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
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
    document.getElementById('beneficiary-form').reset();
    document.getElementById('beneficiary-id').value = '';
    document.getElementById('modal-beneficiary-title').innerText = 'Novo Cadastro de Família Beneficiária';
    document.getElementById('modal-beneficiary').classList.remove('hidden');
    document.getElementById('modal-beneficiary').classList.add('flex');
    lucide.createIcons();
  },

  openEditModal(id) {
    const ben = window.appStore.getBeneficiaries().find(b => b.id === id);
    if (!ben) return;

    document.getElementById('beneficiary-id').value = ben.id;
    document.getElementById('ben-name').value = ben.name || '';
    document.getElementById('ben-cpf').value = ben.cpf || '';
    document.getElementById('ben-rg').value = ben.rg || '';
    document.getElementById('ben-nis').value = ben.nis || '';
    document.getElementById('ben-phone').value = ben.phone || '';
    document.getElementById('ben-address').value = ben.address || '';
    document.getElementById('ben-neighborhood').value = ben.neighborhood || 'Utinga';
    document.getElementById('ben-members').value = ben.familyMembers || 1;
    document.getElementById('ben-children').value = ben.childrenCount || 0;
    document.getElementById('ben-elderly').value = ben.elderlyCount || 0;
    document.getElementById('ben-vulnerability').value = ben.vulnerability || '';
    document.getElementById('ben-income').value = ben.income || '';
    document.getElementById('ben-status').value = ben.status || 'Ativo';
    document.getElementById('ben-notes').value = ben.notes || '';

    document.getElementById('modal-beneficiary-title').innerText = 'Editar Cadastro de Beneficiário';
    document.getElementById('modal-beneficiary').classList.remove('hidden');
    document.getElementById('modal-beneficiary').classList.add('flex');
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modal-beneficiary').classList.add('hidden');
    document.getElementById('modal-beneficiary').classList.remove('flex');
  },

  save(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('beneficiary-id').value;
    const name = document.getElementById('ben-name').value.trim();
    if (!name) {
      App.showToast('Por favor, informe o nome do responsável familiar.', 'error');
      return;
    }

    const payload = {
      name,
      cpf: document.getElementById('ben-cpf').value.trim(),
      rg: document.getElementById('ben-rg').value.trim(),
      nis: document.getElementById('ben-nis').value.trim(),
      phone: document.getElementById('ben-phone').value.trim(),
      address: document.getElementById('ben-address').value.trim(),
      neighborhood: document.getElementById('ben-neighborhood').value.trim(),
      city: 'Santo André - SP',
      familyMembers: parseInt(document.getElementById('ben-members').value) || 1,
      childrenCount: parseInt(document.getElementById('ben-children').value) || 0,
      elderlyCount: parseInt(document.getElementById('ben-elderly').value) || 0,
      vulnerability: document.getElementById('ben-vulnerability').value.trim(),
      income: document.getElementById('ben-income').value.trim(),
      status: document.getElementById('ben-status').value,
      notes: document.getElementById('ben-notes').value.trim()
    };

    if (id) {
      const existing = window.appStore.getBeneficiaries().find(b => b.id === id);
      payload.id = id;
      payload.registrationDate = existing ? existing.registrationDate : new Date().toISOString().split('T')[0];
      payload.lastDeliveryDate = existing ? existing.lastDeliveryDate : null;
      window.appStore.updateBeneficiary(payload);
      App.showToast('Cadastro atualizado com sucesso!', 'success');
    } else {
      payload.registrationDate = new Date().toISOString().split('T')[0];
      payload.lastDeliveryDate = null;
      window.appStore.addBeneficiary(payload);
      App.showToast('Nova família cadastrada no Projeto Acolher!', 'success');
    }

    this.closeModal();
    this.render();
    if (window.DashboardModule) window.DashboardModule.update();
  },

  viewDetails(id) {
    const ben = window.appStore.getBeneficiaries().find(b => b.id === id);
    if (!ben) return;

    const deliveries = window.appStore.getDeliveries().filter(d => d.beneficiaryId === id);
    const freq = this.getFrequencyStatus(ben.lastDeliveryDate);

    const modalContent = document.getElementById('modal-details-content');
    modalContent.innerHTML = `
      <div class="space-y-6">
        <!-- Cabeçalho do Perfil -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-bold text-slate-900">${ben.name}</h3>
              <span class="px-3 py-1 rounded-full text-xs font-bold border ${freq.badgeClass}">
                ${freq.label}
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-1">Cadastrado em ${new Date(ben.registrationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
          <button onclick="DistributionModule.openDeliveryModalFor('${ben.id}')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
            <i data-lucide="package-check" class="w-4 h-4"></i> Entregar Cesta para esta Família
          </button>
        </div>

        <!-- Grade de Informações -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <h5 class="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <i data-lucide="id-card" class="w-4 h-4 text-blue-600"></i> Documentos e Contato
            </h5>
            <p><strong class="text-slate-600">CPF:</strong> ${ben.cpf || 'Não informado'}</p>
            <p><strong class="text-slate-600">RG:</strong> ${ben.rg || 'Não informado'}</p>
            <p><strong class="text-slate-600">NIS / PIS:</strong> ${ben.nis || 'Não informado'}</p>
            <p><strong class="text-slate-600">Telefone:</strong> ${ben.phone || 'Não informado'}</p>
            <p><strong class="text-slate-600">Endereço:</strong> ${ben.address || '-'}, Bairro ${ben.neighborhood || '-'}</p>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <h5 class="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <i data-lucide="heart-handshake" class="w-4 h-4 text-emerald-600"></i> Composição e Vulnerabilidade
            </h5>
            <p><strong class="text-slate-600">Total de Moradores:</strong> ${ben.familyMembers} pessoa(s)</p>
            <p><strong class="text-slate-600">Crianças / Idosos:</strong> ${ben.childrenCount} criança(s) • ${ben.elderlyCount} idoso(s)</p>
            <p><strong class="text-slate-600">Renda Familiar:</strong> ${ben.income || 'Não declarada'}</p>
            <p><strong class="text-slate-600">Quadro Social:</strong> <span class="text-rose-700 font-medium">${ben.vulnerability || '-'}</span></p>
            <p><strong class="text-slate-600">Observações:</strong> <span class="italic text-slate-600">${ben.notes || 'Sem anotações'}</span></p>
          </div>
        </div>

        <!-- Histórico de Entregas -->
        <div>
          <h5 class="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="history" class="w-5 h-5 text-blue-600"></i> Histórico de Atendimentos Recebidos (${deliveries.length})
          </h5>
          ${deliveries.length === 0 ? `
            <div class="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-sm">
              Nenhuma entrega registrada ainda para esta família.
            </div>
          ` : `
            <div class="overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th class="py-2.5 px-3">Data</th>
                    <th class="py-2.5 px-3">Cesta / Kit</th>
                    <th class="py-2.5 px-3">Responsável</th>
                    <th class="py-2.5 px-3">Nº Recibo</th>
                    <th class="py-2.5 px-3 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${deliveries.map(d => `
                    <tr>
                      <td class="py-2.5 px-3 font-semibold text-slate-900">${new Date(d.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td class="py-2.5 px-3">${d.basketType}</td>
                      <td class="py-2.5 px-3 text-slate-600">${d.volunteerName}</td>
                      <td class="py-2.5 px-3 font-mono text-blue-700">${d.receiptNumber || '-'}</td>
                      <td class="py-2.5 px-3 text-right">
                        <button onclick="DistributionModule.printReceipt('${d.id}')" class="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1">
                          <i data-lucide="printer" class="w-3.5 h-3.5"></i> Imprimir
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    document.getElementById('modal-details').classList.remove('hidden');
    document.getElementById('modal-details').classList.add('flex');
    lucide.createIcons();
  },

  closeDetailsModal() {
    document.getElementById('modal-details').classList.add('hidden');
    document.getElementById('modal-details').classList.remove('flex');
  },

  delete(id) {
    if (confirm('Tem certeza que deseja excluir o cadastro desta família do Projeto Acolher?')) {
      window.appStore.deleteBeneficiary(id);
      App.showToast('Beneficiário removido com sucesso.', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.update();
    }
  }
};

window.BeneficiariesModule = BeneficiariesModule;
