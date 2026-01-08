export default class BudgetManager {
  constructor({ initialYen = 1000, exchangeRate = 0.1 } = {}) {
    this.yenBalance = initialYen;
    this.credits = 0;
    this.exchangeRate = exchangeRate;
  }

  getState() {
    return {
      yen: this.yenBalance,
      credits: this.credits,
    };
  }

  getYen() {
    return this.yenBalance;
  }

  getCredits() {
    return this.credits;
  }

  hasCredits() {
    return this.credits > 0;
  }

  placeBet(yenAmount) {
    if (yenAmount <= 0) {
      return { success: false, message: "無効な賭け金です" };
    }

    if (yenAmount > this.yenBalance) {
      return { success: false, message: "円の残高が不足しています" };
    }

    const credits = Math.max(1, Math.floor(yenAmount * this.exchangeRate));
    this.yenBalance -= yenAmount;
    this.credits += credits;

    return {
      success: true,
      creditsAdded: credits,
      credits: this.credits,
      yenRemaining: this.yenBalance,
    };
  }

  deductCredit() {
    if (this.credits <= 0) {
      return false;
    }
    this.credits = Math.max(0, this.credits - 1);
    return true;
  }

  addCredits(amount) {
    if (amount <= 0) {
      return;
    }
    this.credits += amount;
  }
}
