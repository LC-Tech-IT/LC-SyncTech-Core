from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models, database

# Esta línea crea las tablas automáticamente al iniciar
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="LC Tech Control Hub API")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a LC Tech Control Hub - Sistema Operativo"}

@app.get("/health")
def health_check():
    return {"status": "online", "database": "connected"}