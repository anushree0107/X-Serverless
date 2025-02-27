from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from models import (user_pydantic, User, user_pydanticIn, UserUpdate, function_pydanticIn, function_pydantic, Function, log_pydantic, log_pydanticIn, Log)
from config import conf
import bcrypt
import random
import string

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fm = FastMail(conf)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

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

@app.get('/users/{user_id}')
async def get_user(user_id: int):
    user = await User.get_or_none(id=user_id)
    if user:
        response = await user_pydanticIn.from_tortoise_orm(user)
        return {"status": "ok", "data": response}
    else:
        return {"status": "error", "message": "User not found"}

@app.post('/users/{user_id}/request-otp')
async def request_otp(user_id: int, background_tasks: BackgroundTasks):
    user = await User.get_or_none(id=user_id)
    if user:
        otp = generate_otp()
        otp_store[user.email] = otp
        message = MessageSchema(
            subject="Your OTP Code",
            recipients=[user.email],
            body=f"Your OTP code is {otp}",
            subtype="plain"
        )
        await fm.send_message(message)
        return {"status": "ok", "message": "OTP sent to your email"}
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.put('/users/{user_id}/verify-otp')
async def verify_otp(user_id: int, otp: str, user_info: UserUpdate):
    user = await User.get_or_none(id=user_id)
    if user:
        if otp_store.get(user.email) == otp:
            update_data = user_info.dict(exclude_unset=True)
            if "password" in update_data:
                update_data["password_hash"] = hash_password(update_data.pop("password"))
            await User.filter(id=user_id).update(**update_data)
            updated_user = await User.get(id=user_id)
            response = await user_pydantic.from_tortoise_orm(updated_user)
            del otp_store[user.email]
            return {"status": "ok", "data": response}
        else:
            return {"status": "error", "message": "Invalid OTP"}
    else:
        raise HTTPException(status_code=404, detail="User not found")

register_tortoise(
    app,
    db_url='sqlite://db.sqlite3',
    modules={'models': ['models']},
    generate_schemas=True,
    add_exception_handlers=True
)