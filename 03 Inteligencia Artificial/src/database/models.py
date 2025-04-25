# src/database/models.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'usuarios'
    
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    preferencias = relationship("PreferenciaUsuario", back_populates="usuario")
    
class Local(Base):
    __tablename__ = 'locais'
    
    id = Column(Integer, primary_key=True)
    nome = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    tipo = Column(String(50))
    recursos = relationship("RecursoAcessibilidade", back_populates="local")
    
class RecursoAcessibilidade(Base):
    __tablename__ = 'recursos_acessibilidade'
    
    id = Column(Integer, primary_key=True)
    local_id = Column(Integer, ForeignKey('locais.id'))
    tipo = Column(String(50), nullable=False)
    descricao = Column(String(200))
    validado = Column(Boolean, default=False)
    local = relationship("Local", back_populates="recursos")