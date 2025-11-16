from firebase_admin import firestore
from typing import Optional
import pandas as pd


# Import the shared Firebase client from auth.py
from app.utils.auth import get_firestore_client

def _get_db():
    """Lazy-load Firestore client to ensure Firebase is initialized"""
    return get_firestore_client()


def get_user_profile(user_id):
    """
    Get a single user profile from Firestore
    
    Returns profile with fields:
    - uid: str
    - name: str
    - email: str
    - gender: str
    - sexual_orientation: str
    - age: int
    - location: str
    - income_bracket: str
    - education_level: str
    - interest_tags: str
    """
    db = _get_db()
    profile_ref = db.collection('profiles').document(user_id)
    user_profile = profile_ref.get()
    if user_profile.exists:
        return user_profile.to_dict()
    else:
        return None


def get_all_user_profiles():
    db = _get_db()
    profile_ref = db.collection('profiles')
    profiles_stream = profile_ref.stream()
    
    profiles_list = []

    for doc in profiles_stream:
        profile_data = doc.to_dict()
        profile_data['document_id'] = doc.id 
        profiles_list.append(profile_data)

    return profiles_list


def get_all_user_profiles_from_csv():
    df = pd.read_csv("final_profiles.csv")
    return df
