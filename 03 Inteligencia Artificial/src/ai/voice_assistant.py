# src/ai/voice_assistant.py
import speech_recognition as sr
import pyttsx3
from ..utils.logger import setup_logger
from ..database.models import Local, RecursoAcessibilidade
from config import VOICE_CONFIG, SPEECH_CONFIG

logger = setup_logger(__name__)

class VoiceAssistant:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self._configure_voice()
        
    def _configure_voice(self):
        self.engine.setProperty('rate', VOICE_CONFIG['rate'])
        self.engine.setProperty('volume', VOICE_CONFIG['volume'])
        voices = self.engine.getProperty('voices')
        # Configurar voz em português se disponível
        for voice in voices:
            if "brazil" in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                break
                
    def listen(self):
        with sr.Microphone() as source:
            logger.info("Aguardando comando...")
            self.recognizer.adjust_for_ambient_noise(source)
            try:
                audio = self.recognizer.listen(source, 
                                             timeout=SPEECH_CONFIG['timeout'],
                                             phrase_time_limit=SPEECH_CONFIG['phrase_time_limit'])
                text = self.recognizer.recognize_google(audio, language=SPEECH_CONFIG['language'])
                logger.info(f"Comando reconhecido: {text}")
                return text
            except sr.UnknownValueError:
                logger.error("Não foi possível entender o áudio")
                return None
            except sr.RequestError as e:
                logger.error(f"Erro na requisição ao serviço de reconhecimento: {e}")
                return None
                
    def speak(self, text):
        logger.info(f"Assistente falando: {text}")
        self.engine.say(text)
        self.engine.runAndWait()