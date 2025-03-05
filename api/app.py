from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from models import (user_pydantic, User, user_pydanticIn, UserUpdate, function_pydanticIn, function_pydantic, Function, log_pydantic, log_pydanticIn, Log)
from config import conf
from utils import hash_password, verify_password
import random
import string
import os
from pydantic import BaseModel

from datetime import datetime, timedelta
import pytz

IST = pytz.timezone('Asia/Kolkata')

class OTPVerification(BaseModel):
    otp: str

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str

async def check_verification_expired(user):
    """Check if user verification has expired (more than 30 minutes)"""
    if not user.verified or user.verified_at is None:
        return False
    
    current_time = datetime.now(IST)
    time_diff = current_time - user.verified_at
    
    if time_diff > timedelta(minutes=30):
        await User.filter(username=user.username).update(verified=False)
        return True
    
    return False

class OTPRequestData(BaseModel):
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fm = FastMail(conf)

def generate_otp():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

otp_store = {}

@app.get('/')
def index():
    return {'Msg': "Hello World"}

@app.post('/users')
async def create_user(user_info: user_pydanticIn):
    user_info.password_hash = hash_password(user_info.password_hash)
    user = await User.create(**user_info.dict(exclude_unset=True))
    response = await user_pydanticIn.from_tortoise_orm(user)
    return {"status": "ok", "data": response}

@app.get('/users')
async def get_users():
    response = await user_pydantic.from_queryset(User.all())
    return {"status": "ok", "data": response}

@app.get('/users/{username}')
async def get_user(username: str):
    user = await User.get_or_none(username=username)
    if user:
        response = await user_pydanticIn.from_tortoise_orm(user)
        return {"status": "ok", "data": response}
    else:
        return {"status": "error", "message": "User not found"}

@app.post('/users/{username}/request-otp')
async def request_otp(username: str, request_data: OTPRequestData, background_tasks: BackgroundTasks):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.verified:
        return {"status": "info", "message": "User is already verified. No need for OTP verification."}
    
    if not verify_password(request_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalusername password")
    
    otp = generate_otp()
    otp_store[user.email] = otp
    
    message = MessageSchema(
        subject="Your OTP Code",
        recipients=[user.email],
        body=f"Your OTP code is {otp}",
        subtype="plain"
    )
    background_tasks.add_task(fm.send_message, message)
    
    return {"status": "ok", "message": "OTP sent to your email"}

@app.post('/users/{username}/verify-otp')
async def verify_otp(username: str, otp: str):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if otp_store.get(user.email) == otp:
        current_time = datetime.now(IST)
        await User.filter(username=username).update(verified=True, verified_at=current_time)
        updated_user = await User.get(username=username)
        response = await user_pydantic.from_tortoise_orm(updated_user)
        
        del otp_store[user.email]
        return {"status": "ok", "message": "User verified successfully", "data": response}
    else:
        return {"status": "error", "message": "Invalusername OTP"}


@app.get('/users/{username}/verification-status')
async def get_verification_status(username):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    verification_expired = await check_verification_expired(user)
    
    user = await User.get(username=user.username)
    
    if user.verified:
        current_time = datetime.now(IST)
        elapsed_minutes = (current_time - user.verified_at).total_seconds() / 60
        remaining_minutes = max(0, 30 - elapsed_minutes)
        
        return {
            "status": "ok",
            "verified": True,
            "verified_at": user.verified_at.isoformat(),
            "remaining_minutes": round(remaining_minutes, 1)
        }
    else:
        return {
            "status": "ok",
            "verified": False,
            "message": "User is not verified" if not verification_expired else "Verification has expired"
        }


from endpoints import execute
app.include_router(execute.router, prefix="/execute", tags=["execute"])


db_file = 'db.sqlite3'

register_tortoise(
    app,
    db_url=f'sqlite://{db_file}',
    modules={'models': ['models']},
    generate_schemas=True,
    add_exception_handlers=True
)