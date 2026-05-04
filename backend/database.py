from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from sqlalchemy import Column, Integer, String
import os 

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

engine = create_engine(
    DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Personnage(Base):
    __tablename__ = "personnages"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    classe = Column(String)
    niveau = Column(Integer)
    pv = Column(Integer)
    attaque = Column(Integer)
    defense = Column(Integer)