from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Annotated
import os
from dotenv import load_dotenv
import openai
import logging
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
import pandas as pd
import io

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()
logger.info(f"MODEL_NAME: {os.getenv('MODEL_NAME')}")
logger.info(f"API Key configurada: {'Sí' if os.getenv('OPENAI_API_KEY') else 'No'}")

# Verificar el perfil de desarrollo
DEVELOPMENT_PROFILE = os.getenv("DEVELOPMENT_PROFILE", "production")

# Configuración de la base de datos
DATABASE_URL = "postgresql+psycopg://truc0:retrucovale4@localhost/trazaNet"

# Modelo SQLAlchemy para la base de datos
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    dicose = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

# Variables globales para la base de datos
engine = None
SessionLocal = None

# Función para inicializar la base de datos
def init_db():
    global engine, SessionLocal
    try:
        logger.info("Intentando conectar a la base de datos...")
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
        logger.info("Conexión a la base de datos establecida exitosamente")
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {str(e)}")
        raise

# Dependencia para obtener la sesión de la base de datos
def get_db() -> Session:
    if SessionLocal is None:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Tipo anotado para la dependencia de la base de datos
DB = Annotated[Session, Depends(get_db)]

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Configurar OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        logger.info("Recibida solicitud de chat")
        # Convertir los mensajes al formato esperado por OpenAI
        formatted_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        logger.info(f"Mensajes formateados: {formatted_messages}")
        
        # Realizar la llamada a la API de OpenAI
        logger.info("Llamando a la API de OpenAI...")
        completion = openai.ChatCompletion.create(
            model=os.getenv("MODEL_NAME", "gpt-3.5-turbo"),
            messages=formatted_messages
        )
        logger.info("Respuesta recibida de OpenAI")
        
        # Extraer y devolver la respuesta
        response = completion.choices[0].message
        logger.info(f"Respuesta formateada: {response}")
        
        return {
            "role": response.role,
            "content": response.content
        }
    except Exception as e:
        logger.error(f"Error en chat_with_ai: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Modelo Pydantic para la API
class UserCreate(BaseModel):
    dicose: str
    email: str
    password: str
    phone: str
    is_admin: bool = False

class UserResponse(BaseModel):
    id: int
    dicose: str
    email: str
    phone: str
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

# Nuevos endpoints para usuarios
@app.post("/api/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: DB):
    # Aquí deberías agregar la lógica para hashear la contraseña
    db_user = User(
        dicose=user.dicose,
        email=user.email,
        phone=user.phone,
        hashed_password=user.password,  # En un caso real, deberías hashear la contraseña
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/", response_model=List[UserResponse])
def read_users(db: DB, skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

class Animal(BaseModel):
    dispositivo: str
    nombre_propietario: str
    edad_meses: int
    peso_kg: float
    raza: str
    sexo: str

@app.post("/api/excel/upload")
async def upload_excel(file: UploadFile = File(...)):
    try:
        logger.info(f"Recibiendo archivo: {file.filename}")
        
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Convertir DataFrame a lista de diccionarios
        animales = df.to_dict('records')
        logger.info(f"Datos procesados: {len(animales)} animales")
        
        return {"message": "Archivo procesado correctamente", "data": animales}
    except Exception as e:
        logger.error(f"Error al procesar el archivo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/excel/data")
async def get_excel_data():
    try:
        # Por ahora, devolvemos datos de ejemplo
        return [
            {
                "dispositivo": "12345",
                "nombre_propietario": "Juan Pérez",
                "edad_meses": 24,
                "peso_kg": 450.5,
                "raza": "Holstein",
                "sexo": "F"
            }
        ]
    except Exception as e:
        logger.error(f"Error al obtener datos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.middleware("http")
async def dev_auth_middleware(request: Request, call_next):
    if DEVELOPMENT_PROFILE == "dev123":
        # Omite la autenticación en el perfil de desarrollo
        response = await call_next(request)
        return response
    else:
        # Aquí puedes agregar la lógica de autenticación para otros perfiles
        # Por ejemplo, verificar un token de autorización
        response = await call_next(request)
        return response

if __name__ == "__main__":
    import uvicorn
    try:
        logger.info("Iniciando el servidor...")
        uvicorn.run(
            app,
            host="0.0.0.0",  # Permite conexiones desde cualquier interfaz
            port=3001,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Error al iniciar el servidor: {str(e)}")
        raise 