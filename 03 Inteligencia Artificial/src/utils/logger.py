# src/utils/logger.py
import logging
import os
from datetime import datetime
from config import LOGS_DIR

def setup_logger(name):
    # Criar diretório de logs se não existir
    if not os.path.exists(LOGS_DIR):
        os.makedirs(LOGS_DIR)
        
    # Configurar logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Criar arquivo de log com data
    log_file = os.path.join(LOGS_DIR, f'wacs_{datetime.now().strftime("%Y%m%d")}.log')
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    
    # Configurar formato do log
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # Adicionar handler ao logger
    logger.addHandler(file_handler)
    
    return logger