import { useState, useMemo } from 'react';
import { CARDS } from '../data/cards';
import { aiService } from '../services/aiService';

export default function WinPredictor() {
  const [playerADeck, setPlayerADeck] = useState<typeof CARDS>([]);
  const [playerBDeck, setPlayerBDeck] = useState<typeof CARDS>([]);
  
  const [modifyingDeck, setModifyingDeck] = useState<'A' | 'B' | null>(null);
  const [tempDeck, setTempDeck] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const filteredCards = useMemo(() => {
    return CARDS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const tempDeckList = useMemo(() => {
    return Array.from(tempDeck)
      .map(id => CARDS.find(c => c.id === id))
      .filter(Boolean) as typeof CARDS;
  }, [tempDeck]);

  const handleModifyClick = (player: 'A' | 'B') => {
    const currentDeck = player === 'A' ? playerADeck : playerBDeck;
    setTempDeck(new Set(currentDeck.map(c => c.id)));
    setModifyingDeck(player);
    setSearchQuery('');
  };

  const toggleCard = (id: number) => {
    const newSet = new Set(tempDeck);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size < 8) {
        newSet.add(id);
      }
    }
    setTempDeck(newSet);
  };

  const handleSaveDeck = () => {
    if (tempDeck.size !== 8) return;
    
    if (modifyingDeck === 'A') {
      setPlayerADeck(tempDeckList);
    } else if (modifyingDeck === 'B') {
      setPlayerBDeck(tempDeckList);
    }
    setModifyingDeck(null);
    setPrediction(null); // Reset prediction when decks change
  };

  const handlePredict = async () => {
    if (playerADeck.length !== 8 || playerBDeck.length !== 8) return;
    setIsPredicting(true);
    
    try {
      const winChance = await aiService.predictWinChance(playerADeck, playerBDeck);
      setPrediction(winChance);
    } catch (error) {
      console.error("Failed to predict win chance:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  if (modifyingDeck) {
    return (
      <main className="flex-1 px-4 lg:px-10 py-24 overflow-y-auto h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                Modify Player {modifyingDeck} Deck
              </h1>
              <p className="text-zinc-400 mt-2">Select exactly 8 cards for this deck.</p>
            </div>
            <button 
              onClick={() => setModifyingDeck(null)}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Card Library */}
            <section className="flex-1 glassmorphism p-6 rounded-xl flex flex-col h-[700px] border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-primary">style</span>
                  Card Library
                </h2>
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -tranzinc-y-1/2 text-zinc-400">search</span>
                  <input 
                    type="text" 
                    placeholder="Search cards..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white placeholder:text-zinc-500 transition-all shadow-inner" 
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {filteredCards.map((card) => {
                    const isSelected = tempDeck.has(card.id);
                    const isMaxed = !isSelected && tempDeck.size >= 8;
                    return (
                      <div key={card.id} className="flex flex-col items-center gap-1.5">
                        <div 
                          onClick={() => !isMaxed && toggleCard(card.id)}
                          className={`group relative aspect-[3/4] w-full bg-zinc-800 rounded-lg overflow-hidden transition-all shadow-lg 
                            ${isSelected ? 'ring-2 ring-primary shadow-primary/20 scale-95 opacity-50 cursor-pointer' : 
                              isMaxed ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:ring-2 hover:ring-zinc-500 hover:scale-105 cursor-pointer'}`}
                        >
                          <img className="w-full h-full object-cover" src={card.image} alt={card.name} />
                          <div className="absolute bottom-1 right-1 bg-zinc-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20">{card.elixir}</div>
                          
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                              <span className="material-symbols-outlined text-white drop-shadow-md text-3xl">check_circle</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Selected Deck */}
            <aside className="w-full lg:w-96 glassmorphism p-6 rounded-xl flex flex-col h-[700px] border border-white/10 shadow-2xl shrink-0">
              <div className="mb-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  Selected Deck
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                  {tempDeckList.map(card => (
                    <div key={card.id} className="flex flex-col items-center gap-1.5">
                      <div 
                        onClick={() => toggleCard(card.id)} 
                        className="group relative aspect-[3/4] w-full cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-lg shadow-lg border border-white/10" />
                        <div className="absolute top-1 right-1 bg-red-500/90 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <span className="material-symbols-outlined text-[14px] text-white">close</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 8 - tempDeckList.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
                      <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/30">
                        <span className="material-symbols-outlined text-zinc-600">add</span>
                      </div>
                      <span className="text-[10px] text-transparent">Empty</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-400 font-bold uppercase text-sm tracking-wider">Cards</span>
                  <span className={`font-black text-lg ${tempDeck.size === 8 ? 'text-red-400' : 'text-primary'}`}>
                    {tempDeck.size} / 8
                  </span>
                </div>
                <button 
                  onClick={handleSaveDeck} 
                  disabled={tempDeck.size !== 8}
                  className={`w-full flex items-center justify-center gap-3 font-black text-lg py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg ${
                    tempDeck.size !== 8 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                      : 'bg-primary text-zinc-900 gold-glow hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span className="material-symbols-outlined">check</span>
                  Done
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  const displayPrediction = prediction ?? 50; // Default to 50 for the visual before prediction
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayPrediction / 100) * circumference;

  return (
    <main className="flex-1 px-4 lg:px-20 py-24 overflow-y-auto h-screen custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">Win Predictor</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">Select your deck and your opponent's deck to predict the outcome of the match based on current meta statistics and card interactions.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            {/* Player A Deck */}
            <div className="glassmorphism p-6 rounded-xl border-l-4 border-primary">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  Player A (Your Deck)
                </h3>
                <button 
                  onClick={() => handleModifyClick('A')}
                  className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Modify Deck
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {playerADeck.map((card, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center overflow-hidden relative shadow-lg">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${card.image}')` }}></div>
                      <div className="absolute bottom-1 right-1 bg-zinc-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20">{card.elixir}</div>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                  </div>
                ))}
                {Array.from({ length: 8 - playerADeck.length }).map((_, i) => (
                  <div key={`empty-a-${i}`} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/30">
                      <span className="material-symbols-outlined text-zinc-600">add</span>
                    </div>
                    <span className="text-[10px] text-transparent">Empty</span>
                  </div>
                ))}
              </div>
              {playerADeck.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => { setPlayerADeck([]); setPrediction(null); }}
                    className="text-xs font-bold text-zinc-400 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Clear Deck
                  </button>
                </div>
              )}
            </div>

            {/* Player B Deck */}
            <div className="glassmorphism p-6 rounded-xl border-l-4 border-purple-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">swords</span>
                  Player B (Opponent)
                </h3>
                <button 
                  onClick={() => handleModifyClick('B')}
                  className="text-xs font-bold text-purple-500 uppercase tracking-widest bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Modify Deck
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {playerBDeck.map((card, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center overflow-hidden relative shadow-lg">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${card.image}')` }}></div>
                      <div className="absolute bottom-1 right-1 bg-zinc-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-400 border border-purple-500/20">{card.elixir}</div>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                  </div>
                ))}
                {Array.from({ length: 8 - playerBDeck.length }).map((_, i) => (
                  <div key={`empty-b-${i}`} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/30">
                      <span className="material-symbols-outlined text-zinc-600">add</span>
                    </div>
                    <span className="text-[10px] text-transparent">Empty</span>
                  </div>
                ))}
              </div>
              {playerBDeck.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => { setPlayerBDeck([]); setPrediction(null); }}
                    className="text-xs font-bold text-zinc-400 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Clear Deck
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Prediction Results */}
          <div className="sticky top-24 space-y-6">
            <div className={`glassmorphism p-10 rounded-xl flex flex-col items-center text-center space-y-8 transition-all duration-500 ${prediction !== null ? 'gold-glow' : 'border border-white/10'}`}>
              <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-widest">Prediction Result</h2>
              
              <div className="relative size-64 flex items-center justify-center">
                <svg className="size-full" viewBox="0 0 100 100">
                  <circle className="text-zinc-800" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    cx="50" 
                    cy="50" 
                    fill="none" 
                    r="45" 
                    stroke="url(#goldGradient)" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={prediction !== null ? strokeDashoffset : circumference} 
                    strokeLinecap="round" 
                    strokeWidth="8" 
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-out"
                  ></circle>
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#f7c326"></stop>
                      <stop offset="100%" stopColor="#b48608"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {prediction !== null ? (
                    <>
                      <span className="text-6xl font-black text-primary">{prediction}%</span>
                      <span className="text-zinc-400 font-bold uppercase text-xs tracking-tighter">Win Chance</span>
                    </>
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase text-sm tracking-widest px-8">Awaiting Prediction</span>
                  )}
                </div>
              </div>

              {prediction !== null && (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-primary uppercase">Player A Win Rate</span>
                    <span className="text-purple-500 uppercase">Player B Win Rate</span>
                  </div>
                  <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-primary to-yellow-600 transition-all duration-1000 ease-out" style={{ width: `${prediction}%` }}></div>
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-800 transition-all duration-1000 ease-out" style={{ width: `${100 - prediction}%` }}></div>
                  </div>
                </div>
              )}

              <button 
                onClick={handlePredict}
                disabled={isPredicting || playerADeck.length !== 8 || playerBDeck.length !== 8}
                className={`w-full py-5 rounded-full font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3
                  ${isPredicting || playerADeck.length !== 8 || playerBDeck.length !== 8
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-primary text-zinc-900 gold-glow hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isPredicting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Calculating...
                  </>
                ) : (
                  'Predict Outcome'
                )}
              </button>
              
              {(playerADeck.length !== 8 || playerBDeck.length !== 8) && (
                <p className="text-center text-red-400 text-xs mt-2 font-medium">
                  Both decks must have exactly 8 cards to predict the outcome.
                </p>
              )}

              {prediction !== null && (
                <div className="flex gap-4 w-full animate-in fade-in duration-500">
                  <div className="flex-1 glassmorphism p-4 rounded-xl bg-black/20">
                    <span className="block text-zinc-500 text-xs font-bold uppercase mb-1">Confidence</span>
                    <span className="text-xl font-bold text-zinc-100">High</span>
                  </div>
                  <div className="flex-1 glassmorphism p-4 rounded-xl bg-black/20">
                    <span className="block text-zinc-500 text-xs font-bold uppercase mb-1">Data Source</span>
                    <span className="text-xl font-bold text-zinc-100">API V2</span>
                  </div>
                </div>
              )}
            </div>

            {prediction !== null && (
              <div className="glassmorphism p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h4 className="text-zinc-100 font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Key Matchup Factors
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">check_circle</span>
                    <span>Player A has a faster cycle, allowing more frequent win condition pushes.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">check_circle</span>
                    <span>Player B lacks a heavy spell to finish towers in overtime.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">warning</span>
                    <span>Player A's defense is susceptible to heavy beatdown pushes if elixir is mismanaged.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
