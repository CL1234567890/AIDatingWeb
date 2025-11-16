from profile import get_all_user_profiles, get_all_user_profiles_from_csv

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack, csr_matrix


FEATURE_WEIGHTS = {
    'numerical': 3.0,
    'categorical': 2.0,
    'text': 2.0
}


class HybridRecommender:
    def __init__(self, df, weights=FEATURE_WEIGHTS):
        self.df = df.reset_index(drop=True)   # ensure clean index
        self.weights = weights
        self.user_ids = df['uid'].tolist()

        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        self.preprocessor = self._setup_preprocessor()
        self.feature_matrix = None

    def _setup_preprocessor(self):
        numerical_features = ['age']
        categorical_features = [
            'gender', 'sexual_orientation', 'location',
            'income_bracket', 'education_level'
        ]

        return ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), categorical_features)
            ],
            remainder='drop',
            verbose_feature_names_out=False
        )

    def fit(self):
        print("1. Processing numerical & categorical features...")
        X_other = self.preprocessor.fit_transform(self.df)

        # Safe extraction of numerical block
        n_num_features = self.preprocessor.named_transformers_['num'].transform(
            self.df[['age']]
        ).shape[1]

        X_num = X_other[:, :n_num_features]
        X_cat = X_other[:, n_num_features:]

        print(f"   -> Numerical Features shape: {X_num.shape}")
        print(f"   -> Categorical Features shape: {X_cat.shape}")

        print("2. Processing text features (interest_tags) with TF-IDF...")
        X_text = self.tfidf_vectorizer.fit_transform(self.df['interest_tags'].fillna(''))
        print(f"   -> Text Features (TF-IDF) shape: {X_text.shape}")

        print("3. Combining & weighting features...")
        X_num *= self.weights['numerical']
        X_cat *= self.weights['categorical']
        X_text *= self.weights['text']

        self.feature_matrix = hstack([X_num, X_cat, X_text]).tocsr()
        print("   -> Final feature matrix shape:", self.feature_matrix.shape)

    def filter_function(self, query_uid):
        GENDER_CATEGORY_MAP = {
            'Male': 'male', 'Transgender Male': 'male',
            'Female': 'female', 'Transgender Female': 'female',
            'Non-binary': 'non_binary', 'Genderfluid': 'non_binary',
            'Transgender': 'transgender',
            'Prefer Not to Say': 'other'
        }

        ORIENTATION_PREFERENCES = {
            'Straight': {
                'Male': ['female', 'transgender'],
                'Female': ['male', 'transgender']
            },
            'Gay': {
                'Male': ['male', 'transgender'],
                'Female': ['female', 'transgender']
            },
            'Lesbian': {
                'Female': ['female', 'transgender']
            },
            'Bisexual': {
                'Male': ['female', 'male', 'transgender', 'non_binary'],
                'Female': ['female', 'male', 'transgender', 'non_binary']
            },
            'Pansexual': {
                'Male': ['female', 'male', 'transgender', 'non_binary'],
                'Female': ['female', 'male', 'transgender', 'non_binary']
            },
            'Queer': {
                'Male': ['female', 'male', 'transgender', 'non_binary'],
                'Female': ['female', 'male', 'transgender', 'non_binary']
            },
            'Asexual': {
                'Male': ['female', 'male', 'transgender', 'non_binary'],
                'Female': ['female', 'male', 'transgender', 'non_binary']
            },
            'Demisexual': {
                'Male': ['female', 'male', 'transgender', 'non_binary'],
                'Female': ['female', 'male', 'transgender', 'non_binary']
            },
        }

        def get_gender_category(g):
            return GENDER_CATEGORY_MAP.get(g, 'other')

        # --- Get query user ---
        user_row = self.df[self.df['uid'] == query_uid]
        if user_row.empty:
            return pd.Index([])

        query_user = user_row.iloc[0]
        q_gender = query_user['gender']
        q_orientation = query_user['sexual_orientation']

        # Exclude themselves
        candidate_df = self.df[self.df['uid'] != query_uid].copy()

        # --- Query user's preference ---
        acceptable_gender_values = []
        if q_orientation in ORIENTATION_PREFERENCES and q_gender in ORIENTATION_PREFERENCES[q_orientation]:
            pref_categories = ORIENTATION_PREFERENCES[q_orientation][q_gender]

            for cat in pref_categories:
                if cat == 'male':
                    acceptable_gender_values.extend(['Male', 'Transgender Male'])
                elif cat == 'female':
                    acceptable_gender_values.extend(['Female', 'Transgender Female'])
                elif cat == 'non_binary':
                    acceptable_gender_values.extend(['Non-binary', 'Genderfluid'])
                elif cat == 'transgender':
                    acceptable_gender_values.extend(['Transgender Male', 'Transgender Female'])

            candidate_df['pass_query_pref'] = candidate_df['gender'].isin(acceptable_gender_values)
        else:
            candidate_df['pass_query_pref'] = True

        # --- Candidate's preference toward the query user ---
        def candidate_likes_query_user(row):
            gender = row['gender']
            orientation = row['sexual_orientation']
            if orientation in ORIENTATION_PREFERENCES and gender in ORIENTATION_PREFERENCES[orientation]:
                return get_gender_category(q_gender) in ORIENTATION_PREFERENCES[orientation][gender]
            return True

        candidate_df['pass_candidate_pref'] = candidate_df.apply(candidate_likes_query_user, axis=1)

        final_filtered = candidate_df[candidate_df['pass_query_pref'] & candidate_df['pass_candidate_pref']]
        return final_filtered.index

    def recommend(self, query_uid, top_n=10):
        if self.feature_matrix is None:
            print("Model not fitted. Call .fit() first.")
            return pd.DataFrame()

        user_rows = self.df[self.df['uid'] == query_uid]
        if user_rows.empty:
            print("User ID not found:", query_uid)
            return pd.DataFrame()

        query_index = user_rows.index[0]
        filtered_indices = self.filter_function(query_uid)

        if len(filtered_indices) == 0:
            print("No suitable matches found.")
            return pd.DataFrame()

        query_vec = self.feature_matrix.getrow(query_index)
        candidate_matrix = self.feature_matrix[filtered_indices]

        sims = cosine_similarity(query_vec, candidate_matrix).flatten()
        score_series = pd.Series(sims, index=filtered_indices)

        top_idx = score_series.nlargest(top_n).index

        result = self.df.loc[top_idx, ['uid', 'name', 'gender', 'age', 'interest_tags']].copy()
        result['similarity_score'] = score_series.loc[top_idx].values
        return result.sort_values(by='similarity_score', ascending=False)





def test_recommend():
    candidates = get_all_user_profiles()
    query_user = candidates[8]

    # candidates = get_all_user_profiles_from_csv()
    # query_user = candidates.iloc[8, :]

    print(query_user)

    candidates_df = pd.DataFrame(candidates)
    recommender = HybridRecommender(candidates)
    recommender.fit()

    top_matches = recommender.recommend(query_user["uid"], top_n=10)
    print(top_matches)




if __name__ == '__main__':
    test_recommend()