/**
 * Budget Manager - Gère la balance (Yens), les mises et les gains
 * Système de multiplicateurs : 100→x1, 200→x2, 1000→x10, 2000→x20
 */
export default class BudgetManager {
  constructor({ initialBalance = 1000 } = {}) {
    this.balance = initialBalance; // Balance en Yens
    this.balanceMax = initialBalance; // Balance maximum atteinte dans le cycle
    this.currentBet = 0; // Mise actuelle
    this.currentMultiplier = 1; // Multiplicateur actuel
  }

  /**
   * Définir les multiplicateurs selon la mise
   */
  static MULTIPLIERS = {
    100: 1,
    200: 2,
    1000: 10,
    2000: 20
  };

  /**
   * Récupérer l'état actuel
   */
  getState() {
    return {
      balance: this.balance,
      balanceMax: this.balanceMax,
      currentBet: this.currentBet,
      currentMultiplier: this.currentMultiplier
    };
  }

  /**
   * Obtenir la balance
   */
  getBalance() {
    return this.balance;
  }

  /**
   * Obtenir la balance max du cycle
   */
  getBalanceMax() {
    return this.balanceMax;
  }

  /**
   * Obtenir le multiplicateur actuel
   */
  getMultiplier() {
    return this.currentMultiplier;
  }

  /**
   * Obtenir la mise actuelle
   */
  getCurrentBet() {
    return this.currentBet;
  }

  /**
   * Placer une mise et obtenir le multiplicateur
   * @param {number} betAmount - Montant de la mise (100, 200, 1000, 2000)
   * @returns {Object} Résultat de la mise
   */
  placeBet(betAmount) {
    if (![100, 200, 1000, 2000].includes(betAmount)) {
      return {
        success: false,
        errorKey: "betting.invalidBet"
      };
    }

    if (betAmount > this.balance) {
      return {
        success: false,
        errorKey: "betting.insufficientBalance"
      };
    }

    // Déduire la mise
    this.balance -= betAmount;
    this.currentBet = betAmount;
    this.currentMultiplier = BudgetManager.MULTIPLIERS[betAmount];

    return {
      success: true,
      bet: this.currentBet,
      multiplier: this.currentMultiplier,
      remainingBalance: this.balance
    };
  }

  /**
   * Ajouter les gains en fin de partie (cash out ou game over)
   * @param {number} score - Score de la partie
   * @returns {Object} Résultat avec nouvelle balance
   */
  addWinnings(score) {
    const winnings = Number(score); // Score already has multiplier applied
    this.balance = Number(this.balance) + winnings;

    // Mettre à jour balance max si dépassée
    if (this.balance > this.balanceMax) {
      this.balanceMax = this.balance;
    }

    return {
      winnings,
      newBalance: this.balance,
      balanceMax: this.balanceMax,
      isNewRecord: this.balance === this.balanceMax
    };
  }

  /**
   * Vérifier si la balance permet de continuer (>= 100)
   */
  canContinue() {
    return this.balance >= 100;
  }

  /**
   * Reset pour un nouveau cycle (balance à 1000)
   */
  resetCycle() {
    this.balance = 1000;
    this.balanceMax = 1000;
    this.currentBet = 0;
    this.currentMultiplier = 1;
  }

  /**
   * Reset la mise actuelle (pour nouvelle partie dans le même cycle)
   */
  resetBet() {
    this.currentBet = 0;
    this.currentMultiplier = 1;
  }

  /**
   * Deduct a specific amount from balance (for malus reroll cost)
   * @param {number} amount - Amount to deduct
   * @returns {Object} Result with success status and remaining balance
   */
  deductAmount(amount) {
    if (amount > this.balance) {
      return {
        success: false,
        errorKey: "malus.insufficientReroll"
      };
    }

    this.balance -= amount;
    return {
      success: true,
      deducted: amount,
      remainingBalance: this.balance
    };
  }
}
