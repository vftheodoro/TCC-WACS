# config.py
import os

# Configurações do projeto
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')
LOGS_DIR = os.path.join(PROJECT_ROOT, 'logs')

# Configurações do banco de dados
DATABASE = {
    'name': os.path.join(DATA_DIR, 'wacs.db'),
    'backup_dir': os.path.join(DATA_DIR, 'backups')
}

# Configurações de API
API_CONFIG = {
    'host': 'localhost',
    'port': 8000,
    'debug': True
}

# Configurações de voz
VOICE_CONFIG = {
    'language': 'pt-BR',
    'rate': 180,
    'volume': 1.0
}

# Configurações de reconhecimento de voz
SPEECH_CONFIG = {
    'timeout': 5,
    'phrase_time_limit': 5,
    'language': 'pt-BR'
}