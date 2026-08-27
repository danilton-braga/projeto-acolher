/**
 * Projeto Acolher - Motor FEFO (First Expire, First Out)
 * Implementação de Algoritmos Logísticos de Otimização de Estoque Social
 * Projeto Integrador II - UNIVESP
 */

const FefoEngine = {
  /**
   * Calcula o status FEFO com base na data de expiração
   * @param {string} expiryDateStr YYYY-MM-DD
   * @returns {Object} { status, label, badgeClass, daysRemaining, isUrgent }
   */
  getStatus(expiryDateStr) {
    if (!expiryDateStr) {
      return {
        status: 'unknown',
        label: 'Sem data',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        daysRemaining: 999,
        isUrgent: false
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDateStr + 'T00:00:00');
    const diffTime = expiry - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        status: 'expired',
        label: `Vencido há ${Math.abs(daysRemaining)} dias`,
        badgeClass: 'badge-fefo-expired font-bold',
        color: 'red',
        daysRemaining,
        isUrgent: true,
        canDistribute: false
      };
    } else if (daysRemaining <= 30) {
      return {
        status: 'critical',
        label: daysRemaining === 0 ? 'Vence Hoje!' : `Vence em ${daysRemaining} dias (Crítico)`,
        badgeClass: 'badge-fefo-critical font-bold',
        color: 'orange',
        daysRemaining,
        isUrgent: true,
        canDistribute: true
      };
    } else if (daysRemaining <= 90) {
      return {
        status: 'warning',
        label: `Vence em ${daysRemaining} dias`,
        badgeClass: 'badge-fefo-warning font-medium',
        color: 'yellow',
        daysRemaining,
        isUrgent: false,
        canDistribute: true
      };
    } else {
      return {
        status: 'safe',
        label: `Vence em ${daysRemaining} dias (Seguro)`,
        badgeClass: 'badge-fefo-safe font-medium',
        color: 'green',
        daysRemaining,
        isUrgent: false,
        canDistribute: true
      };
    }
  },

  /**
   * Ordena a lista de estoque estritamente pela prioridade FEFO (Primeiro a Vencer)
   * @param {Array} stockList 
   * @returns {Array} lista ordenada
   */
  sortStock(stockList) {
    return [...stockList].sort((a, b) => {
      // 1. Data de validade crescente (mais próximo primeiro)
      const dateA = new Date(a.expiryDate || '9999-12-31').getTime();
      const dateB = new Date(b.expiryDate || '9999-12-31').getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      // 2. Data de entrada como critério de desempate (FIFO dentro de mesma validade)
      const entryA = new Date(a.entryDate || '9999-12-31').getTime();
      const entryB = new Date(b.entryDate || '9999-12-31').getTime();
      return entryA - entryB;
    });
  },

  /**
   * Calcula a capacidade de montagem de cestas básicas completas a partir do estoque atual
   * @returns {Object} { maxBaskets, recipeDetails, bottlenecks, totalStockCount }
   */
  calculateBasketCapacity() {
    const recipe = window.appStore.getBasketRecipe();
    const stock = window.appStore.getStock();
    
    let maxBaskets = Infinity;
    const bottlenecks = [];
    const recipeDetails = [];

    recipe.forEach(item => {
      // Filtra lotes válidos (não vencidos e com quantidade > 0)
      const matchingLots = stock.filter(lot => 
        lot.name.toLowerCase().trim() === item.name.toLowerCase().trim() && 
        lot.quantity > 0 &&
        this.getStatus(lot.expiryDate).status !== 'expired'
      );

      const totalAvailable = matchingLots.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const possibleWithThisItem = Math.floor(totalAvailable / item.quantity);

      recipeDetails.push({
        ...item,
        available: totalAvailable,
        requiredPerBasket: item.quantity,
        possibleBaskets: possibleWithThisItem,
        matchingLotsCount: matchingLots.length
      });

      if (possibleWithThisItem < maxBaskets) {
        maxBaskets = possibleWithThisItem;
      }
    });

    if (maxBaskets === Infinity) maxBaskets = 0;

    // Identifica itens limitantes (gargalos)
    recipeDetails.forEach(detail => {
      if (detail.possibleBaskets === maxBaskets) {
        bottlenecks.push(detail.name);
      }
    });

    return {
      maxBaskets,
      recipeDetails,
      bottlenecks,
      canAssemble: maxBaskets > 0
    };
  },

  /**
   * Executa a montagem de cestas básicas consumindo os lotes rigorosamente na ordem FEFO
   * @param {number} basketCount Quantidade de cestas a montar/dar baixa
   * @param {string} destinationReason Motivo ou destinação
   * @returns {Object} { success, deductionManifest, error }
   */
  assembleBaskets(basketCount, destinationReason = 'Montagem de Cestas Básicas FEFO') {
    if (basketCount <= 0) {
      return { success: false, error: 'A quantidade de cestas deve ser maior que zero.' };
    }

    const capacity = this.calculateBasketCapacity();
    if (basketCount > capacity.maxBaskets) {
      return { 
        success: false, 
        error: `Estoque insuficiente. Capacidade máxima atual é de ${capacity.maxBaskets} cesta(s). Gargalo: ${capacity.bottlenecks.join(', ')}` 
      };
    }

    const recipe = window.appStore.getBasketRecipe();
    let currentStock = window.appStore.getStock();
    const deductionManifest = [];

    // Processa item por item da receita
    for (const recipeItem of recipe) {
      let needed = recipeItem.quantity * basketCount;

      // Obtém lotes correspondentes ordenados por FEFO (mais antigo a vencer primeiro)
      const matchingLots = currentStock
        .filter(lot => 
          lot.name.toLowerCase().trim() === recipeItem.name.toLowerCase().trim() &&
          lot.quantity > 0 &&
          this.getStatus(lot.expiryDate).status !== 'expired'
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      for (const lot of matchingLots) {
        if (needed <= 0) break;

        const deductFromThisLot = Math.min(lot.quantity, needed);
        lot.quantity -= deductFromThisLot;
        needed -= deductFromThisLot;

        deductionManifest.push({
          lotId: lot.id,
          itemName: lot.name,
          brand: lot.brand || '-',
          lotCode: lot.lot,
          quantityDeducted: deductFromThisLot,
          unit: lot.unit,
          expiryDate: lot.expiryDate,
          fefoStatus: this.getStatus(lot.expiryDate).label
        });
      }
    }

    // Salva o novo estoque (remove itens com quantidade 0 se desejado, ou mantém com 0)
    window.appStore.saveStock(currentStock);

    return {
      success: true,
      basketCount,
      deductionManifest,
      timestamp: new Date().toISOString(),
      destinationReason
    };
  }
};

window.FefoEngine = FefoEngine;
