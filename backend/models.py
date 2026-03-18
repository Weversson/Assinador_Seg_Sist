from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    key_pair = relationship("KeyPair", back_populates="user", uselist=False)
    signatures = relationship("Signature", back_populates="user")

class KeyPair(Base):
    __tablename__ = 'key_pairs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    public_key = Column(Text, nullable=False)
    private_key = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="key_pair")

class Signature(Base):
    __tablename__ = 'signatures'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_hash = Column(String, nullable=False)
    signature_data = Column(Text, nullable=False)
    algorithm = Column(String, default="SHA256withRSA")
    user_agent = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="signatures")

class VerificationLog(Base):
    __tablename__ = 'verification_logs'
    id = Column(Integer, primary_key=True, index=True)
    signature_id = Column(String, ForeignKey('signatures.id'))
    ip_address = Column(String)
    user_agent = Column(Text)
    status = Column(Boolean, nullable=False)
    verified_at = Column(DateTime, default=datetime.utcnow)
