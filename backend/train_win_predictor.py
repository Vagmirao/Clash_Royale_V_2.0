import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib

DATA_DIR = r"..\archive (1)\BattlesStaging_01012021_WL_tagged"
MODEL_PATH = os.path.join("models", "win_predictor", "model.joblib")

def load_data(max_files=1):
    all_data = []
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    for file in files[:max_files]:
        filepath = os.path.join(DATA_DIR, file)
        print(f"Loading {filepath}...")
        df = pd.read_csv(filepath)
        winner_cols = [f"winner.card{i}.id" for i in range(1, 9)]
        loser_cols = [f"loser.card{i}.id" for i in range(1, 9)]
        df = df.dropna(subset=winner_cols + loser_cols)
        
        # Take a subset if it's too huge, just to train quickly for the demo
        if len(df) > 500000:
            df = df.sample(500000, random_state=42)
            
        all_data.append(df[winner_cols + loser_cols])
        
    return pd.concat(all_data, ignore_index=True)

def train_win_predictor():
    if not os.path.exists(os.path.dirname(MODEL_PATH)):
        os.makedirs(os.path.dirname(MODEL_PATH))
        
    df = load_data(max_files=1)
    print(f"Loaded {len(df)} matches.")
    
    winner_cols = [f"winner.card{i}.id" for i in range(1, 9)]
    loser_cols = [f"loser.card{i}.id" for i in range(1, 9)]
    
    unique_cards = set()
    for col in winner_cols + loser_cols:
        unique_cards.update(df[col].unique())
    unique_cards = sorted(list(unique_cards))
    
    card_to_idx = {card_id: idx for idx, card_id in enumerate(unique_cards)}
    num_cards = len(unique_cards)
    print(f"Found {num_cards} unique cards.")
    
    print("Vectorizing decks (Optimized)...")
    winner_matrix = np.zeros((len(df), num_cards))
    loser_matrix = np.zeros((len(df), num_cards))
    
    row_indices = np.arange(len(df))
    for col in winner_cols:
        col_indices = df[col].map(card_to_idx).fillna(-1).astype(int).values
        mask = col_indices != -1
        winner_matrix[row_indices[mask], col_indices[mask]] = 1
        
    for col in loser_cols:
        col_indices = df[col].map(card_to_idx).fillna(-1).astype(int).values
        mask = col_indices != -1
        loser_matrix[row_indices[mask], col_indices[mask]] = 1
        
    rand_vars = np.random.rand(len(df)) > 0.5
    X = np.where(
        rand_vars[:, None], 
        np.concatenate([winner_matrix, loser_matrix], axis=1),
        np.concatenate([loser_matrix, winner_matrix], axis=1)
    )
    y = rand_vars.astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression Model...")
    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    payload = {
        "model": model,
        "card_to_idx": card_to_idx,
        "num_cards": num_cards
    }
    joblib.dump(payload, MODEL_PATH)
    print(f"Saved Win Predictor model to {MODEL_PATH}")

if __name__ == "__main__":
    train_win_predictor()
