import os
import json
import joblib

DATA_PATH = r"..\cards.json"
MODEL_PATH = os.path.join("models", "deck_builder", "model.joblib")

def train_deck_builder():
    if not os.path.exists(os.path.dirname(MODEL_PATH)):
        os.makedirs(os.path.dirname(MODEL_PATH))
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        cards_data = json.load(f)
        
    print(f"Loaded {len(cards_data)} cards from JSON.")
    
    # Pre-process the cards for our heuristic model
    card_catalog = {}
    for card in cards_data:
        card_id = int(card["id"])
        elixir = card.get("elixir", 3)
        ctype = card.get("type", "Troop")
        
        # Super simplified heuristic types
        roles = []
        if ctype == "Spell":
            roles.append("spell")
        if ctype == "Building":
            roles.append("building")
        if ctype == "Troop":
            if elixir >= 5:
                roles.append("tank")
            else:
                roles.append("support")
                
        # Basic heuristic features for deck building
        card_catalog[card_id] = {
            "name": card["name"],
            "elixir": elixir,
            "roles": roles,
            "type": ctype
        }
    
    payload = {
        "catalog": card_catalog
    }
    
    joblib.dump(payload, MODEL_PATH)
    print(f"Saved Deck Builder 'model' to {MODEL_PATH}")

if __name__ == "__main__":
    train_deck_builder()
