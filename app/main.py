from flask import request, jsonify
from werkzeug.utils import secure_filename
from moviepy.editor import VideoFileClip
import assemblyai as aai
import os
import json
from dotenv import load_dotenv
from app import app
from app.similarity_utils import rank_segments, store_embeddings, compute_embeddings, search_index

# Load environment variables
load_dotenv()
ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY')
ALLOWED_EXTENSIONS = {'mp4'}

# Set AssemblyAI API key
aai.settings.api_key = ASSEMBLYAI_API_KEY

# Check for allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Extract audio from video
def extract_audio_from_video(video_path, output_path):
    print(f"Extracting audio from video: {video_path}")
    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(output_path)
    print(f"Audio extracted to: {output_path}")

# Process video for chapter detection
def process_video(video_path, device='cpu'):
    print(f"Processing video: {video_path}")
    results = []
    transcriber = aai.Transcriber()
    
    # Stage 1: Extract audio
    audio_path = f"{os.path.splitext(video_path)[0]}.mp3"
    extract_audio_from_video(video_path, audio_path)
    
    # Stage 2: Transcribe
    print(f"Transcribing audio: {audio_path}")
    config = aai.TranscriptionConfig(auto_chapters=False)
    transcript = transcriber.transcribe(audio_path, config)
    
    if transcript.status == aai.TranscriptStatus.error:
        print(f"Error transcribing audio: {transcript.error}")
        return {'error': f"Error transcribing: {transcript.error}"}
    
    print("Transcription completed.")
    
    # Stage 3: Auto Chapters
    print("Detecting chapters...")
    config = aai.TranscriptionConfig(auto_chapters=True)
    transcript = transcriber.transcribe(audio_path, config)
    
    if transcript.status == aai.TranscriptStatus.error:
        print(f"Error detecting chapters: {transcript.error}")
        return {'error': f"Error detecting chapters: {transcript.error}"}
    
    chapters = [{'id': idx + 1, 'start': chapter.start, 'end': chapter.end, 'headline': chapter.headline,
                 'summary': chapter.summary, 'gist': chapter.gist} for idx, chapter in enumerate(transcript.chapters)]

    # Calculate embeddings for gist, headline, and summary
    for chapter in chapters:
        chapter['gist_embedding'] = compute_embeddings(chapter['gist'], device).cpu().numpy().tolist()
        chapter['headline_embedding'] = compute_embeddings(chapter['headline'], device).cpu().numpy().tolist()
        chapter['summary_embedding'] = compute_embeddings(chapter['summary'], device).cpu().numpy().tolist()

    results.append({
        'transcript': transcript.text,
        'chapters': chapters
    })
    
    # Store embeddings in the vector database
    store_embeddings(chapters, device)
    
    os.remove(audio_path)
    print("Chapter detection completed.")
    return results

# Health check route
@app.route('/')
def health_check():
    return jsonify({'status': 'ok'}), 200

# Route for uploading video
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        print("No file part in the request.")
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        print("No selected file.")
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(video_path)
        print(f"File saved to: {video_path}")

        # Process the uploaded video
        results = process_video(video_path, device='cpu')  # Change device to 'cuda' if using GPU
        output_file = os.path.join(app.config['OUTPUT_FOLDER'], f'{filename}_results.json')
        with open(output_file, 'w') as json_file:
            json.dump(results, json_file, indent=4)
        
        os.remove(video_path)
        print(f"Results saved to: {output_file}")
        return jsonify({'message': 'Video processed successfully', 'results': results}), 200
    else:
        print("Invalid file type.")
        return jsonify({'error': 'Invalid file type'}), 400

# Route for user query
@app.route('/query', methods=['POST'])
def handle_query():
    query = request.json.get('query')
    if not query:
        print("No query provided.")
        return jsonify({'error': 'No query provided'}), 400

    print(f"Handling query: {query}")

    # Collect all headlines and their corresponding video segments
    headlines = []
    video_segments = []
    for filename in os.listdir(app.config['OUTPUT_FOLDER']):
        if filename.endswith('_results.json'):
            with open(os.path.join(app.config['OUTPUT_FOLDER'], filename)) as f:
                results = json.load(f)
                chapters = results[0]['chapters']
                for chapter in chapters:
                    headlines.append(chapter['headline'])
                    video_segments.append({
                        'filename': filename.replace('_results.json', '.mp4'),
                        'id': chapter['id'],
                        'headline': chapter['headline'],
                        'gist': chapter['gist'],
                        'gist_embedding': chapter['gist_embedding'],
                        'headline_embedding': chapter['headline_embedding'],
                        'summary_embedding': chapter['summary_embedding'],
                        'start': chapter['start'],
                        'end': chapter['end']
                    })

    # Rank segments based on similarity
    ranked_segments_with_scores = rank_segments(query, video_segments, device='cpu')  # Change device to 'cuda' if using GPU

    # Prepare the response
    ranked_video_segments = [
        {
            'filename': segment['filename'],
            'id': segment['id'],
            'headline': segment['headline'],
            'gist': segment['gist'],
            'similarity_score': score,
            'start': segment['start'],
            'end': segment['end']
        }
        for score, segment in ranked_segments_with_scores
    ]

    print("Query handling completed.")
    return jsonify({'segments': ranked_video_segments}), 200

if __name__ == '__main__':
    app.run(debug=True)
