from pydantic import BaseModel

class Personnage(BaseModel):
    nom: str
    classe: str
    pv:int
    niveau:int
    attaque:int
    defense:int