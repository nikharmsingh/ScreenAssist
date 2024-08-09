from sentence_transformers import SentenceTransformer, util
import numpy as np
import faiss
import torch

# Load the pre-trained model
model = SentenceTransformer('BAAI/bge-base-en-v1.5')

def compute_embeddings(texts, device='cpu'):
    embeddings = model.encode(texts, convert_to_tensor=True)
    return embeddings.to(device)

def compute_similarity(query_embedding, embeddings):
    similarities = util.pytorch_cos_sim(query_embedding, embeddings).squeeze().tolist()
    return similarities

def rank_segments(query, video_segments, device='cpu'):
    query_embedding = compute_embeddings(query, device)
    
    # Compute similarities in parallel
    summary_similarities = [compute_similarity(query_embedding, torch.tensor(segment['summary_embedding']).to(device)) for segment in video_segments]
    headline_similarities = [compute_similarity(query_embedding, torch.tensor(segment['headline_embedding']).to(device)) for segment in video_segments]
    gist_similarities = [compute_similarity(query_embedding, torch.tensor(segment['gist_embedding']).to(device)) for segment in video_segments]

    # Combine results using logical OR
    combined_segments = []
    for idx, segment in enumerate(video_segments):
        score = max(summary_similarities[idx], headline_similarities[idx], gist_similarities[idx])
        combined_segments.append((score, segment))

    # Sort by combined score
    ranked_segments = sorted(combined_segments, key=lambda x: x[0], reverse=True)[:10]  # Limit to top 10

    return [(score, segment) for score, segment in ranked_segments if score >= 0.00]

def store_embeddings(video_segments, device='cpu'):
    d = 768  # Dimension of embeddings from 'BAAI/bge-base-en-v1.5'
    index = faiss.IndexFlatL2(d)
    
    for segment in video_segments:
        index.add(np.array(segment['gist_embedding']).reshape(1, -1))
        index.add(np.array(segment['headline_embedding']).reshape(1, -1))
        index.add(np.array(segment['summary_embedding']).reshape(1, -1))

    faiss.write_index(index, "video_segments.index")

def load_index():
    return faiss.read_index("video_segments.index")

def search_index(query_embedding, k=5, device='cpu'):
    index = load_index()
    D, I = index.search(query_embedding.cpu().numpy().reshape(1, -1), k)
    return I
