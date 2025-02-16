from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
import openai
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()
logger.info(f"MODEL_NAME: {os.getenv('MODEL_NAME')}")
logger.info(f"API Key configurada: {'Sí' if os.getenv('OPENAI_API_KEY') else 'No'}")

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL de tu aplicación Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 