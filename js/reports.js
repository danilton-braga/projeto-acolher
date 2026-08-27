/**
 * Projeto Acolher - Relatórios, Prestação de Contas e Exportação
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const ReportsModule = {
  init() {
    this.render();
  },

  render() {
    // Inicialização da aba de relatórios
  },

  generateGeneralReport() {
    const deliveries = window.appStore.getDeliveries();
    const beneficiaries = window.appStore.getBeneficiaries();
    const config = window.appStore.getConfig();

    const printArea = document.getElementById('printable-area');
    printArea.innerHTML = `
      <div class="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
        <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h2 class="text-xl font-bold uppercase">${config.institutionName}</h2>
          <h3 class="text-sm font-semibold text-slate-600">${config.departmentName} - Santo André / SP</h3>
          <h4 class="text-xs font-mono text-blue-700 mt-1">${config.projectTitle} - Relatório Geral de Entregas</h4>
        </div>

        <div class="flex items-center justify-between text-xs mb-4">
          <span><strong>Total de Registros:</strong> ${deliveries.length} entregas</span>
          <span><strong>Data de Emissão:</strong> ${new Date().toLocaleString('pt-BR')}</span>
        </div>

        <table class="w-full text-left text-xs border border-slate-300 border-collapse">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-300">
              <th class="p-2">Data</th>
              <th class="p-2">Nº Recibo</th>
              <th class="p-2">Beneficiário</th>
              <th class="p-2">CPF</th>
              <th class="p-2">Tipo de Cesta</th>
              <th class="p-2">Voluntário</th>
            </tr>
          </thead>
          <tbody>
            ${deliveries.map(d => `
              <tr class="border-b border-slate-200">
                <td class="p-2 font-medium">${new Date(d.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td class="p-2 font-mono">${d.receiptNumber}</td>
                <td class="p-2 font-bold">${d.beneficiaryName}</td>
                <td class="p-2">${d.beneficiaryCpf || '-'}</td>
                <td class="p-2">${d.basketType}</td>
                <td class="p-2">${d.volunteerName}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="pt-8 text-center text-xs text-slate-500">
          Documento gerado pelo sistema Projeto Acolher para prestação de contas institucional.
        </div>
      </div>
    `;

    window.print();
  },

  generateJudicialReport() {
    const donations = window.appStore.getDonations().filter(d => d.sourceType.includes('Pena Alternativa'));
    const config = window.appStore.getConfig();

    const printArea = document.getElementById('printable-area');
    printArea.innerHTML = `
      <div class="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
        <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h2 class="text-xl font-bold uppercase">${config.institutionName}</h2>
          <h3 class="text-sm font-semibold text-slate-600">${config.departmentName} - Santo André / SP</h3>
          <h4 class="text-xs font-mono text-purple-700 mt-1">RELATÓRIO CONSOLIDADO DE CUMPRIMENTO DE PRESTAÇÃO PECUNIÁRIA / PENAS ALTERNATIVAS</h4>
        </div>

        <p class="text-xs leading-relaxed mb-6">
          Encaminhado à <strong>Vara de Execuções Penais e Medidas Alternativas da Comarca de Santo André / SP</strong> para fins de comprovação da destinação socioassistencial dos bens recebidos em cumprimento de transações penais e penas alternativas.
        </p>

        <table class="w-full text-left text-xs border border-slate-300 border-collapse mb-8">
          <thead>
            <tr class="bg-purple-50 border-b border-purple-200">
              <th class="p-2">Data Entrada</th>
              <th class="p-2">Doador / Cumpridor</th>
              <th class="p-2">Processo / VEC</th>
              <th class="p-2">Itens Recebidos</th>
              <th class="p-2">Receptor Responsável</th>
            </tr>
          </thead>
          <tbody>
            ${donations.map(d => `
              <tr class="border-b border-slate-200">
                <td class="p-2 font-medium">${new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td class="p-2 font-bold">${d.donorName}</td>
                <td class="p-2 font-mono">${d.documentRef}</td>
                <td class="p-2">${d.itemsSummary}</td>
                <td class="p-2">${d.volunteerReceiver}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed">
          <strong class="text-slate-800">Declaração de Destinação:</strong> Atestamos que 100% dos alimentos e insumos recebidos foram triados via metodologia FEFO e entregues diretamente a famílias cadastradas em situação de extrema vulnerabilidade no município de Santo André.
        </div>

        <div class="grid grid-cols-2 gap-8 pt-16 text-center text-xs">
          <div>
            <div class="border-t border-slate-400 pt-2 font-bold">Coordenação do Departamento Social</div>
            <div class="text-slate-500">${config.institutionName}</div>
          </div>
          <div>
            <div class="border-t border-slate-400 pt-2 font-bold">Pastor Presidente / Representante Legal</div>
            <div class="text-slate-500">Assembleia de Deus de Utinga</div>
          </div>
        </div>
      </div>
    `;

    window.print();
  },

  exportCSV(type) {
    let filename = 'relatorio.csv';
    let csvContent = '\uFEFF'; // BOM para compatibilidade com Excel em PT-BR

    if (type === 'deliveries') {
      filename = `acolher_entregas_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'Data;Recibo;Beneficiario;CPF;Cesta;Itens;Responsavel;Justificativa;Observacoes\n';
      const deliveries = window.appStore.getDeliveries();
      deliveries.forEach(d => {
        csvContent += `"${d.deliveryDate}";"${d.receiptNumber}";"${d.beneficiaryName}";"${d.beneficiaryCpf || ''}";"${d.basketType}";"${(d.itemsDescription || '').replace(/"/g, '""')}";"${d.volunteerName}";"${d.overrideReason || ''}";"${(d.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'stock') {
      filename = `acolher_estoque_fefo_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'ID;Alimento;Categoria;Marca;Lote;Quantidade;Unidade;Entrada;Validade;Dias_Restantes;Status_FEFO;Origem\n';
      const stock = FefoEngine.sortStock(window.appStore.getStock());
      stock.forEach(s => {
        const fefo = FefoEngine.getStatus(s.expiryDate);
        csvContent += `"${s.id}";"${s.name}";"${s.category}";"${s.brand || ''}";"${s.lot}";"${s.quantity}";"${s.unit}";"${s.entryDate}";"${s.expiryDate}";"${fefo.daysRemaining}";"${fefo.label}";"${(s.donationSource || '').replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'beneficiaries') {
      filename = `acolher_familias_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'ID;Nome;CPF;RG;NIS;Telefone;Endereco;Bairro;Total_Pessoas;Criancas;Idosos;Vulnerabilidade;Renda;Ultimo_Atendimento;Status\n';
      const list = window.appStore.getBeneficiaries();
      list.forEach(b => {
        csvContent += `"${b.id}";"${b.name}";"${b.cpf || ''}";"${b.rg || ''}";"${b.nis || ''}";"${b.phone || ''}";"${(b.address || '').replace(/"/g, '""')}";"${b.neighborhood || ''}";"${b.familyMembers}";"${b.childrenCount}";"${b.elderlyCount}";"${(b.vulnerability || '').replace(/"/g, '""')}";"${b.income || ''}";"${b.lastDeliveryDate || 'Nunca'}";"${b.status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.showToast(`Relatório CSV exportado com sucesso: ${filename}`, 'success');
  },

  downloadBackup() {
    const dataStr = window.appStore.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `backup_projeto_acolher_${new Date().toISOString().split('T')[0]}.json`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.showToast('Backup JSON baixado com sucesso!', 'success');
  },

  restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      const success = window.appStore.importAllData(contents);
      if (success) {
        App.showToast('Dados restaurados com sucesso a partir do backup!', 'success');
        App.refreshAll();
      } else {
        App.showToast('Arquivo de backup inválido.', 'error');
      }
    };
    reader.readAsText(file);
  },

  resetDemoData() {
    if (confirm('Deseja restaurar os dados de demonstração originais do Projeto Integrador (Santo André/Utinga)? Todas as alterações serão redefinidas.')) {
      window.appStore.resetToDefaults();
      App.showToast('Dados de demonstração restaurados com sucesso!', 'success');
      App.refreshAll();
    }
  }
};

window.ReportsModule = ReportsModule;
