from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import joblib
import numpy as np
import os

app = FastAPI(title="Clash Royale AI Backend")

# We will load the models lazily or on startup
class AI_Models:
    win_model = None
    win_card_to_idx = None
    win_num_cards = None
    
    rec_model = None
    rec_X_train = None
    rec_Y_train = None
    rec_card_to_idx = None
    rec_num_cards = None
    
    bld_catalog = None

WIN_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "win_predictor", "model.joblib")
REC_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "deck_recommender", "model.joblib")
BLD_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "deck_builder", "model.joblib")

@app.on_event("startup")
def load_models():
    """Load machine learning models into memory on server start."""
    try:
        if os.path.exists(WIN_MODEL_PATH):
            print(f"Loading Win Predictor from {WIN_MODEL_PATH}...")
            payload = joblib.load(WIN_MODEL_PATH)
            AI_Models.win_model = payload["model"]
            AI_Models.win_card_to_idx = payload["card_to_idx"]
            AI_Models.win_num_cards = payload["num_cards"]
        else:
            print("Win Predictor model not found.")
            
        if os.path.exists(REC_MODEL_PATH):
            print(f"Loading Deck Recommender from {REC_MODEL_PATH}...")
            payload = joblib.load(REC_MODEL_PATH)
            AI_Models.rec_model = payload["model"]
            AI_Models.rec_X_train = payload["X_train"]
            AI_Models.rec_Y_train = payload["Y_train"]
            AI_Models.rec_card_to_idx = payload["card_to_idx"]
            AI_Models.rec_num_cards = payload["num_cards"]
        else:
            print("Deck Recommender model not found.")
            
        if os.path.exists(BLD_MODEL_PATH):
            print(f"Loading Deck Builder from {BLD_MODEL_PATH}...")
            payload = joblib.load(BLD_MODEL_PATH)
            AI_Models.bld_catalog = payload["catalog"]
        else:
            print("Deck Builder catalog not found.")
            
    except Exception as e:
        print(f"Error loading models: {e}")

# --- Pydantic Schemas ---

class WinPredictorInput(BaseModel):
    user_deck: List[int] = Field(..., min_length=8, max_length=8)
    enemy_deck: List[int] = Field(..., min_length=8, max_length=8)

class DeckRecommenderInput(BaseModel):
    enemy_deck: List[int] = Field(..., min_length=8, max_length=8)

class DeckBuilderInput(BaseModel):
    user_cards: List[int]

# --- Endpoints ---

@app.post("/predict-win")
def predict_win(data: WinPredictorInput):
    """Predicts user win probability vs enemy deck."""
    if not AI_Models.win_model:
        raise HTTPException(status_code=503, detail="Model not loaded or trained yet.")
        
    num_cards = AI_Models.win_num_cards
    card_to_idx = AI_Models.win_card_to_idx
    
    user_vec = np.zeros(num_cards)
    for c in data.user_deck:
        if c in card_to_idx:
            user_vec[card_to_idx[c]] = 1
            
    enemy_vec = np.zeros(num_cards)
    for c in data.enemy_deck:
        if c in card_to_idx:
            enemy_vec[card_to_idx[c]] = 1
            
    # Model expects [user_deck, enemy_deck]
    X = np.concatenate([user_vec, enemy_vec]).reshape(1, -1)
    
    # Probability of class 1 (win)
    win_probability = AI_Models.win_model.predict_proba(X)[0][1]
    
    return {"win_probability": round(float(win_probability), 2)}

@app.post("/recommend-deck")
def recommend_deck(data: DeckRecommenderInput):
    """Returns top 2 winning deck variations vs enemy deck."""
    if not AI_Models.rec_model:
        raise HTTPException(status_code=503, detail="Model not loaded or trained yet.")
        
    num_cards = AI_Models.rec_num_cards
    card_to_idx = AI_Models.rec_card_to_idx
    
    enemy_vec = np.zeros(num_cards)
    for c in data.enemy_deck:
        if c in card_to_idx:
            enemy_vec[card_to_idx[c]] = 1
            
    enemy_vec = enemy_vec.reshape(1, -1)
    
    try:
        # 1. Find the historically closest "enemy decks"
        distances, indices = AI_Models.rec_model.kneighbors(enemy_vec)
        
        # 2. Get the corresponding winning deck for those indices
        recommended_decks = []
        seen = set()
        
        for idx_group in indices:
            for i in idx_group:
                deck = AI_Models.rec_Y_train[i]
                if deck not in seen:
                    seen.add(deck)
                    # Assign abstract 'win rate' proxy as a placeholder, descending
                    win_prob = 0.65 - (len(seen) * 0.05) if len(seen) < 5 else 0.50
                    recommended_decks.append({
                        "deck": [int(c) for c in deck],
                        "win_probability": round(win_prob, 2)
                    })
                    
                    if len(recommended_decks) >= 2:
                        break
            if len(recommended_decks) >= 2:
                break
                
        # For safety, if API didn't fetch any
        if not recommended_decks:
            raise HTTPException(status_code=404, detail="No similar enemy matchups found.")
            
        return {"recommended_decks": recommended_decks}
    except Exception as e:
        import traceback
        return {"error": traceback.format_exc()}

@app.post("/build-deck")
def build_deck(data: DeckBuilderInput):
    """Builds a synergistic deck locally based on user inventory."""
    if not AI_Models.bld_catalog:
        raise HTTPException(status_code=503, detail="Model not loaded or trained yet.")
        
    if len(data.user_cards) < 8:
        raise HTTPException(status_code=400, detail="User must have at least 8 cards.")
        
    catalog = AI_Models.bld_catalog
    
    # Strategy: Build an 8 card deck taking optimal combination to hit elixir & types.
    best_deck = []
    
    spells = []
    tanks = []
    supports = []
    buildings = []
    others = []
    
    # Categorize user cards
    for cid in data.user_cards:
        if cid in catalog:
            roles = catalog[cid]["roles"]
            if "spell" in roles: spells.append(cid)
            elif "tank" in roles: tanks.append(cid)
            elif "support" in roles: supports.append(cid)
            elif "building" in roles: buildings.append(cid)
            else: others.append(cid)
            
    # Super greedy heuristic: 
    # Try 1 tank, 1 building, 2 spells, 4 supports. 
    # Fallback to whatever remaining up to 8 cards
    if tanks: best_deck.append(tanks.pop(0))
    if buildings: best_deck.append(buildings.pop(0))
    for _ in range(2): 
        if spells: best_deck.append(spells.pop(0))
    for _ in range(4): 
        if supports: best_deck.append(supports.pop(0))
        
    # Fill remaining blindly if heuristic is starved
    pool = tanks + buildings + spells + supports + others + data.user_cards
    
    for cid in pool:
        if len(best_deck) == 8:
            break
        if cid not in best_deck and cid in catalog:
            best_deck.append(cid)
            
    return {"best_deck": best_deck}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
