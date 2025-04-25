# main.py
import os
from src.ai.voice_assistant import VoiceAssistant
from src.ai.mapping import AccessibilityMapper
from src.utils.logger import setup_logger
from config import PROJECT_ROOT, DATA_DIR, MODELS_DIR, LOGS_DIR

def setup_directories():
    """Criar estrutura de diretórios necessária"""
    for directory in [DATA_DIR, MODELS_DIR, LOGS_DIR]:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Diretório criado: {directory}")

def main():
    # Configurar diretórios
    setup_directories()
    
    # Configurar logger
    logger = setup_logger("main")
    logger.info("Iniciando WACS Assistant...")
    
    # Inicializar assistente de voz
    assistant = VoiceAssistant()
    assistant.speak("Olá! Sou o assistente WACS. Como posso ajudar?")
    
    # Loop principal
    try:
        while True:
            command = assistant.listen()
            if command:
                if "sair" in command.lower():
                    assistant.speak("Encerrando o assistente. Até logo!")
                    break
                    
                # Processar comando
                response = process_command(command)
                assistant.speak(response)
    except KeyboardInterrupt:
        assistant.speak("Encerrando o assistente. Até logo!")
    except Exception as e:
        logger.error(f"Erro não esperado: {e}")
        assistant.speak("Desculpe, ocorreu um erro. Encerrando o assistente.")

def process_command(command):
    """Processar comandos do usuário"""
    command = command.lower()
    
    if "encontrar" in command or "procurar" in command:
        return "Buscando locais acessíveis próximos..."
    elif "adicionar" in command:
        return "Funcionalidade de adicionar locais em desenvolvimento."
    elif "ajuda" in command:
        return "Você pode pedir para encontrar locais acessíveis ou adicionar novos locais."
    else:
        return "Desculpe, não entendi o comando. Tente pedir ajuda para ver os comandos disponíveis."

if __name__ == "__main__":
    main()