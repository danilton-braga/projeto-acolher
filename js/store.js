/**
 * Projeto Acolher - Store / Data Management
 * Departamento Social da Assembleia de Deus de Utinga - Santo André
 * Projeto Integrador II - UNIVESP
 */

const STORAGE_KEYS = {
  STOCK: 'acolher_stock_v1',
  BENEFICIARIES: 'acolher_beneficiaries_v1',
  DONATIONS: 'acolher_donations_v1',
  DELIVERIES: 'acolher_deliveries_v1',
  BASKET_RECIPE: 'acolher_basket_recipe_v1',
  CONFIG: 'acolher_config_v1'
};

// Receita Padrão de Composição da Cesta Básica
const DEFAULT_BASKET_RECIPE = [
  { id: 'arroz', name: 'Arroz', quantity: 1, unit: 'pct 5kg', category: 'Grãos' },
  { id: 'feijao', name: 'Feijão Carioca', quantity: 2, unit: 'pct 1kg', category: 'Grãos' },
  { id: 'oleo', name: 'Óleo de Soja', quantity: 1, unit: 'un 900ml', category: 'Óleos e Gorduras' },
  { id: 'acucar', name: 'Açúcar Refinado', quantity: 1, unit: 'pct 1kg', category: 'Açúcares' },
  { id: 'macarrao', name: 'Macarrão Espaguete/Parafuso', quantity: 2, unit: 'pct 500g', category: 'Massas' },
  { id: 'cafe', name: 'Café Torrado e Moído', quantity: 1, unit: 'pct 500g', category: 'Matinais' },
  { id: 'molho', name: 'Molho de Tomate', quantity: 2, unit: 'un 340g', category: 'Enlatados e Molhos' },
  { id: 'sal', name: 'Sal Refinado', quantity: 1, unit: 'pct 1kg', category: 'Temperos' },
  { id: 'leite', name: 'Leite Longa Vida Integral', quantity: 2, unit: 'un 1L', category: 'Laticínios' },
  { id: 'farinha', name: 'Farinha de Trigo', quantity: 1, unit: 'pct 1kg', category: 'Farinhas' },
  { id: 'biscoito', name: 'Biscoito Cream Cracker/Doce', quantity: 1, unit: 'pct 400g', category: 'Matinais' }
];

