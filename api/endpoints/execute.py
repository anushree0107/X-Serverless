import os
import re
import json
import subprocess
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models import User, Function, Log


def extract_imports(code: str) -> list:
    import_statements = re.findall(r'^(?:import|from)\s+([^\s]+)', code, re.MULTILINE)
    
    consolidated_imports = set()
    for imp in import_statements:
        if '.' in imp:
            main_module = imp.split('.')[0]
            consolidated_imports.add(main_module)
        else:
            consolidated_imports.add(imp)
    
    return list(consolidated_imports)

def extract_js_imports(code: str) -> list:
    require_statements = re.findall(r'require\([\'"]([^\'")]+)[\'"]', code)
    
    import_statements = re.findall(r'import\s+.*\s+from\s+[\'"]([^\'")]+)[\'"]', code)
    
    destructure_imports = re.findall(r'import\s+\{[^}]*\}\s+from\s+[\'"]([^\'")]+)[\'"]', code)
    
    all_imports = set(require_statements + import_statements + destructure_imports)
    
    package_imports = {imp for imp in all_imports if not (imp.startswith('./') or imp.startswith('../'))}
    
    return list(package_imports)


router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str
    name: str = "Unnamed Function"
    username : str 

@router.post("/python")
async def execute_python_code(request: CodeExecutionRequest):
    user = await User.get_or_none(username=request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User is not verified. Please verify your account first.")
    
    user_code = request.code
    
    function, created = await Function.get_or_create(
        user=user,
        name=request.name,
        language="python",
        defaults={"code": user_code}
    )
    
    if not created:
        function.code = user_code
        await function.save()
    
    user_code_path = "docker/python_executor/user_code.py"
    requirements_path = "docker/python_executor/requirements.txt"
    
    with open(user_code_path, "w") as code_file:
        code_file.write(user_code)
    
    imports = extract_imports(user_code)
    function.dependencies = json.dumps(imports)
    await function.save()
    
    with open(requirements_path, "w") as req_file:
        req_file.write("\n".join(imports))
        
    build_command = ["docker", "build", "-t", "python_executor", "docker/python_executor"]
    build_process = subprocess.run(build_command, capture_output=True, text=True)
    
    if build_process.returncode != 0:
        error_msg = f"Error building Docker image: {build_process.stderr}"
        await Log.create(
            function=function,
            error=error_msg
        )
        raise HTTPException(status_code=500, detail=error_msg)
    
    run_command = ["docker", "run", "--rm", "python_executor"]
    run_process = subprocess.run(run_command, capture_output=True, text=True)
    
    user.python_functions += 1
    user.cost += 0.01  # Add $0.01 per execution
    await user.save()
    
    function.run_count += 1
    await function.save()
    
    log = await Log.create(
        function=function,
        output=run_process.stdout,
        error=run_process.stderr if run_process.returncode != 0 else None
    )
    
    return {
        "output": run_process.stdout, 
        "error": run_process.stderr,
        "cost": 0.01,
        "total_cost": user.cost,
        "run_count": function.run_count
    }


@router.post("/javascript")
async def execute_javascript_code(request: CodeExecutionRequest):
    user = await User.get_or_none(username=request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User is not verified. Please verify your account first.")
    
    user_code = request.code
    
    function, created = await Function.get_or_create(
        user=user,
        name=request.name,
        language="javascript",
        defaults={"code": user_code}
    )
    
    if not created:
        function.code = user_code
        await function.save()
    
    user_code_path = "docker/js_executor/user_code.js"
    package_json_path = "docker/js_executor/package.json"
    
    with open(user_code_path, "w") as code_file:
        code_file.write(user_code)
    
    packages = extract_js_imports(user_code)
    function.dependencies = json.dumps(packages)
    await function.save()
    
    package_json = {
        "name": "js-execution",
        "version": "1.0.0",
        "description": "JavaScript code execution",
        "main": "user_code.js",
        "dependencies": {}
    }
    
    for pkg in packages:
        package_json["dependencies"][pkg] = "latest"
    
    with open(package_json_path, "w") as json_file:
        json.dump(package_json, json_file, indent=2)
        
    build_command = ["docker", "build", "-t", "js_executor", "docker/js_executor"]
    build_process = subprocess.run(build_command, capture_output=True, text=True)
    
    if build_process.returncode != 0:
        error_msg = f"Error building Docker image: {build_process.stderr}"
        await Log.create(
            function=function,
            error=error_msg
        )
        raise HTTPException(status_code=500, detail=error_msg)
    
    run_command = ["docker", "run", "--rm", "js_executor"]
    run_process = subprocess.run(run_command, capture_output=True, text=True)
    
    user.javascript_functions += 1
    user.cost += 0.01  # Add $0.01 per execution
    await user.save()
    
    function.run_count += 1
    await function.save()
    
    log = await Log.create(
        function=function,
        output=run_process.stdout,
        error=run_process.stderr if run_process.returncode != 0 else None
    )
    
    return {
        "output": run_process.stdout, 
        "error": run_process.stderr,
        "cost": 0.01,
        "total_cost": user.cost,
        "run_count": function.run_count
    }


@router.get("/functions/{username}")
async def get_user_functions(username: str):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User is not verified. Please verify your account first.")
    
    functions = await Function.filter(user=user).all()
    result = []
    for func in functions:
        result.append({
            "id": func.id,
            "name": func.name,
            "language": func.language,
            "run_count": func.run_count,
            "code": func.code,
            "dependencies": json.loads(func.dependencies) if func.dependencies else []
        })
    return result


@router.get("/function/{function_id}/user/{username}")
async def get_function(function_id: int, username: str):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User is not verified. Please verify your account first.")
    
    function = await Function.get_or_none(id=function_id, user=user)
    if not function:
        raise HTTPException(status_code=404, detail="Function not found")
    
    logs = await Log.filter(function=function).order_by("-timestamp").limit(10).all()
    log_data = []
    for log in logs:
        log_data.append({
            "id": log.id,
            "timestamp": log.timestamp,
            "output": log.output,
            "error": log.error
        })
    
    return {
        "id": function.id,
        "name": function.name,
        "language": function.language,
        "code": function.code,
        "dependencies": json.loads(function.dependencies) if function.dependencies else [],
        "run_count": function.run_count,
        "logs": log_data
    }


@router.get("/usage/{username}")
async def get_user_usage(username: str):
    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User is not verified. Please verify your account first.")
    
    return {
        "python_functions": user.python_functions,
        "javascript_functions": user.javascript_functions,
        "total_functions": user.python_functions + user.javascript_functions,
        "cost": user.cost
    }