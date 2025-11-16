from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from typing import Optional
import random



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
    location: str,
    income_bracket: str,
    education_level: str,
    interest_tags: str,
    likes_received: int,
    mutual_matches: int,
    app_usage_time_label: str,
    app_usage_time_min: int
    """

    profile_ref = db.collection('profile').document(user_id)
    user_profile = profile_ref.get()
    if user_profile.exists:
        profile = user_profile.to_dict()

        return profile
    else:
        return None


def get_all_user_profiles():
    profile_ref = db.collection('profiles')
    profiles_stream = profile_ref.stream()
    
    profiles_list = []

    for doc in profiles_stream:
        profile_data = doc.to_dict()
        profile_data['document_id'] = doc.id 
        profiles_list.append(profile_data)
        print(profile_data)

    return profiles_list

