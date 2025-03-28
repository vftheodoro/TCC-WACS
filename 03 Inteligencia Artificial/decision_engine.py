# decision_engine.py
from transformers import pipeline
import random
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class WheelchairAI:
    def __init__(self):
        self.safety_threshold = 0.85
        self.nlp_model = self._load_nlp_model()
        self.command_registry = self._init_command_registry()
        self.knowledge_base = self._load_knowledge_base()

    def _load_nlp_model(self):
        """Carrega modelo NLP otimizado"""
        try:
            return pipeline(
                "question-answering",
                model="neuralmind/bert-small-portuguese-cased",
                device=-1
            )
        except Exception as e:
            logger.error(f"Erro no carregamento do modelo NLP: {e}")
            raise

    def _init_command_registry(self) -> Dict:
        """Registro de comandos e ações"""
        return {
            'movimento': {
                'frente': {'type': 'action', 'command': 'forward'},
                'trás': {'type': 'action', 'command': 'backward'},
                'esquerda': {'type': 'action', 'command': 'left'},
                'direita': {'type': 'action', 'command': 'right'},
                'pare': {'type': 'emergency', 'command': 'stop'}
            },
            'consultas': [
                'como', 'onde', 'quando', 'qual', 'lista', 'ajuda'
            ]
        }

    def _load_knowledge_base(self) -> Dict:
        """Base de conhecimento expandida"""
        return {
            'comandos': "Você pode dizer: frente, trás, esquerda, direita, pare",
            'emergência': "Comando de parada imediata ativado",
            'bateria': "Autonomia média: 18 horas em uso normal",
            'acessibilidade': "Sistema compatível com normas ABNT NBR 9050",
            'segurança': "Sistema de detecção de obstáculos ativo"
        }

    def process_command(self, command: str) -> Dict:
        """Processa comandos com múltiplos níveis de verificação"""
        command = command.lower().strip()
        
        # Prioridade para emergências
        if any(word in command for word in ['pare', 'emergência', 'perigo']):
            return self._emergency_response(command)
        
        # Verificação de movimento
        movement = self._detect_movement(command)
        if movement:
            return movement
        
        # Consultas técnicas
        return self._technical_query(command)

    def _emergency_response(self, command: str) -> Dict:
        """Resposta a situações críticas"""
        return {
            'type': 'emergency',
            'message': "Ativando protocolo de segurança total",
            'command': 'full_stop',
            'safety_override': True
        }

    def _detect_movement(self, command: str) -> Optional[Dict]:
        """Detecção de comandos de movimento"""
        for direction, params in self.command_registry['movimento'].items():
            if direction in command:
                return {
                    **params,
                    'safety_ok': self._safety_check(),
                    'confirmation': f"Movendo para {direction}",
                    'warning': "Obstáculo detectado! Movimento cancelado"
                }
        return None

    def _technical_query(self, command: str) -> Dict:
        """Processa perguntas técnicas"""
        # Primeiro na base de conhecimento
        for key, answer in self.knowledge_base.items():
            if key in command:
                return {'type': 'info', 'answer': answer}
        
        # Consulta ao modelo NLP
        try:
            response = self.nlp_model({
                'question': command,
                'context': "Cadeira de rodas inteligente com sistema VACS"
            })
            return {'type': 'info', 'answer': response['answer']}
        except Exception as e:
            logger.error(f"Erro no NLP: {e}")
            return {'type': 'info', 'answer': "Não entendi a pergunta"}

    def _safety_check(self) -> bool:
        """Verificação de segurança simulada"""
        return random.random() > (1 - self.safety_threshold)