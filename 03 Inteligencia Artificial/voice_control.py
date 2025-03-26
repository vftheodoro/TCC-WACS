import speech_recognition as sr
import pyttsx3
from decision_engine import WheelchairAI
import time

class VoiceController:
    def __init__(self, use_mic=True):
        self.ai = WheelchairAI()
        self.recognizer = sr.Recognizer()
        self.use_mic = use_mic
        self.wake_word = "vacs"
        self.last_command_time = time.time()
        
        # Configuração do motor de voz
        self.engine = pyttsx3.init()
        self._configure_voice()
    
    def _configure_voice(self):
        """Configura voz em português"""
        voices = self.engine.getProperty('voices')
        for voice in voices:
            if 'pt-br' in voice.id.lower() or 'português' in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                self.engine.setProperty('rate', 160)
                self.engine.setProperty('volume', 1.0)
                break

    def speak(self, text: str):
        """Síntese de voz com tratamento de erros"""
        try:
            print(f"🤖: {text}")
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            print(f"Erro na síntese de voz: {str(e)}")

    def _process_audio(self, audio):
        """Processa o áudio capturado"""
        try:
            text = self.recognizer.recognize_google(audio, language='pt-BR').lower()
            print(f"👤: {text}")
            
            if self.wake_word in text:
                command = text.replace(self.wake_word, '').strip()
                return self.ai.process_command(command)
            
            return {'status': 'wake_word_missing'}
        
        except sr.UnknownValueError:
            return {'status': 'not_understood'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def listen_loop(self):
        """Loop principal de escuta contínua"""
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            print("\n🔊 Sistema de voz ativado")
            
            while True:
                try:
                    audio = self.recognizer.listen(source, timeout=3, phrase_time_limit=5)
                    result = self._process_audio(audio)
                    
                    if result.get('status') == 'wake_word_missing':
                        self.speak("Por favor, diga VACS antes do comando")
                    elif result.get('type') == 'action':
                        self._handle_action(result)
                    elif result.get('type') == 'info':
                        self.speak(result['answer'])
                    
                except sr.WaitTimeoutError:
                    pass
                except KeyboardInterrupt:
                    self.speak("Sistema desligado")
                    break

    def _handle_action(self, result):
        """Executa ações físicas simuladas"""
        action_map = {
            'forward': "movendo para frente",
            'backward': "recuando",
            'left': "girando para esquerda",
            'right': "girando para direita",
            'stop': "parando emergência"
        }
        action = action_map.get(result['command'], "executando comando")
        status = "✅ Segurança verificada" if result['safety_check'] else "⛔ Obstáculo detectado!"
        self.speak(f"{action}. {status}")