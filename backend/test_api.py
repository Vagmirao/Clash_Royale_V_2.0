import requests

BASE_URL = "http://127.0.0.1:8000"

print("--- Testing /predict-win ---")
res = requests.post(f"{BASE_URL}/predict-win", json={"user_deck": [26000000, 26000001, 26000002, 26000003, 26000004, 26000005, 26000006, 26000007], "enemy_deck": [26000010, 26000011, 26000012, 26000013, 26000014, 26000015, 26000016, 26000017]})
print(res.status_code, res.text)

print("\n--- Testing /recommend-deck ---")
res2 = requests.post(f"{BASE_URL}/recommend-deck", json={"enemy_deck": [26000010, 26000011, 26000012, 26000013, 26000014, 26000015, 26000016, 26000017]})
print(res2.status_code, res2.text)

print("\n--- Testing /build-deck ---")
res3 = requests.post(f"{BASE_URL}/build-deck", json={"user_cards": [26000000, 26000001, 26000002, 26000003, 26000004, 26000005, 26000006, 26000007, 26000008, 26000009, 26000010, 26000011, 28000000, 28000001, 28000002, 27000000]})
print(res3.status_code, res3.text)
