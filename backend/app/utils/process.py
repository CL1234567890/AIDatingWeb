from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from typing import Optional
import pandas as pd
import random
from faker import Faker 


fake = Faker()

def load_csv(path):
    df = pd.read_csv(path)
    return df


def generate_missing_data():
    return {
    "uid": fake.uuid4(),
    "name": fake.name(),
    "email": fake.email(),
    "age": random.randint(16, 48),  
    "location": fake.city()
    }


if __name__ == "__main__":
    df = load_csv("dating.csv")
    
    required_columns = [
        "gender",
        "sexual_orientation",
        "income_bracket",
        "education_level",
        "interest_tags",
        "likes_received",
        "mutual_matches",
        "app_usage_time_label",
        "app_usage_time_min"
    ]
    
    # Ensure the DataFrame has the required columns
    df_filtered = df[required_columns]

    all_profile_data = []
    
    for _, row in df_filtered.iterrows():
        missing_data = generate_missing_data()
        profile_data = row.to_dict()
        profile_data.update(missing_data)
        all_profile_data.append(profile_data)

    final_df = pd.DataFrame(all_profile_data[:500])
    
    final_df.to_csv("final_profiles.csv", index=False)



    

