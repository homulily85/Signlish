from typing import Union

from pydantic import BaseModel


class DictionaryItem(BaseModel):
    id: Union[int, str]
    word: str
    definition: str
    instruction: str
    source: str
    category: str