// Dados Iniciais Realistas (Santo André / Utinga)
function getInitialData() {
  const today = new Date();
  
  // Função auxiliar para gerar datas relativas
  const addDays = (d, days) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().split('T')[0];
  };

  const initialStock = [
    // Lotes de Arroz
    { id: 'STK-001', name: 'Arroz', category: 'Grãos', brand: 'Tio João', lot: 'LT2026-A1', quantity: 12, unit: 'pct 5kg', entryDate: addDays(today, -20), expiryDate: addDays(today, 18), donationSource: 'Campanha do Quilo (Culto)', notes: 'Prioridade FEFO: vence em menos de 20 dias' },
    { id: 'STK-002', name: 'Arroz', category: 'Grãos', brand: 'Camil', lot: 'LT2026-A2', quantity: 30, unit: 'pct 5kg', entryDate: addDays(today, -5), expiryDate: addDays(today, 120), donationSource: 'Prestação Pecuniária - Proc. 1500284/2026', notes: 'Lote seguro' },
    
    // Lotes de Feijão
    { id: 'STK-003', name: 'Feijão Carioca', category: 'Grãos', brand: 'Kicaldo', lot: 'LT2026-F1', quantity: 15, unit: 'pct 1kg', entryDate: addDays(today, -35), expiryDate: addDays(today, 12), donationSource: 'Campanha do Quilo (Culto)', notes: 'CRÍTICO: Consumir urgente nesta semana' },
    { id: 'STK-004', name: 'Feijão Carioca', category: 'Grãos', brand: 'Camil', lot: 'LT2026-F2', quantity: 50, unit: 'pct 1kg', entryDate: addDays(today, -5), expiryDate: addDays(today, 180), donationSource: 'Prestação Pecuniária - Proc. 1500284/2026', notes: 'Lote novo em perfeito estado' },
    
    // Lotes de Óleo
    { id: 'STK-005', name: 'Óleo de Soja', category: 'Óleos e Gorduras', brand: 'Liza', lot: 'LT2026-O1', quantity: 8, unit: 'un 900ml', entryDate: addDays(today, -15), expiryDate: addDays(today, 25), donationSource: 'Doação de Membro', notes: 'Próximo do vencimento' },
    { id: 'STK-006', name: 'Óleo de Soja', category: 'Óleos e Gorduras', brand: 'Soya', lot: 'LT2026-O2', quantity: 35, unit: 'un 900ml', entryDate: addDays(today, -2), expiryDate: addDays(today, 210), donationSource: 'Prestação Pecuniária - Proc. 1500284/2026', notes: 'Estoque regular' },
    
    // Lotes de Macarrão
    { id: 'STK-007', name: 'Macarrão Espaguete/Parafuso', category: 'Massas', brand: 'Dona Benta', lot: 'LT2026-M1', quantity: 14, unit: 'pct 500g', entryDate: addDays(today, -25), expiryDate: addDays(today, 28), donationSource: 'Campanha do Quilo (Culto)', notes: 'FEFO: Vence em < 30 dias' },
    { id: 'STK-008', name: 'Macarrão Espaguete/Parafuso', category: 'Massas', brand: 'Adria', lot: 'LT2026-M2', quantity: 45, unit: 'pct 500g', entryDate: addDays(today, -10), expiryDate: addDays(today, 150), donationSource: 'Campanha de Missões', notes: 'Estoque seguro' },
    
    // Lotes de Açúcar
    { id: 'STK-009', name: 'Açúcar Refinado', category: 'Açúcares', brand: 'União', lot: 'LT2026-AC1', quantity: 28, unit: 'pct 1kg', entryDate: addDays(today, -8), expiryDate: addDays(today, 240), donationSource: 'Prestação Pecuniária - Proc. 1500284/2026', notes: 'Validade longa' },
    
    // Lotes de Café
    { id: 'STK-010', name: 'Café Torrado e Moído', category: 'Matinais', brand: 'Pilão', lot: 'LT2026-C1', quantity: 9, unit: 'pct 500g', entryDate: addDays(today, -30), expiryDate: addDays(today, 15), donationSource: 'Campanha do Quilo (Culto)', notes: 'FEFO Crítico: usar nas próximas cestas' },
    { id: 'STK-011', name: 'Café Torrado e Moído', category: 'Matinais', brand: '3 Corações', lot: 'LT2026-C2', quantity: 25, unit: 'pct 500g', entryDate: addDays(today, -4), expiryDate: addDays(today, 180), donationSource: 'Supermercado Coop Utinga', notes: 'Doação de parceria' },
    
    // Lotes de Molho de Tomate
    { id: 'STK-012', name: 'Molho de Tomate', category: 'Enlatados e Molhos', brand: 'Elefante', lot: 'LT2026-MT1', quantity: 38, unit: 'un 340g', entryDate: addDays(today, -12), expiryDate: addDays(today, 95), donationSource: 'Campanha do Quilo (Culto)', notes: 'Estoque médio' },
    
    // Lotes de Leite
    { id: 'STK-013', name: 'Leite Longa Vida Integral', category: 'Laticínios', brand: 'Piracanjuba', lot: 'LT2026-L1', quantity: 18, unit: 'un 1L', entryDate: addDays(today, -10), expiryDate: addDays(today, 22), donationSource: 'Doação de Membro', notes: 'Atenção especial à validade rápida' },
    { id: 'STK-014', name: 'Leite Longa Vida Integral', category: 'Laticínios', brand: 'Itambé', lot: 'LT2026-L2', quantity: 40, unit: 'un 1L', entryDate: addDays(today, -3), expiryDate: addDays(today, 110), donationSource: 'Prestação Pecuniária - Proc. 1500284/2026', notes: 'Lote seguro' },

    // Lotes de Sal e Farinha
    { id: 'STK-015', name: 'Sal Refinado', category: 'Temperos', brand: 'Cisne', lot: 'LT2026-S1', quantity: 30, unit: 'pct 1kg', entryDate: addDays(today, -15), expiryDate: addDays(today, 365), donationSource: 'Campanha do Quilo (Culto)', notes: 'Estoque seguro' },
    { id: 'STK-016', name: 'Farinha de Trigo', category: 'Farinhas', brand: 'Dona Benta', lot: 'LT2026-FT1', quantity: 22, unit: 'pct 1kg', entryDate: addDays(today, -7), expiryDate: addDays(today, 130), donationSource: 'Campanha do Quilo (Culto)', notes: 'Estoque seguro' },
    { id: 'STK-017', name: 'Biscoito Cream Cracker/Doce', category: 'Matinais', brand: 'Marilan', lot: 'LT2026-B1', quantity: 26, unit: 'pct 400g', entryDate: addDays(today, -14), expiryDate: addDays(today, 85), donationSource: 'Campanha de Missões', notes: 'Atenção ao FEFO' }
  ];

  const initialBeneficiaries = [
    {
      id: 'BEN-001',
      name: 'Maria Helena dos Santos',
      cpf: '245.891.438-12',
      rg: '34.891.204-X',
      nis: '128.49102.34-5',
      phone: '(11) 98741-2563',
      address: 'Rua Lisboa, 142',
      neighborhood: 'Utinga',
      city: 'Santo André - SP',
      familyMembers: 5,
      childrenCount: 3,
      elderlyCount: 0,
      vulnerability: 'Desemprego e Família Monoparental',
      income: 'R$ 600,00 (Auxílio Brasil/Bolsa Família)',
      status: 'Ativo',
      registrationDate: addDays(today, -120),
      lastDeliveryDate: addDays(today, -38),
      notes: 'Mãe solo com 3 crianças em idade escolar. Muito assídua e necessitada de leite e alimentos matinais.'
    },
    {
      id: 'BEN-002',
      name: 'José Carlos de Oliveira',
      cpf: '112.548.798-44',
      rg: '22.109.845-7',
      nis: '160.33910.12-1',
      phone: '(11) 97412-8899',
      address: 'Alameda Vieira de Carvalho, 305',
      neighborhood: 'Santa Teresinha',
      city: 'Santo André - SP',
      familyMembers: 3,
      childrenCount: 0,
      elderlyCount: 2,
      vulnerability: 'Idosos com gastos elevados em remédios contínuos',
      income: '1 Salário Mínimo (Aposentadoria)',
      status: 'Ativo',
      registrationDate: addDays(today, -90),
      lastDeliveryDate: addDays(today, -33),
      notes: 'Casal de idosos. A esposa faz tratamento de saúde na UBS Utinga.'
    },
    {
      id: 'BEN-003',
      name: 'Fabiana Aparecida da Silva',
      cpf: '334.672.198-05',
      rg: '41.229.001-2',
      nis: '201.88412.90-9',
      phone: '(11) 96325-1144',
      address: 'Rua Sud Menucci, 88 - Fundos',
      neighborhood: 'Vila Metalúrgica',
      city: 'Santo André - SP',
      familyMembers: 4,
      childrenCount: 2,
      elderlyCount: 0,
      vulnerability: 'Trabalho Informal / Bicos',
      income: 'R$ 800,00',
      status: 'Ativo',
      registrationDate: addDays(today, -45),
      lastDeliveryDate: addDays(today, -12), // Recente: <30 dias (deve acionar alerta no sistema de controle de frequência)
      notes: 'Recebeu cesta há 12 dias. Acompanhar para evitar sobreposição desnecessária antes do prazo de 30 dias.'
    },
    {
      id: 'BEN-004',
      name: 'Antônio Marcos Ferreira',
      cpf: '098.341.288-71',
      rg: '19.845.112-9',
      nis: '133.90142.55-8',
      phone: '(11) 95214-7788',
      address: 'Rua Timor, 512',
      neighborhood: 'Camilópolis',
      city: 'Santo André - SP',
      familyMembers: 6,
      childrenCount: 4,
      elderlyCount: 0,
      vulnerability: 'Extrema Vulnerabilidade / Desemprego',
      income: 'R$ 450,00',
      status: 'Ativo',
      registrationDate: addDays(today, -60),
      lastDeliveryDate: addDays(today, -42),
      notes: 'Família numerosa. Recomenda-se complementar com itens avulsos de leite e biscoitos quando disponível.'
    },
    {
      id: 'BEN-005',
      name: 'Luciana Mendes Barbosa',
      cpf: '402.195.638-33',
      rg: '48.912.445-3',
      nis: '180.22415.66-4',
      phone: '(11) 94112-9900',
      address: 'Rua Jorge Beretta, 90',
      neighborhood: 'Parque Novo Oratório',
      city: 'Santo André - SP',
      familyMembers: 2,
      childrenCount: 1,
      elderlyCount: 0,
      vulnerability: 'Mãe jovem desempregada',
      income: 'Sem renda fixa',
      status: 'Ativo',
      registrationDate: addDays(today, -15),
      lastDeliveryDate: null, // Novo cadastro: nunca recebeu
      notes: 'Primeiro atendimento pendente. Cadastrada na triagem do último culto social.'
    }
  ];

  const initialDonations = [
    {
      id: 'DON-001',
      sourceType: 'Prestação Pecuniária / Pena Alternativa',
      donorName: 'Carlos Eduardo Nogueira (Processo Judicial)',
      documentRef: 'Proc. 1500284-45.2026.8.26.0554 - VEC Santo André',
      date: addDays(today, -5),
      category: 'Cestas Básicas Prontas & Fardos',
      itemsSummary: '20 Cestas Básicas Completas padronizadas',
      volunteerReceiver: 'Pr. Marcos / Diácono Ricardo',
      notes: 'Destinação decorrente de cumprimento de transação penal / prestação pecuniária da Vara de Execuções Penais de Santo André.'
    },
    {
      id: 'DON-002',
      sourceType: 'Campanha de Culto',
      donorName: 'Comunidade da Assembleia de Deus Utinga',
      documentRef: 'Culto de Missões e Ação Social - Março/2026',
      date: addDays(today, -12),
      category: 'Alimentos Não Perecíveis Diversos',
      itemsSummary: '140kg de alimentos avulsos (Arroz, Feijão, Óleo, Açúcar, Macarrão)',
      volunteerReceiver: 'Equipe do Setor Social (Irmã Eunice)',
      notes: 'Arrecadação do primeiro domingo do mês.'
    },
    {
      id: 'DON-003',
      sourceType: 'Parceria Comercial / Supermercado',
      donorName: 'Supermercado Coop Utinga - Responsabilidade Social',
      documentRef: 'Termo de Parceria Social Nº 04/2026',
      date: addDays(today, -20),
      category: 'Laticínios e Matinais',
      itemsSummary: '60 Litros de Leite e 40 Pacotes de Café',
      volunteerReceiver: 'Diácono Ricardo Santos',
      notes: 'Lotes com prazo médio de 90 a 120 dias.'
    }
  ];

  const initialDeliveries = [
    {
      id: 'DEL-001',
      beneficiaryId: 'BEN-001',
      beneficiaryName: 'Maria Helena dos Santos',
      beneficiaryCpf: '245.891.438-12',
      deliveryDate: addDays(today, -38),
      basketType: 'Cesta Básica Familiar Padrão (16 Itens)',
      itemsDescription: '1x Arroz 5kg, 2x Feijão 1kg, 1x Óleo, 1x Açúcar, 2x Macarrão, 1x Café, 2x Molho, 1x Sal, 2x Leite, 1x Farinha, 2x Biscoito',
      volunteerName: 'Ricardo Martins (Setor Social)',
      receiptNumber: 'REC-2026-001',
      overrideReason: '',
      notes: 'Entregue na sede da igreja. Beneficiária assinou o termo de recebimento.'
    },
    {
      id: 'DEL-002',
      beneficiaryId: 'BEN-002',
      beneficiaryName: 'José Carlos de Oliveira',
      beneficiaryCpf: '112.548.798-44',
      deliveryDate: addDays(today, -33),
      basketType: 'Cesta Básica + Kit Laticínio Especial Idoso',
      itemsDescription: 'Cesta Básica Padrão + 2 Litros de Leite desnatado adicionais',
      volunteerName: 'Irmã Eunice Silva',
      receiptNumber: 'REC-2026-002',
      overrideReason: '',
      notes: 'Entregue em domicílio devido à dificuldade de locomoção do beneficiário.'
    },
    {
      id: 'DEL-003',
      beneficiaryId: 'BEN-003',
      beneficiaryName: 'Fabiana Aparecida da Silva',
      beneficiaryCpf: '334.672.198-05',
      deliveryDate: addDays(today, -12),
      basketType: 'Cesta Básica Emergencial',
      itemsDescription: '1 Cesta Básica Completa FEFO',
      volunteerName: 'Ricardo Martins',
      receiptNumber: 'REC-2026-003',
      overrideReason: 'Situação de desemprego recente na família',
      notes: 'Entregue no plantão social.'
    },
    {
      id: 'DEL-004',
      beneficiaryId: 'BEN-004',
      beneficiaryName: 'Antônio Marcos Ferreira',
      beneficiaryCpf: '098.341.288-71',
      deliveryDate: addDays(today, -42),
      basketType: 'Cesta Básica Familiar Grande',
      itemsDescription: 'Cesta Básica Completa + suplementação de 2kg de feijão e 2L de leite para as 4 crianças',
      volunteerName: 'Diácono Ricardo',
      receiptNumber: 'REC-2026-004',
      overrideReason: '',
      notes: 'Família em vulnerabilidade alta. Próximo atendimento liberado.'
    }
  ];

  const initialConfig = {
    institutionName: 'Igreja Evangélica Assembleia de Deus de Utinga',
    departmentName: 'Departamento Social e Ação Comunitária',
    address: 'Santo André - SP (Polo Univesp Céu Rosa da China)',
    projectTitle: 'Projeto Acolher - Gestão FEFO e Mapeamento Social',
    minDeliveryIntervalDays: 30, // Intervalo mínimo de dias entre entregas para uma mesma família
    fefoThresholds: {
      criticalDays: 30,  // < 30 dias: urgência máxima / prioridade imediata
      warningDays: 90    // 30 a 90 dias: atenção
    }
  };

  return {
    stock: initialStock,
    beneficiaries: initialBeneficiaries,
    donations: initialDonations,
    deliveries: initialDeliveries,
    basketRecipe: DEFAULT_BASKET_RECIPE,
    config: initialConfig
  };
}

