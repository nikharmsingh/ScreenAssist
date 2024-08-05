import shutil
import os

# Paths
flask_videos_path = 'backend/app/static/uploads'
react_public_path = 'frontend/public'

# Ensure the destination directory exists
os.makedirs(react_public_path, exist_ok=True)

# Copy all video files
for filename in os.listdir(flask_videos_path):
    if filename.endswith(".mp4"):
        shutil.copy(os.path.join(flask_videos_path, filename), react_public_path)

print("Videos copied to React public folder successfully.")

