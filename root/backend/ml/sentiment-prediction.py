import pickle
import numpy as np

# Load the model
model_file = open('sentiment-clf.pkl', 'rb')
model = pickle.load(file)

@app.route('/predict', methods=['POST'])
def predict(text):
    result = model.predict(text)
    return result

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    text = input_data['text']
    result = predict(text)
    print(json.dumps({'prediction': result}))
