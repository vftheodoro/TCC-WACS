# simulator.py
import signal
import sys
from voice_control import VoiceController
import logging

class VACSSimulator:
    def __init__(self):
        self.running = False
        self.controller = VoiceController(use_mic=True)
        self._setup_signal_handlers()

    def _setup_signal_handlers(self):
        """Configura tratamento de sinais de sistema"""
        signal.signal(signal.SIGINT, self._graceful_shutdown)
        signal.signal(signal.SIGTERM, self._graceful_shutdown)

    def _graceful_shutdown(self, signum, frame):
        """Desligamento seguro do sistema"""
        logging.info("Iniciando desligamento controlado...")
        self.running = False
        self.controller.speak("Sistema sendo desligado com segurança")
        sys.exit(0)

    def start(self):
        """Inicia o sistema principal"""
        self.running = True
        logging.info("=== Sistema VACS - Versão 2.0 ===")
        self.controller.speak("Sistema VACS inicializado e pronto para uso")
        
        try:
            self.controller.listen_loop()
        except KeyboardInterrupt:
            self._graceful_shutdown(None, None)

if __name__ == "__main__":
    simulator = VACSSimulator()
    simulator.start()