import { useState, useMemo, useRef } from 'react';
import { CARDS } from '../data/cards';
import { aiService } from '../services/aiService';

export default function Builder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [generatedDeck, setGeneratedDeck] = useState<typeof CARDS>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const filteredCards = useMemo(() => {
    return CARDS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const selectedCardsList = useMemo(() => {
    return Array.from(selectedCards)
      .map(id => CARDS.find(c => c.id === id))
      .filter(Boolean) as typeof CARDS;
  }, [selectedCards]);

  const toggleCard = (id: number) => {
    const newSet = new Set(selectedCards);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCards(newSet);
  };

  const handleAnalyze = async () => {
    if (selectedCards.size < 9) return;
    
    setIsAnalyzing(true);
    
    try {
      const deck = await aiService.generateDeck(selectedCardsList);
      setGeneratedDeck(deck);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Failed to generate deck:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex-1 px-4 lg:px-10 py-24 overflow-y-auto h-screen custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header & Instructions */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">AI Deck Builder</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">Select the cards you own or want to build around. Our AI will analyze your selection and generate the most optimal 8-card deck for the current meta.</p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Card Library */}
          <section className="flex-1 glassmorphism p-6 rounded-xl flex flex-col h-[700px] border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-primary">style</span>
                  Card Library
                </h2>
              </div>
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
                  const isSelected = selectedCards.has(card.id);
                  return (
                    <div key={card.id} className="flex flex-col items-center gap-1.5">
                      <div 
                        onClick={() => toggleCard(card.id)}
                        className={`group relative aspect-[3/4] w-full bg-zinc-800 rounded-lg overflow-hidden cursor-pointer transition-all shadow-lg ${isSelected ? 'ring-2 ring-primary shadow-primary/20 scale-95 opacity-50' : 'hover:ring-2 hover:ring-zinc-500 hover:scale-105'}`}
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
                {filteredCards.length === 0 && (
                  <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                    <p>No cards found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Selected Cards & Action */}
          <aside className="w-full lg:w-96 glassmorphism p-6 rounded-xl flex flex-col h-[700px] border border-white/10 shadow-2xl shrink-0">
            <div className="mb-4 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                Your Collection
              </h2>
              <p className="text-sm text-zinc-400 mt-2">Select at least 9 cards to let the AI build the best 8-card deck for you.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
              {selectedCardsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl opacity-20">touch_app</span>
                  <p className="text-sm">Click cards in the library to add them to your collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                  {selectedCardsList.map(card => (
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
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400 font-bold uppercase text-sm tracking-wider">Selected Cards</span>
                <span className={`font-black text-lg ${selectedCards.size >= 9 ? 'text-red-400' : 'text-primary'}`}>
                  {selectedCards.size} / 9+
                </span>
              </div>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || selectedCards.size < 9}
                className={`w-full flex items-center justify-center gap-3 font-black text-lg py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg ${
                  isAnalyzing || selectedCards.size < 9 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                    : 'bg-primary text-zinc-900 gold-glow hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">psychology</span>
                    Build Deck
                  </>
                )}
              </button>
              {selectedCards.size > 0 && selectedCards.size < 9 && (
                <p className="text-center text-red-400 text-xs mt-3 font-medium">
                  Select {9 - selectedCards.size} more card{9 - selectedCards.size !== 1 ? 's' : ''} to analyze
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* Generated Deck Section */}
        {generatedDeck.length > 0 && !isAnalyzing && (
          <section ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-bold text-white">Generated Deck</h2>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-primary/20">Optimal Synergy</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card-dark p-4 rounded-xl border border-zinc-700/50 shadow-sm">
                    <p className="text-xs text-zinc-400 uppercase font-semibold">Avg. Elixir</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {(generatedDeck.reduce((acc, card) => acc + card.elixir, 0) / 8).toFixed(1)}
                      </span>
                      <span className="text-xs text-red-400">Balanced</span>
                    </div>
                  </div>
                  
                  <div className="bg-card-dark p-4 rounded-xl border border-zinc-700/50 shadow-sm">
                    <p className="text-xs text-zinc-400 uppercase font-semibold">Offense</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-zinc-300">82%</p>
                  </div>
                  
                  <div className="bg-card-dark p-4 rounded-xl border border-zinc-700/50 shadow-sm">
                    <p className="text-xs text-zinc-400 uppercase font-semibold">Defense</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '76%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-zinc-300">76%</p>
                  </div>
                  
                  <div className="bg-card-dark p-4 rounded-xl border border-zinc-700/50 shadow-sm">
                    <p className="text-xs text-zinc-400 uppercase font-semibold">Versatility</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-zinc-300">88%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 lg:gap-4">
              {generatedDeck.map((card, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="card-slot rounded-xl overflow-hidden relative group card-active aspect-[3/4] w-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-pointer">
                    <img className="w-full h-full object-cover" src={card.image} alt={card.name} />
                    <div className="absolute top-1 left-1 bg-zinc-900/90 rounded-full w-6 h-6 flex items-center justify-center font-bold text-primary text-xs border border-primary/30">{card.elixir}</div>
                  </div>
                  <span className="text-xs text-zinc-300 font-medium text-center truncate w-full px-1">{card.name}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                <h3 className="text-xl font-bold text-white">AI Deck Analysis</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-red-400 text-2xl">check_circle</span>
                  <div>
                    <p className="font-bold text-white mb-1">Strong Synergy</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">The selected cards form a highly cohesive core. The AI prioritized cards that complement your initial choices, creating strong offensive pushes and solid defensive rotations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">shield</span>
                  <div>
                    <p className="font-bold text-white mb-1">Balanced Defense</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">This deck includes reliable answers to both swarm units and heavy tanks, ensuring you aren't caught off-guard by unexpected meta decks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                  <div>
                    <p className="font-bold text-white mb-1">Win Condition</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">Focus on cycling your primary win condition while maintaining an elixir advantage. Use your defensive units to counter-push effectively.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">trending_up</span>
                  <div>
                    <p className="font-bold text-white mb-1">Meta Viability</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">This archetype is currently performing well in the top ladder. It has favorable matchups against popular beatdown and control decks.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
