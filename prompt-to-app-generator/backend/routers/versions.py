from fastapi import APIRouter
from pydantic import BaseModel
import time
import uuid

router = APIRouter(prefix="/api/versions", tags=["versions"])

class BranchRequest(BaseModel):
    name: str

class RevertRequest(BaseModel):
    commitId: str

# In-memory history
versions_db = [
    { "id": "a1b2c3d", "message": "Add dark mode toggle to header", "time": "10 mins ago", "author": "AI Agent" },
    { "id": "f4e5d6c", "message": "Implement user authentication flow", "time": "2 hours ago", "author": "AI Agent" },
    { "id": "7g8h9i0", "message": "Initial project generation from prompt", "time": "1 day ago", "author": "System" },
]

@router.get("/")
async def get_versions():
    time.sleep(0.5)
    return versions_db

@router.post("/branch")
async def create_branch(req: BranchRequest):
    time.sleep(0.8)
    return { "success": True, "message": f"Branch '{req.name}' created." }

@router.post("/revert")
async def revert_commit(req: RevertRequest):
    time.sleep(1)
    # Mock reverting
    new_commit = {
        "id": str(uuid.uuid4())[:7],
        "message": f"Revert to {req.commitId}",
        "time": "Just now",
        "author": "User"
    }
    versions_db.insert(0, new_commit)
    return { "success": True, "commit": new_commit }
