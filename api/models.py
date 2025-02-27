from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import datetime
import pytz

from pydantic import BaseModel, EmailStr
from typing import Optional


IST = pytz.timezone('Asia/Kolkata')

def current_ist_time():
    return datetime.now(IST)

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    password: Optional[str]

class User(models.Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    created_at = fields.DatetimeField(default=current_ist_time, immutable=True)
    python_functions = fields.IntField(default=0)
    javascript_functions = fields.IntField(default=0)
    cost = fields.FloatField(default=0.0)
    

    

class Function(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="functions")
    name = fields.CharField(max_length=255)
    language = fields.CharField(max_length=50)
    code = fields.TextField()
    dependencies = fields.TextField(null=True, blank=True)
    run_count = fields.IntField(default=0)

class Log(models.Model):
    id = fields.IntField(pk=True)
    function = fields.ForeignKeyField("models.Function", related_name="logs")
    timestamp = fields.DatetimeField(default=current_ist_time, auto_now_add=True)
    output = fields.TextField()
    error = fields.TextField(null=True, blank=True)

user_pydantic = pydantic_model_creator(User, name="User")
user_pydanticIn = pydantic_model_creator(User, name="UserIn", exclude_readonly=True)

function_pydantic = pydantic_model_creator(Function, name="Function")
function_pydanticIn = pydantic_model_creator(Function, name="FunctionIn", exclude_readonly=True)
log_pydantic = pydantic_model_creator(Log, name="Log")
log_pydanticIn = pydantic_model_creator(Log, name="LogIn", exclude_readonly=True)



