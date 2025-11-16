from profile import get_all_user_profiles

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack, csr_matrix


FEATURE_WEIGHTS = {
    'numerical': 1.0,  # age, app usage time
    'categorical': 0.5, # gender, location
    'text': 2.0         # interest tags
}


class HybridRecommender:
    def __init__(self, df, weights=FEATURE_WEIGHTS):
        self.df = df
        self.weights = weights
        self.user_ids = df['uid'].tolist()
        # Initialize TFIDF Vectorizer to process 'interest_tags' text data
        
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        # Setup the preprocessor for non-text features
        self.preprocessor = self._setup_preprocessor()
        self.feature_matrix = None 

    def _setup_preprocessor(self):
        numerical_features = ['age', 'likes_received', 'mutual_matches', 'app_usage_time_min']
        categorical_features = ['gender', 'sexual_orientation', 'location', 
                                'income_bracket', 'education_level', 'app_usage_time_label']

        return ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), categorical_features)
            ],
            remainder='drop', # Drop unused columns (name, email, uid, interest_tags)
            verbose_feature_names_out=False
        ).set_output(transform="default")

    def fit(self):
        X_other = self.preprocessor.fit_transform(self.df)
        n_num_features = len(self.preprocessor.named_transformers_['num'].get_feature_names_out())
        
        X_num = X_other[:, :n_num_features]
        X_cat = X_other[:, n_num_features:]
        
        print(f"   -> Numerical Features shape: {X_num.shape}")
        print(f"   -> Categorical Features shape: {X_cat.shape}")


        print("2. Processing text features (interest_tags) with TF-IDF...")
        # 3. Process Text Feature (TF-IDF)
        X_text = self.tfidf_vectorizer.fit_transform(self.df['interest_tags'].fillna(''))
        print(f"   -> Text Features (TF-IDF) shape: {X_text.shape}")

        print("3. Combining and weighting features...")
        # 4. Apply weights and combine features using sparse matrices
        X_num_weighted = X_num * self.weights['numerical']
        X_cat_weighted = X_cat * self.weights['categorical']
        X_text_weighted = X_text * self.weights['text']
        
        # Horizontally stack all weighted sparse feature matrices
        self.feature_matrix = hstack([X_num_weighted, X_cat_weighted, X_text_weighted])
    
    def filter_function(self, query_uid):
        MALE_GENDERS = ['Male', 'Transgender Male', 'Genderfluid'] 
        FEMALE_GENDERS = ['Female', 'Transgender Female', 'Genderfluid']
        NON_BINARY_GENDERS = ['Non-binary', 'Genderfluid']
        
        
        GENDER_CATEGORY_MAP = {
            'Male': 'male', 'Transgender': 'transgender', 'Female': 'female', 
            'Non-binary': 'non_binary', 'Genderfluid': 'non_binary', 'Prefer Not to Say': 'other'
        }
        
        ORIENTATION_PREFERENCES = {
            'Straight': {'Male': ['female', 'transgender'], 'Female': ['male', 'transgender']},
            'Gay': {'Male': ['male', 'transgender'], 'Female': ['female', 'transgender']},
            'Lesbian': {'Female': ['female', 'transgender']},
            'Bisexual': {'Male': ['female', 'male', 'transgender', 'non_binary'], 
                         'Female': ['female', 'male', 'transgender', 'non_binary']},
            'Pansexual': {'Male': ['female', 'male', 'transgender', 'non_binary'],
                          'Female': ['female', 'male', 'transgender', 'non_binary']},
            'Queer': {'Male': ['female', 'male', 'transgender', 'non_binary'],
                      'Female': ['female', 'male', 'transgender', 'non_binary']},
            'Asexual': {'Male': ['female', 'male', 'transgender', 'non_binary'],
                        'Female': ['female', 'male', 'transgender', 'non_binary']},
            'Demisexual': {'Male': ['female', 'male', 'transgender', 'non_binary'],
                           'Female': ['female', 'male', 'transgender', 'non_binary']},
        }

        def get_gender_category(gender):
            return GENDER_CATEGORY_MAP.get(gender, 'other')
            
        try:
            query_user = self.df[self.df['uid'] == query_uid].iloc[0]
        except IndexError:
            return pd.Index([])

        query_gender = query_user['gender']
        query_orientation = query_user['sexual_orientation']
        
        # Exclude the query user from potential candidates
        candidate_df = self.df[self.df['uid'] != query_uid].copy()
        
        query_pref_genders = []
        # Use query_gender to determine the applicable preferences
        if query_orientation in ORIENTATION_PREFERENCES and query_gender in ORIENTATION_PREFERENCES[query_orientation]:
            query_pref_categories = ORIENTATION_PREFERENCES[query_orientation][query_gender]
            
            # Map the categories back to the full list of acceptable gender strings
            for category in query_pref_categories:
                if category == 'male':
                    query_pref_genders.extend(['Male', 'Transgender', 'Genderfluid'])
                elif category == 'female':
                    query_pref_genders.extend(['Female', 'Transgender', 'Genderfluid'])
                elif category == 'non_binary':
                    query_pref_genders.extend(['Non-binary', 'Genderfluid'])
                    
            # Filter candidates based on the query user's preference
            candidate_df['pass_query_pref'] = candidate_df['gender'].apply(
                lambda x: x in query_pref_genders
            )
        else:
            candidate_df['pass_query_pref'] = True
            
        # The query user's gender must be desired by the candidate.

        def check_candidate_pref(candidate):
            cand_gender = candidate['gender']
            cand_orientation = candidate['sexual_orientation']
            
            if cand_orientation in ORIENTATION_PREFERENCES and cand_gender in ORIENTATION_PREFERENCES[cand_orientation]:
                cand_pref_categories = ORIENTATION_PREFERENCES[cand_orientation][cand_gender]
                return get_gender_category(query_gender) in cand_pref_categories
            
            return True
        
        candidate_df['pass_candidate_pref'] = candidate_df.apply(check_candidate_pref, axis=1)
        filtered_df = candidate_df[candidate_df['pass_query_pref'] & candidate_df['pass_candidate_pref']]
        
        return filtered_df.index


    def recommend(self, query_uid, top_n=10):
        """
        Calculates cosine similarity between the query user and all other users,
        after applying a 'gender/orientation' filter.
        """
        if self.feature_matrix is None:
            print("Error: Model not fitted. Please call .fit() first.")
            return pd.DataFrame()

        try:
            query_index = self.df[self.df['uid'] == query_uid].index[0]
        except IndexError:
            print(f"Error: User ID '{query_uid}' not found in the dataset.")
            return pd.DataFrame()

        filtered_indices = self.filter_function(query_uid)
        
        if filtered_indices.empty:
            print(f"No suitable candidates found after filtering for user '{query_uid}'.")
            return pd.DataFrame()
        
        query_vector = self.feature_matrix.getrow(query_index) # type: ignore
        
        candidate_rows = self.df.index.get_indexer(filtered_indices)
        candidate_matrix = self.feature_matrix[candidate_rows]

        # Calculate similarity only between the query user and the filtered candidates
        similarity_scores = cosine_similarity(query_vector, candidate_matrix).flatten() # type: ignore

        # Create a series of scores mapped back to the filtered indices
        score_series = pd.Series(similarity_scores, index=filtered_indices)

        # Get the top N indices from the filtered and scored series
        top_indices = score_series.nlargest(top_n).index
        
        recommendations = self.df.loc[top_indices, ['uid', 'name', 'gender', 'age', 'interest_tags']].copy()
        recommendations['similarity_score'] = score_series.loc[top_indices].values
        
        return recommendations.sort_values(by='similarity_score', ascending=False)





def test_recommend():
    candidates = get_all_user_profiles()
    query_user = candidates[0]

    print(query_user)

    # candidates_df = pd.DataFrame(candidates)
    # recommender = HybridRecommender(candidates_df)
    # recommender.fit()

    # top_matches = recommender.recommend(query_user["uid"], top_n=10)
    # print(top_matches)




if __name__ == '__main__':
    test_recommend()