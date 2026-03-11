import os
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib

DATA_DIR = r"..\archive\20220906-20221003\20220906-20221003"
MODEL_PATH = os.path.join("models", "deck_recommender", "model.joblib")

def load_data(max_files=1):
    all_X = []
    all_Y = []
    
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    for file in files[:max_files]:
        filepath = os.path.join(DATA_DIR, file)
        print(f"Loading {filepath}...")
        
        # Use dtype string to prevent mixed type errors, or numeric and coerce.
        # time, arena, p1, p1_tr, p1_cr, c1..c8, p2, p2_tr, p2_cr, c1..c8
        df = pd.read_csv(filepath, header=None, low_memory=False)
        
        # Drop rows where crowns are missing or not parsing to int
        df[4] = pd.to_numeric(df[4], errors='coerce')
        df[15] = pd.to_numeric(df[15], errors='coerce')
        df = df.dropna(subset=[4, 15])
        
        # P1 Wins
        p1_wins = df[df[4] > df[15]]
        all_X.append(p1_wins.iloc[:, 16:24].values) # Enemy deck (P2)
        all_Y.append(p1_wins.iloc[:, 5:13].values)  # Winning deck (P1)
        
        # P2 Wins
        p2_wins = df[df[15] > df[4]]
        all_X.append(p2_wins.iloc[:, 5:13].values)   # Enemy deck (P1)
        all_Y.append(p2_wins.iloc[:, 16:24].values)  # Winning deck (P2)
        
    # Stack and return
    return np.vstack(all_X), np.vstack(all_Y)

def train_deck_recommender():
    if not os.path.exists(os.path.dirname(MODEL_PATH)):
        os.makedirs(os.path.dirname(MODEL_PATH))
        
    X_arr, Y_arr = load_data(max_files=2)
    print(f"Loaded {len(X_arr)} winning matchups.")

    # Remove nans or bad inputs
    valid_mask = ~np.isnan(np.sum(X_arr, axis=1) + np.sum(Y_arr, axis=1))
    X_arr = X_arr[valid_mask].astype(int)
    Y_arr = Y_arr[valid_mask].astype(int)
    
    # Randomly subsample to save memory + time
    if len(X_arr) > 100000:
        idx = np.random.choice(np.arange(len(X_arr)), 100000, replace=False)
        X_arr = X_arr[idx]
        Y_arr = Y_arr[idx]

    # Convert Y to list of tuples for lookup later
    Y = [tuple(sorted(deck)) for deck in Y_arr]
    
    unique_cards = np.unique(np.concatenate([X_arr.flatten(), Y_arr.flatten()]))
    card_to_idx = {card_id: idx for idx, card_id in enumerate(unique_cards)}
    num_cards = len(unique_cards)
    
    print(f"Found {num_cards} unique cards. Vectorizing Enemy Decks...")
    
    X_matrix = np.zeros((len(X_arr), num_cards))
    row_indices = np.arange(len(X_arr))
    
    for c_idx in range(8):
        col_data = X_arr[:, c_idx]
        # map via dict comprehension
        mapped = np.array([card_to_idx.get(x, -1) for x in col_data])
        mask = mapped != -1
        X_matrix[row_indices[mask], mapped[mask]] = 1
                
    print("Fitting NearestNeighbors model...")
    nn_model = NearestNeighbors(n_neighbors=5, metric='cosine', n_jobs=-1)
    nn_model.fit(X_matrix)
    
    payload = {
        "model": nn_model,
        "X_train": X_matrix,
        "Y_train": Y, # The winning decks corresponding to the train set
        "card_to_idx": card_to_idx,
        "num_cards": num_cards
    }
    
    joblib.dump(payload, MODEL_PATH)
    print(f"Saved Deck Recommender model to {MODEL_PATH}")

if __name__ == "__main__":
    train_deck_recommender()
