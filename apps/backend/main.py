from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import logging
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, Float
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
import pandas as pd
import io
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:retrucovale4@localhost:5432/trazanet")

# Configuración de JWT
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

class Animal(Base):
    __tablename__ = "animales"
    
    id = Column(Integer, primary_key=True, index=True)
    dispositivo = Column(String, index=True)
    raza = Column(String)
    cruza = Column(String)
    sexo = Column(String)
    edad_meses = Column(Integer)
    edad_dias = Column(Integer)
    propietario = Column(String)
    nombre_propietario = Column(String)
    ubicacion = Column(String)
    tenedor = Column(String)
    status_vida = Column(String)
    status_trazabilidad = Column(String)
    errores = Column(String)
    fecha_identificacion = Column(Date)
    fecha_registro = Column(Date)
    user_id = Column(Integer, index=True)
    largo_pelvis = Column(Float)
    ancho_pelvis = Column(Float)

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
        
        # Crear todas las tablas
        logger.info("Creando tablas en la base de datos...")
        Base.metadata.drop_all(bind=engine)  # Eliminar tablas existentes
        Base.metadata.create_all(bind=engine)  # Crear tablas nuevamente
        
        # Verificar que las tablas se crearon
        with engine.connect() as conn:
            result = conn.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [row[0] for row in result]
            logger.info(f"Tablas creadas: {tables}")
        
        logger.info("Conexión a la base de datos establecida exitosamente")
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {str(e)}")
        raise

# Dependencia para obtener la sesión de la base de datos
def get_db():
    if SessionLocal is None:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Funciones de utilidad para autenticación
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudo validar la credencial",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Modelos Pydantic
class UserBase(BaseModel):
    email: str
    dicose: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    dicose: str
    phone: Optional[str]
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Endpoints de autenticación
@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        dicose=user.dicose,
        phone=user.phone,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Endpoints de Excel
