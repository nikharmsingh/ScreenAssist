from sentence_transformers import SentenceTransformer, util

# Load the pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_similarity(query, headlines):
    # Encode the query and headlines
    query_embedding = model.encode(query, convert_to_tensor=True)
    headline_embeddings = model.encode(headlines, convert_to_tensor=True)

    # Compute cosine similarity scores
    similarities = util.pytorch_cos_sim(query_embedding, headline_embeddings).squeeze().tolist()
    return similarities

def rank_segments(query, headlines, video_segments):
    similarities = compute_similarity(query, headlines)
    ranked_segments = sorted(zip(similarities, video_segments), key=lambda x: x[0], reverse=True)

    # Prepare the response
    ranked_video_segments = [
        {
            'filename': segment['filename'],
            'start': segment['start'],
            'end': segment['end'],
            'headline': segment['headline'],
            'chapter_id': segment['id'],
            'similarity': score
        }
        for score, segment in ranked_segments
    ]

    return ranked_video_segments