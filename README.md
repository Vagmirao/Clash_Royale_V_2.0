Clash Royale AI Strategy Tools

This project is a machine learning based web application that provides strategy tools for players of Clash Royale.

The website includes three AI systems that help players analyze matchups, counter enemy decks, and build stronger decks using real match data.

Features
Deck Win Predictor

Predicts the probability of winning against an opponent deck.

Input:

Your deck

Opponent deck

Output:

Win probability

Deck Recommendation AI

Suggests decks that can counter an opponent's deck.

Input:

Opponent deck

Output:

Recommended counter decks

Deck Builder AI

Generates the best possible deck using the cards owned by the user.

Input:

Cards owned

Output:

Optimized deck suggestion

Screenshots

## Screenshots

### Homepage
![Homepage](images/1.jpg)

### Deck Win Predictor
![Win Predictor](images/2.jpg)

### Deck Recommendation AI
![Deck Recommendation](images/3.jpg)

### Deck Builder AI
![Deck Builder](images/4.jpg)

Dataset

Dataset used:

https://www.kaggle.com/datasets/bwandowando/clash-royale-season-18-dec-0320-dataset

https://www.kaggle.com/datasets/s1m0n38/clash-royale-games

cards.json

This dataset contains real Clash Royale ladder match data including decks used and match results.

The dataset was used for:

Deck Win Predictor – to train the model to predict win probability between two decks.

Deck Recommendation AI – to learn which decks perform best against other decks.

Deck Builder AI – to analyze card performance and deck compositions to generate optimized decks.

Tech Stack
Machine Learning

Python

Pandas

Scikit-learn

XGBoost

Frontend

Languages used:

HTML

CSS

JavaScript

Backend

Languages used:

Python

Future Improvements

Opponent deck prediction AI

Card synergy analysis

Meta analysis dashboard