@app.post("/api/excel/upload")
async def upload_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Iniciando procesamiento del archivo: {file.filename}")
        logger.info(f"Usuario actual: {current_user.email}")
        
        contents = await file.read()
        logger.info(f"Archivo leído, tamaño: {len(contents)} bytes")
        
        df = pd.read_excel(io.BytesIO(contents))
        logger.info(f"DataFrame creado con {len(df)} filas")
        logger.info(f"Columnas en el DataFrame: {df.columns.tolist()}")
        
        # Verificar si hay datos duplicados
        dispositivos = df['dispositivo'].dropna().tolist()  # Ignorar valores nulos
        if not dispositivos:
            raise HTTPException(
                status_code=400,
                detail="El archivo no contiene dispositivos válidos"
            )
            
        dispositivos_existentes = db.query(Animal.dispositivo).filter(
            Animal.dispositivo.in_(dispositivos),
            Animal.user_id == current_user.id
        ).all()
        dispositivos_existentes = [d[0] for d in dispositivos_existentes]
        
        if dispositivos_existentes:
            logger.warning(f"Se encontraron dispositivos duplicados: {dispositivos_existentes}")
            raise HTTPException(
                status_code=400,
                detail=f"Los siguientes dispositivos ya existen: {', '.join(dispositivos_existentes)}"
            )
        
        for index, row in df.iterrows():
            try:
                # Manejar campos vacíos
                dispositivo = str(row.get('dispositivo', '')).strip()
                if not dispositivo:
                    logger.warning(f"Fila {index + 1}: Dispositivo vacío, saltando...")
                    continue
                    
                # Convertir fechas de Excel a formato PostgreSQL, manejando valores nulos
                fecha_identificacion = None
                fecha_registro = None
                
                if pd.notna(row.get('fechaIdentificacion')):
                    try:
                        fecha_identificacion = pd.to_datetime(row.get('fechaIdentificacion')).date()
                    except Exception as e:
                        logger.warning(f"Error al convertir fechaIdentificacion en fila {index + 1}: {str(e)}")
                        
                if pd.notna(row.get('fechaRegistro')):
                    try:
                        fecha_registro = pd.to_datetime(row.get('fechaRegistro')).date()
                    except Exception as e:
                        logger.warning(f"Error al convertir fechaRegistro en fila {index + 1}: {str(e)}")
                
                # Manejar campos numéricos
                edad_meses = int(row.get('edadMeses', 0)) if pd.notna(row.get('edadMeses')) else 0
                edad_dias = int(row.get('edadDias', 0)) if pd.notna(row.get('edadDias')) else 0
                
                # Manejar campos de texto
                raza = str(row.get('raza', '')).strip() if pd.notna(row.get('raza')) else ''
                cruza = str(row.get('cruza', '')).strip() if pd.notna(row.get('cruza')) else ''
                sexo = str(row.get('sexo', '')).strip() if pd.notna(row.get('sexo')) else ''
                propietario = str(row.get('propietario', '')).strip() if pd.notna(row.get('propietario')) else ''
                nombre_propietario = str(row.get('nombrePropietario', '')).strip() if pd.notna(row.get('nombrePropietario')) else ''
                ubicacion = str(row.get('ubicacion', '')).strip() if pd.notna(row.get('ubicacion')) else ''
                tenedor = str(row.get('tenedor', '')).strip() if pd.notna(row.get('tenedor')) else ''
                status_vida = str(row.get('statusVida', '')).strip() if pd.notna(row.get('statusVida')) else ''
                status_trazabilidad = str(row.get('statusTrazabilidad', '')).strip() if pd.notna(row.get('statusTrazabilidad')) else ''
                errores = str(row.get('errores', '')).strip() if pd.notna(row.get('errores')) else ''
                
                logger.info(f"Procesando fila {index + 1}: dispositivo={dispositivo}")
                
                animal = Animal(
                    dispositivo=dispositivo,
                    raza=raza,
                    cruza=cruza,
                    sexo=sexo,
                    edad_meses=edad_meses,
                    edad_dias=edad_dias,
                    propietario=propietario,
                    nombre_propietario=nombre_propietario,
                    ubicacion=ubicacion,
                    tenedor=tenedor,
                    status_vida=status_vida,
                    status_trazabilidad=status_trazabilidad,
                    errores=errores,
                    fecha_identificacion=fecha_identificacion,
                    fecha_registro=fecha_registro,
                    user_id=current_user.id
                )
                db.add(animal)
                logger.info(f"Animal agregado a la sesión: {animal.dispositivo}")
            except Exception as e:
                logger.error(f"Error procesando fila {index + 1}: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error en fila {index + 1}: {str(e)}")
        
        db.commit()
        logger.info("Todos los animales fueron guardados exitosamente")
        return {"message": "Archivo procesado exitosamente"}
    except Exception as e:
        logger.error(f"Error al procesar el archivo: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/excel/data")
async def get_excel_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        logger.info(f"Obteniendo datos para el usuario: {current_user.email}")
        
        # Consultar los animales del usuario
        animales = db.query(Animal).filter(Animal.user_id == current_user.id).all()
        logger.info(f"Se encontraron {len(animales)} animales para el usuario")
        
        # Convertir los objetos a diccionarios
        resultado = [
            {
                "id": animal.id,
                "dispositivo": animal.dispositivo,
                "raza": animal.raza,
                "cruza": animal.cruza,
                "sexo": animal.sexo,
                "edadMeses": animal.edad_meses,
                "edadDias": animal.edad_dias,
                "propietario": animal.propietario,
                "nombrePropietario": animal.nombre_propietario,
                "ubicacion": animal.ubicacion,
                "tenedor": animal.tenedor,
                "statusVida": animal.status_vida,
                "statusTrazabilidad": animal.status_trazabilidad,
                "errores": animal.errores,
                "fechaIdentificacion": animal.fecha_identificacion.isoformat() if animal.fecha_identificacion else None,
                "fechaRegistro": animal.fecha_registro.isoformat() if animal.fecha_registro else None
            }
            for animal in animales
        ]
        
        logger.info(f"Datos convertidos a formato JSON: {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener datos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001) 