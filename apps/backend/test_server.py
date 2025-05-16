from fastapi import FastAPI
import uvicorn
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    try:
        logger.info("Iniciando el servidor de prueba...")
        uvicorn.run(app, host="127.0.0.1", port=8080)
    except Exception as e:
        logger.error(f"Error al iniciar el servidor: {str(e)}")
        raise 