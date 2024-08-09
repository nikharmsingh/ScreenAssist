from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from moviepy.editor import VideoFileClip
import assemblyai as aai
import os
import json
import shutil
from dotenv import load_dotenv
from app import app
from app.similarity_utils import rank_segments, store_embeddings, compute_embeddings, search_index
import time
import requests
import yt_dlp

# Load environment variables
load_dotenv()
ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY')
SECRET_KEY = os.getenv('SECRET_KEY')
ALLOWED_EXTENSIONS = {'mp4'}

# Set AssemblyAI API key
aai.settings.api_key = ASSEMBLYAI_API_KEY

# Set Flask secret key
app.secret_key = SECRET_KEY


# Paths
FLASK_VIDEOS_PATH = 'app/static/uploads'
REACT_PUBLIC_PATH = '../frontend/public'

# Ensure the destination directory exists
os.makedirs(REACT_PUBLIC_PATH, exist_ok=True)

# Check for allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Download video from YouTube
def download_youtube_video(url, path):
    try:
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': os.path.join(path, '%(title)s.%(ext)s'),
            'merge_output_format': 'mp4',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            video_title = ydl.prepare_filename(info_dict)
        return video_title
    except Exception as e:
        print(f"Error downloading YouTube video: {e}")
        raise

# Extract audio from video
def extract_audio_from_video(video_path, output_path):
    try:
        print(f"Extracting audio from video: {video_path}")
        clip = VideoFileClip(video_path)
        clip.audio.write_audiofile(output_path)
        print(f"Audio extracted to: {output_path}")
    except Exception as e:
        print(f"Error extracting audio: {e}")
        raise

# Poll for transcription status
def poll_transcription_status(transcription_id):
    url = f"https://api.assemblyai.com/v2/transcript/{transcription_id}"
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
    }

    while True:
        response = requests.get(url, headers=headers)
        transcript = response.json()
        if transcript['status'] == 'completed':
            return transcript
        elif transcript['status'] == 'failed':
            raise Exception(f"Transcription failed: {transcript.get('error', 'Unknown error')}")
        time.sleep(5)

# Process video for chapter detection
def process_video(video_path, device='cpu'):
    try:
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

        # Poll for transcription status
        transcript = poll_transcription_status(transcript.id)
        print("Transcription completed.")

        # Stage 3: Auto Chapters
        print("Detecting chapters...")
        config = aai.TranscriptionConfig(auto_chapters=True)
        transcript = transcriber.transcribe(audio_path, config)

        # Poll for transcription status
        transcript = poll_transcription_status(transcript.id)

        if transcript['status'] == 'failed':
            error_message = transcript.get('error', 'Unknown error')
            print(f"Error detecting chapters: {error_message}")
            return {'error': f"Error detecting chapters: {error_message}"}

        chapters = [{'id': idx + 1, 'start': chapter['start'], 'end': chapter['end'], 'headline': chapter['headline'],
                     'summary': chapter['summary'], 'gist': chapter['gist']} for idx, chapter in enumerate(transcript['chapters'])]

        # Calculate embeddings for gist, headline, and summary
        for chapter in chapters:
            chapter['gist_embedding'] = compute_embeddings(chapter['gist'], device).cpu().numpy().tolist()
            chapter['headline_embedding'] = compute_embeddings(chapter['headline'], device).cpu().numpy().tolist()
            chapter['summary_embedding'] = compute_embeddings(chapter['summary'], device).cpu().numpy().tolist()

        results.append({
            'transcript': transcript['text'],
            'chapters': chapters
        })

        # Store embeddings in the vector database
        store_embeddings(chapters, device)

        # Delete the audio file after processing
        os.remove(audio_path)
        print("Chapter detection completed.")
        return results

    except Exception as e:
        print(f"Error processing video: {e}")
        return {'error': str(e)}

# Health check route
@app.route('/')
def health_check():
    return jsonify({'status': 'ok'}), 200

# Route for uploading video
@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                print("No selected file.")
                return jsonify({'error': 'No selected file'}), 400

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(video_path)
                print(f"File saved to: {video_path}")
            else:
                print("Invalid file type.")
                return jsonify({'error': 'Invalid file type'}), 400

        elif 'url' in request.form:
            url = request.form['url']
            video_path = download_youtube_video(url, app.config['UPLOAD_FOLDER'])
            print(f"Video downloaded from YouTube: {video_path}")

        else:
            print("No file or URL provided.")
            return jsonify({'error': 'No file or URL provided'}), 400

        # Process the uploaded video
        results = process_video(video_path, device='cpu')  # Change device to 'cuda' if using GPU

        if 'error' in results:
            return jsonify({'error': results['error']}), 500

        output_file = os.path.join(app.config['OUTPUT_FOLDER'], f'{os.path.splitext(os.path.basename(video_path))[0]}_results.json')
        with open(output_file, 'w') as json_file:
            json.dump(results, json_file, indent=4)
        print(f"Results saved to: {output_file}")

        # Move the video file to the React public directory
        shutil.move(video_path, os.path.join(REACT_PUBLIC_PATH, os.path.basename(video_path)))
        print(f"Video moved to React public folder: {os.path.join(REACT_PUBLIC_PATH, os.path.basename(video_path))}")

        return jsonify({'message': 'Video processed successfully', 'results': results}), 200

    except Exception as e:
        print(f"Error in upload_file: {e}")
        return jsonify({'error': str(e)}), 500

# Route for user query
@app.route('/query', methods=['POST'])
def handle_query():
    try:
        query = request.json.get('query')
        if not query:
            print("No query provided.")
            return jsonify({'error': 'No query provided'}), 400

        print(f"Handling query: {query}")

        # Collect all headlines and their corresponding video segments
        video_segments = []
        for filename in os.listdir(app.config['OUTPUT_FOLDER']):
            if filename.endswith('_results.json'):
                with open(os.path.join(app.config['OUTPUT_FOLDER'], filename)) as f:
                    results = json.load(f)
                    chapters = results[0]['chapters']
                    for chapter in chapters:
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
        ranked_video_segments = []
        for score, segment in ranked_segments_with_scores:
            print(f"Similarity Score: {score}")  # Print similarity score to terminal
            if score >= 0.60:
                ranked_video_segments.append({
                    'filename': segment['filename'].replace('.mp4.mp4', '.mp4'),  # Ensure correct filename
                    'id': segment['id'],
                    'headline': segment['headline'],
                    'gist': segment['gist'],
                    'similarity_score': score,
                    'start': segment['start'],
                    'end': segment['end']
                })

        print("Query handling completed.")
        return jsonify({'segments': ranked_video_segments}), 200

    except Exception as e:
        print(f"Error in handle_query: {e}")
        return jsonify({'error': str(e)}), 500

# Serve static files
@app.route('/static/uploads/<path:filename>')
def serve_static(filename):
    return send_from_directory(REACT_PUBLIC_PATH, filename)

if __name__ == '__main__':
    app.secret_key = os.getenv('SECRET_KEY')  # Set the secret key from environment variable
    app.run(debug=True)