import { useState, useMemo, useRef } from 'react';
import { CARDS } from '../data/cards';
import { aiService } from '../services/aiService';

export default function Recommendation() {
  const [opponentDeck, setOpponentDeck] = useState<typeof CARDS>([]);
  const [recommendedDeck, setRecommendedDeck] = useState<typeof CARDS>([]);
  
  const [isModifying, setIsModifying] = useState(false);
  const [tempDeck, setTempDeck] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const filteredCards = useMemo(() => {
    return CARDS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const tempDeckList = useMemo(() => {
    return Array.from(tempDeck)
      .map(id => CARDS.find(c => c.id === id))
      .filter(Boolean) as typeof CARDS;
  }, [tempDeck]);

  const handleModifyClick = () => {
    setTempDeck(new Set(opponentDeck.map(c => c.id)));
    setIsModifying(true);
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
    setOpponentDeck(tempDeckList);
    setIsModifying(false);
    setRecommendedDeck([]); // Reset recommendation when deck changes
  };

  const handleGenerate = async () => {
    if (opponentDeck.length !== 8) return;
    setIsGenerating(true);
    
    try {
      const deck = await aiService.generateRecommendation(opponentDeck);
      setRecommendedDeck(deck);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Failed to generate recommendation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isModifying) {
    return (
      <main className="flex-1 px-4 lg:px-10 py-24 overflow-y-auto h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                Modify Opponent's Deck
              </h1>
              <p className="text-zinc-400 mt-2">Select exactly 8 cards for the opponent's deck.</p>
            </div>
            <button 
              onClick={() => setIsModifying(false)}
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

  return (
    <main className="flex-1 px-4 lg:px-20 py-24 overflow-y-auto h-screen custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">Deck Recommendations</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">Input the deck of the opponent and upon hitting generate recommendation the AI will predict the most effective winning deck against the inputted deck.</p>
        </div>

        <div className="space-y-8">
          {/* Opponent's Deck */}
          <div className="glassmorphism p-6 rounded-xl border-l-4 border-red-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">swords</span>
                Opponent's Deck
              </h3>
              <button 
                onClick={handleModifyClick}
                className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Modify Deck
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {opponentDeck.map((card, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="aspect-[3/4] w-full rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center overflow-hidden relative shadow-lg">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${card.image}')` }}></div>
                    <div className="absolute bottom-1 right-1 bg-zinc-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-400 border border-red-500/20">{card.elixir}</div>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                </div>
              ))}
              {Array.from({ length: 8 - opponentDeck.length }).map((_, i) => (
                <div key={`empty-opp-${i}`} className="flex flex-col items-center gap-1.5">
                  <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/30">
                    <span className="material-symbols-outlined text-zinc-600">add</span>
                  </div>
                  <span className="text-[10px] text-transparent">Empty</span>
                </div>
              ))}
            </div>
            
            {opponentDeck.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => { setOpponentDeck([]); setRecommendedDeck([]); }}
                  className="text-xs font-bold text-zinc-400 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Clear Deck
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center py-4">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || opponentDeck.length !== 8}
              className={`w-full max-w-md py-5 rounded-full font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3
                ${isGenerating || opponentDeck.length !== 8
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-primary text-zinc-900 gold-glow hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Recommendation
                </>
              )}
            </button>
          </div>
          
          {(opponentDeck.length !== 8) && (
            <p className="text-center text-red-400 text-xs -mt-6 font-medium">
              You must select exactly 8 cards for the opponent's deck.
            </p>
          )}

          {/* Recommended Deck */}
          {recommendedDeck.length > 0 && !isGenerating && (
            <section ref={resultsRef} className="glassmorphism p-6 rounded-xl border-l-4 border-primary animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  Recommended Counter Deck
                </h3>
                <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Hard Counter</span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {recommendedDeck.map((card, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center overflow-hidden relative shadow-lg hover:scale-105 transition-transform cursor-pointer">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${card.image}')` }}></div>
                      <div className="absolute bottom-1 right-1 bg-zinc-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20">{card.elixir}</div>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-black/20 p-5 rounded-xl border border-white/5">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lightbulb</span>
                  Why this works
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  This deck is specifically designed to counter the opponent's win conditions while maintaining a strong elixir advantage. The defensive core neutralizes their main pushes, allowing you to counter-attack effectively.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
