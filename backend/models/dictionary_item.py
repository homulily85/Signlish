from pydantic import BaseModel


class DictionaryItem(BaseModel):
    id: str
    word: str
    definition: str
    instruction: str
    source: str
    category: str
