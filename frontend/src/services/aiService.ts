import { CARDS } from '../data/cards';

/**
 * Service for handling AI-related features.
 * Separating these into a module makes it easier to swap out the implementation
 * (e.g., replacing simulated logic with real API calls) later.
 */

export const aiService = {
  /**
   * Generates an optimal 8-card deck based on the user's selected cards.
   */
  async generateDeck(selectedCardsList: typeof CARDS): Promise<typeof CARDS> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pool = [...selectedCardsList];
        // Pick 8 best cards from their pool (simulated by random for now)
        const deck = pool.sort(() => 0.5 - Math.random()).slice(0, 8);
        resolve(deck);
      }, 2000);
    });
  },

  /**
   * Predicts the win chance of Player A against Player B.
   * Returns a percentage between 0 and 100.
   */
  async predictWinChance(playerADeck: typeof CARDS, playerBDeck: typeof CARDS): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a random win percentage between 35 and 85
        const winChance = Math.floor(Math.random() * 50) + 35;
        resolve(winChance);
      }, 1500);
    });
  },

  /**
   * Generates a recommended counter deck against the opponent's deck.
   */
  async generateRecommendation(opponentDeck: typeof CARDS): Promise<typeof CARDS> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Pick 8 random cards for the recommended deck that are not in the opponent's deck
        const pool = [...CARDS].filter(c => !opponentDeck.find(oc => oc.id === c.id));
        const deck = pool.sort(() => 0.5 - Math.random()).slice(0, 8);
        resolve(deck);
      }, 2000);
    });
  }
};
