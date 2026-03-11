import { Page } from '../App';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
}

export default function Home({ setCurrentPage }: HomeProps) {
  return (
    <main className="flex-grow pt-32 pb-20 relative">
      <div className="absolute inset-0 hero-pattern pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent-blue/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Live Arena Analysis Active</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 max-w-4xl italic uppercase">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">Arena</span> with AI
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 font-medium">
            Unleash the power of neural networks to predict match outcomes, optimize your deck synergy, and climb the path to Ultimate Champion.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div 
            onClick={() => setCurrentPage('predictor')}
            className="glass p-8 rounded-[2rem] border-white/5 group hover:border-primary/50 transition-all hover:-tranzinc-y-2 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="mb-6 bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">trending_up</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">Deck Win Predictor</h3>
            <p className="text-zinc-400 font-medium leading-relaxed mb-6">
              Upload your deck and opponent matchups to calculate your victory probability based on 10M+ analyzed matches.
            </p>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-tighter group-hover:gap-4 transition-all">
              Analyze Now <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('recommendation')}
            className="glass p-8 rounded-[2rem] border-primary/30 bg-primary/5 group hover:border-primary transition-all hover:-tranzinc-y-2 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="mb-6 bg-primary w-16 h-16 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-4xl">psychology</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">Recommendation AI</h3>
            <p className="text-zinc-400 font-medium leading-relaxed mb-6">
              Get personalized card suggestions to counter the current meta. Our AI evolves with every balance change.
            </p>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-tighter group-hover:gap-4 transition-all">
              Find Counters <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('builder')}
            className="glass p-8 rounded-[2rem] border-white/5 group hover:border-primary/50 transition-all hover:-tranzinc-y-2 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="mb-6 bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">auto_fix_high</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">Deck Builder AI</h3>
            <p className="text-zinc-400 font-medium leading-relaxed mb-6">
              Input your playstyle and core cards. The AI builds a balanced deck with optimal elixir average and synergy.
            </p>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-tighter group-hover:gap-4 transition-all">
              Build Deck <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-6 rounded-2xl text-center border-white/5">
            <p className="text-primary font-black text-3xl mb-1">10M+</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Decks Analyzed</p>
          </div>
          <div className="glass p-6 rounded-2xl text-center border-white/5">
            <p className="text-primary font-black text-3xl mb-1">500K+</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Daily Predictions</p>
          </div>
          <div className="glass p-6 rounded-2xl text-center border-white/5">
            <p className="text-primary font-black text-3xl mb-1">25K+</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Pro Players</p>
          </div>
          <div className="glass p-6 rounded-2xl text-center border-white/5">
            <p className="text-primary font-black text-3xl mb-1">98%</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">AI Accuracy</p>
          </div>
        </div>
      </section>
    </main>
  );
}
