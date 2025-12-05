import os
import google.auth.transport.requests
from google.oauth2 import id_token
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
def verify_google_token(token: str):
    try:
        # Verify the token with Google's OAuth2 service
        request = google.auth.transport.requests.Request()
        id_info = id_token.verify_oauth2_token(token, request, GOOGLE_CLIENT_ID)

        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(status_code=400, detail="Token is not from a valid issuer.")
        
        return id_info
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid token.")
