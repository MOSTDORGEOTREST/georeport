from fastapi import APIRouter, Depends, Response, status, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, RedirectResponse
import re

from services.depends import get_s3_service
from services.s3 import S3Service
from config import configs

router = APIRouter(
    prefix="/s3",
    tags=['s3'])

file_key_pattern = r'georeport/files/[a-f0-9]{40}-.*'

@router.get("/")
async def get(
        key: str,
        s3_service: S3Service = Depends(get_s3_service)
):
    '''Получение файлов'''
    if re.fullmatch(file_key_pattern, key) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Key have a wrong format"
        )
    presigned_url = await s3_service.generate_presigned_url(key=key)

    return RedirectResponse(url=presigned_url)
