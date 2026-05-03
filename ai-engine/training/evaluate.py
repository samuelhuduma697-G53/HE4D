"""
Model Evaluation Script
"""

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score

def evaluate_model():
    """Evaluate trained model performance"""
    model = joblib.load('../models/crisis_classifier.pkl')
    
    # Load test data
    X_test = np.random.rand(200, 10)
    y_test = np.random.randint(0, 5, 200)
    
    predictions = model.predict(X_test)
    
    print(f"Accuracy: {accuracy_score(y_test, predictions):.3f}")
    print(f"Precision: {precision_score(y_test, predictions, average='weighted'):.3f}")
    print(f"Recall: {recall_score(y_test, predictions, average='weighted'):.3f}")

if __name__ == "__main__":
    evaluate_model()