// Classe Central do Store
class AppStore {
  constructor() {
    this.init();
  }

  init() {
    // Se não existir dados no LocalStorage, inicializa com os dados mock realistas
    if (!localStorage.getItem(STORAGE_KEYS.STOCK)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    const initial = getInitialData();
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(initial.stock));
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(initial.beneficiaries));
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(initial.donations));
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(initial.deliveries));
    localStorage.setItem(STORAGE_KEYS.BASKET_RECIPE, JSON.stringify(initial.basketRecipe));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(initial.config));
  }

  // Stock
  getStock() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');
  }

  saveStock(stock) {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }

  addStockItem(item) {
    const stock = this.getStock();
    if (!item.id) {
      item.id = 'STK-' + String(Date.now()).slice(-4);
    }
    stock.push(item);
    this.saveStock(stock);
    return item;
  }

  updateStockItem(item) {
    const stock = this.getStock();
    const index = stock.findIndex(s => s.id === item.id);
    if (index !== -1) {
      stock[index] = item;
      this.saveStock(stock);
    }
  }

  deleteStockItem(id) {
    let stock = this.getStock();
    stock = stock.filter(s => s.id !== id);
    this.saveStock(stock);
  }

  // Beneficiaries
  getBeneficiaries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BENEFICIARIES) || '[]');
  }

  saveBeneficiaries(beneficiaries) {
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(beneficiaries));
  }

  addBeneficiary(ben) {
    const list = this.getBeneficiaries();
    if (!ben.id) {
      ben.id = 'BEN-' + String(Date.now()).slice(-4);
    }
    list.push(ben);
    this.saveBeneficiaries(list);
    return ben;
  }

  updateBeneficiary(ben) {
    const list = this.getBeneficiaries();
    const index = list.findIndex(b => b.id === ben.id);
    if (index !== -1) {
      list[index] = ben;
      this.saveBeneficiaries(list);
    }
  }

  deleteBeneficiary(id) {
    let list = this.getBeneficiaries();
    list = list.filter(b => b.id !== id);
    this.saveBeneficiaries(list);
  }

  // Donations
  getDonations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
  }

  saveDonations(donations) {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
  }

  addDonation(don) {
    const list = this.getDonations();
    if (!don.id) {
      don.id = 'DON-' + String(Date.now()).slice(-4);
    }
    list.unshift(don);
    this.saveDonations(list);
    return don;
  }

  // Deliveries
  getDeliveries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DELIVERIES) || '[]');
  }

  saveDeliveries(deliveries) {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }

  addDelivery(del) {
    const list = this.getDeliveries();
    if (!del.id) {
      del.id = 'DEL-' + String(Date.now()).slice(-4);
    }
    if (!del.receiptNumber) {
      const year = new Date().getFullYear();
      del.receiptNumber = `REC-${year}-${String(list.length + 1).padStart(3, '0')}`;
    }
    list.unshift(del);
    this.saveDeliveries(list);

    // Atualiza a data de último atendimento do beneficiário
    const beneficiaries = this.getBeneficiaries();
    const ben = beneficiaries.find(b => b.id === del.beneficiaryId);
    if (ben) {
      ben.lastDeliveryDate = del.deliveryDate;
      this.saveBeneficiaries(beneficiaries);
    }

    return del;
  }

  // Basket Recipe
  getBasketRecipe() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BASKET_RECIPE) || JSON.stringify(DEFAULT_BASKET_RECIPE));
  }

  saveBasketRecipe(recipe) {
    localStorage.setItem(STORAGE_KEYS.BASKET_RECIPE, JSON.stringify(recipe));
  }

  // Config
  getConfig() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}');
  }

  saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
  }

  // Export / Import
  exportAllData() {
    return JSON.stringify({
      stock: this.getStock(),
      beneficiaries: this.getBeneficiaries(),
      donations: this.getDonations(),
      deliveries: this.getDeliveries(),
      basketRecipe: this.getBasketRecipe(),
      config: this.getConfig(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.stock && data.beneficiaries) {
        localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(data.stock));
        localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(data.beneficiaries));
        if (data.donations) localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(data.donations));
        if (data.deliveries) localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(data.deliveries));
        if (data.basketRecipe) localStorage.setItem(STORAGE_KEYS.BASKET_RECIPE, JSON.stringify(data.basketRecipe));
        if (data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Erro ao importar dados", e);
      return false;
    }
  }
}

// Instância global do Store
window.appStore = new AppStore();
