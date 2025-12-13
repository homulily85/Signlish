from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

from service.text_to_sign_service import text_to_sign

router = APIRouter()

class TextRequest(BaseModel):
    text: str
@router.post("/text-to-sign/")
async def get_dictionary(req: TextRequest):
    result_file_path = text_to_sign(req.text)
    return FileResponse(result_file_path)