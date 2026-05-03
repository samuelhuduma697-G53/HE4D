"""
Train Risk Classification Model for Helper Safety
"""

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

def train_risk_classifier():
    """Train model to predict helper risk levels"""
    
    # Feature columns: location_risk, time_risk, acuity_risk, experience_risk
    X = np.random.rand(5000, 4)
    y = np.random.randint(0, 3, 5000)  # 0=low, 1=medium, 2=high
    
    model = GradientBoostingClassifier(n_estimators=100, max_depth=5)
    
    scores = cross_val_score(model, X, y, cv=5)
    print(f"Cross-validation scores: {scores}")
    print(f"Mean accuracy: {scores.mean():.3f}")
    
    model.fit(X, y)
    joblib.dump(model, '../models/risk_classifier.pkl')
    print("Risk classifier saved to ../models/risk_classifier.pkl")

if __name__ == "__main__":
    train_risk_classifier()