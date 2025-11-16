from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from typing import Optional



cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Firestore database initialized successfully")


def get_user_profile(user_id):
    """
    uid,
    name,
    email,
    gender: str,
    sexual_orientation: str,
    age: int,
    income_level: str,
    education_level: str,
    interest_tags: str,
    likes_received: int,
    mutual_matches: int,
    app_usage_time_label: str,
    """

    profile_ref = db.collection('profile').document(user_id)
    user_profile = profile_ref.get()
    if user_profile.exists:
        profile = user_profile.to_dict()

        return profile
    else:
        return None


