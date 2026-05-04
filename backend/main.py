from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import model
from .database import SessionLocal, engine, Personnage, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En développement, on autorise tout
    allow_credentials=True,
    allow_methods=["*"], # Autorise GET, POST, etc.
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/personnages") 
async def liste_personnages(db: Session = Depends(get_db)):
    return db.query(Personnage).all()

@app.post("/personnages")
async def creer_peronnage(perso_data: model.Personnage, db: Session = Depends(get_db)):
    new_personnage = Personnage(
        nom = perso_data.nom, classe = perso_data.classe, niveau = perso_data.niveau, pv = perso_data.pv, attaque = perso_data.attaque, defense = perso_data.defense
    )

    try:
        db.add(new_personnage)
        db.commit()
        db.refresh(new_personnage)
        return new_personnage
    except Exception as e:
        db.rollback()
        return f"Erreur: {e}"
    
@app.delete("/personnages/{id}")
async def supprimer_personnage(id: int,db: Session = Depends(get_db)):
    if not id:
        raise HTTPException(status_code=404, detail="Item non trouvé")
    personnage = db.query(Personnage).filter(Personnage.id == id).first()
    try:
        db.delete(personnage)
        db.commit()
    except Exception as e:
        db.rollback()
        return f"Erreur: {e}"

@app.patch("/personnages/{id}/levelup")
async def level_up(id: int, db: Session = Depends(get_db)):
#   niveau   += 1
#   pv       += 20
#   attaque  += 5
#   defense  += 3
    
    if not id:
        raise HTTPException(status_code=404, detail="Item non trouvé")
    personnage = db.query(Personnage).filter(Personnage.id == id).first()   
    try:
        personnage.niveau += 1
        personnage.pv +=  20
        personnage.attaque += 5
        personnage.defense += 3
        db.commit()
        db.refresh(personnage) # Indispensable pour récupérer les nouvelles valeurs
        
        return personnage
    except Exception as e:
        db.rollback()
        return f"Erreur: {e}"
    