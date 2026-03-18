from fastapi import FastAPI, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, crypto_utils
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "postgresql://postgres:senha_segura@db:5432/assinatura_db" 
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Assinatura Digital")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    password: str

class SignRequest(BaseModel):
    user_id: int
    document_hash: str

@app.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(username=user.username, password_hash=user.password + "_hashed")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    pub_key, priv_key = crypto_utils.generate_rsa_key_pair()
    db_keys = models.KeyPair(user_id=db_user.id, public_key=pub_key, private_key=priv_key)
    db.add(db_keys)
    db.commit()
    return {"message": "Usuario criado com sucesso", "user_id": db_user.id}

@app.post("/api/signatures/sign")
def sign_document(request_data: SignRequest, req: Request, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == request_data.user_id).first()
    if not user or not user.key_pair:
        raise HTTPException(status_code=404, detail="Usuario ou chaves nao encontrados")
    user_agent = req.headers.get("user-agent", "Unknown")
    signature_b64 = crypto_utils.sign_data(user.key_pair.private_key, request_data.document_hash)
    new_signature = models.Signature(
        user_id=user.id,
        document_hash=request_data.document_hash,
        signature_data=signature_b64,
        user_agent=user_agent
    )
    db.add(new_signature)
    db.commit()
    db.refresh(new_signature)
    return {"signature_id": new_signature.id}

@app.get("/api/signatures/verify/{sig_id}")
def verify_signature(sig_id: str, req: Request, db: Session = Depends(get_db)):
    signature = db.query(models.Signature).filter(models.Signature.id == sig_id).first()
    user_agent = req.headers.get("user-agent", "Unknown")
    ip_address = req.client.host if req.client else "Unknown"
    
    if not signature:
        log = models.VerificationLog(signature_id=None, ip_address=ip_address, user_agent=user_agent, status=False)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=404, detail="Assinatura nao encontrada")

    user = db.query(models.User).filter(models.User.id == signature.user_id).first()
    is_valid = crypto_utils.verify_signature(user.key_pair.public_key, signature.document_hash, signature.signature_data)
    
    log = models.VerificationLog(signature_id=signature.id, ip_address=ip_address, user_agent=user_agent, status=is_valid)
    db.add(log)
    db.commit()
    
    return {
        "status": "VALIDA" if is_valid else "INVALIDA",
        "signatario": user.username,
        "algoritmo": signature.algorithm,
        "data": signature.created_at.strftime("%d/%m/%Y %H:%M")
    }