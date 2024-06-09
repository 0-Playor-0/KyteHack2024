import joblib
import sklearn
import os
import json
import sys

os.chdir("/Users/davidsong/KyteHack2024/root/backend/ml")

# Load the model
with open('sentiment_clf.pkl', 'rb') as model_file:
    model = joblib.load(model_file)

def predict(text):
    result = model.predict(text)
    return result

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    text = input_data['text']
    result = predict([text])
    print(json.dumps({'prediction': str(result[0])}))
