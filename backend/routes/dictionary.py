import csv

from fastapi import APIRouter

from models.dictionary_item import DictionaryItem

router = APIRouter()

dictionary_data = []

with open("data/words.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        dictionary_data.append(DictionaryItem(**row))

@router.get("/dictionary")
async def get_dictionary():
    return dictionary_data