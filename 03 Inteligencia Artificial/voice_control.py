# voice_control.py
import speech_recognition as sr
import pyttsx3
import time
import logging
import threading
from typing import Dict, Optional
from decision_engine import WheelchairAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceController:
    def __init__(self, use_mic: bool = True):
        self.ai = WheelchairAI()
        self.recognizer = sr.Recognizer()
        self.mic = sr.Microphone() if use_mic else None
        self.wake_word = "vacs"
        self.command_lock = threading.Lock()
        self.last_command = None
        
        self.tts_engine = self._init_tts()
        self._configure_voice()
        self._calibrate_microphone()

    def _init_tts(self) -> pyttsx3.Engine:
        """Inicializa o sistema de síntese de voz"""
        try:
            engine = pyttsx3.init()
            engine.setProperty('rate', 160)
            return engine
        except Exception as e:
            logger.error(f"Erro na inicialização do TTS: {e}")
            raise

    def _configure_voice(self):
        """Configura voz em português brasileiro"""
        voices = self.tts_engine.getProperty('voices')
        pt_voice = next((v for v in voices if 'pt_br' in v.id.lower()), None)
        
        if pt_voice:
            self.tts_engine.setProperty('voice', pt_voice.id)
            self.tts_engine.setProperty('volume', 0.8)
        else:
            logger.warning("Voz PT-BR não encontrada, usando padrão")

    def _calibrate_microphone(self):
        """Calibração inicial do microfone"""
        if self.mic:
            with self.mic as source:
                logger.info("Calibrando microfone...")
                self.recognizer.adjust_for_ambient_noise(source, duration=2)
                self.recognizer.dynamic_energy_threshold = True

    def speak(self, text: str):
        """Sistema de fala com buffer e priorização"""
        with self.command_lock:
            try:
                logger.info(f"Resposta: {text}")
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
                time.sleep(0.5)  # Prevenção de overlap de áudio
            except RuntimeError as e:
                logger.error(f"Erro na síntese de voz: {e}")

    def listen_loop(self):
        """Loop principal de escuta com tratamento de erros"""
        while True:
            try:
                if self.mic is None:
                    raise ValueError("Microfone não configurado")
                
                with self.mic as source:
                    audio = self.recognizer.listen(
                        source, 
                        timeout=3,
                        phrase_time_limit=5
                    )
                    self.process_audio(audio)
                    
            except sr.WaitTimeoutError:
                continue
            except Exception as e:
                logger.error(f"Erro na captura de áudio: {e}")
                time.sleep(1)

    def process_audio(self, audio):
        """Processamento centralizado de áudio"""
        try:
            text = self.recognizer.recognize_google(audio, language='pt-BR').lower()
            logger.info(f"Comando detectado: {text}")
            
            if self.wake_word in text:
                command = text.split(self.wake_word, 1)[1].strip()
                response = self.ai.process_command(command)
                self.handle_response(response)
            else:
                self.speak("Por favor inicie o comando com VACS")

        except sr.UnknownValueError:
            self.speak("Não entendi o comando")
        except Exception as e:
            logger.error(f"Erro no processamento: {e}")
            self.speak("Ocorreu um erro interno")

    def handle_response(self, response: Dict):
        """Gerencia diferentes tipos de resposta"""
        if response['type'] == 'emergency':
            self._emergency_protocol(response)
        elif response['type'] == 'action':
            self._execute_action(response)
        elif response['type'] == 'info':
            self.speak(response['answer'])
        else:
            self.speak("Comando não reconhecido")

    def _emergency_protocol(self, response: Dict):
        """Protocolo de emergência prioritário"""
        self.speak(f"⚠️ {response['message']} ⚠️")
        # Implementar ações físicas de emergência aqui

    def _execute_action(self, response: Dict):
        """Executa ações com verificação de segurança"""
        if response['safety_ok']:
            self.speak(f"{response['confirmation']} ✅")
        else:
            self.speak(f"⛔ {response['warning']}")