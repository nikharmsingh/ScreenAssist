
# VideoGPT

VideoGPT is a online tool to query on the large videos, to only refer to relevant part of the video. just like how youtube does for it's video




## How to Setup
### Backend
1. Clone the dev repoistory
2. First Go to the Backend Folder ``` $cd backend ```
3. Create virtualenv by ``` $virtualenv venv ``` in the terminal
4. In terminal type ``` $pip install -r requirements.txt ```
5. Your Backend is Setup

### Frontend
Note:- You should have node install your machine
1. Go to the Frontend Folder ``` $cd frontend ```
2. In terminal type ``` $npm install ```
3. Your Frontend is Setup

## How to Run
1. At root you will have backend and frontend
2. Open those in two separate Terminal 
3. To Run Backend type ``` $python3 run.py ```
4. To Run Frontend
4.1. First Type ```$npm install ``` . 
4.2. Then Type ``` $npm start dev ```. 
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file and paste this .env in backend folder at root

`SECRET_KEY`

`ASSEMBLYAI_API_KEY`

Note:- Get ASSEMBLYAI_API_KEY from https://www.assemblyai.com/


## Demo

Backend Local Server :- ``` http://127.0.0.1:5000 ```
Frontend Local Server :- ``` http://localhost:3000 ```


## Tech Stack

**Client:** React, TailwindCSS

**Server:** Flask

**Tools:** Sentence Transformer,Spacy


## Screenshots
<img width="1512" alt="Screenshot 2024-08-06 at 12 40 46 PM" src="https://github.com/user-attachments/assets/56db6c19-0e62-47f1-962d-8cceb5c8aba6">

## Support

For support, email nikharms2500@gmail.com

