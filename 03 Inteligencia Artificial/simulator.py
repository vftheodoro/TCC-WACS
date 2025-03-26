from voice_control import VoiceController
import threading

class IA_Simulator:
    def __init__(self):
        self.controller = VoiceController(use_mic=True)
        
    def start(self):
        print("=== Sistema VACS - Modo Voz Ativo ===")
        print("Diga 'VACS' seguido do comando...\n")
        
        # Thread para escuta contínua
        voice_thread = threading.Thread(target=self.controller.listen_loop)
        voice_thread.daemon = True
        voice_thread.start()
        
        # Mantém o programa rodando
        try:
            while True: pass
        except KeyboardInterrupt:
            print("\n🛑 Sistema encerrado")

if __name__ == "__main__":
    simulator = IA_Simulator()
    simulator.start()