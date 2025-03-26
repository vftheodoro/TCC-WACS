import random
from transformers import pipeline

class WheelchairAI:
    def __init__(self):
        self.obstacle_prob = 0.2
        self.knowledge_base = {
            'altura': 'Use o botão hidráulico sob o assento',
            'rampa': 'Inclinação máxima de 7 graus',
            'manutenção': 'Lubrifique as rodas mensalmente',
            'leis': 'Lei Brasileira de Inclusão (13.146/2015)'
        }
        self.nlp = pipeline("question-answering", 
                          model="pierreguillou/bert-base-cased-squad-v1.1-portuguese")

    def process_command(self, command: str) -> dict:
        command = command.lower().strip()
        response = {'type': 'unknown'}
        
        # Comandos de movimento
        movement = self._detect_movement(command)
        if movement:
            return movement
            
        # Perguntas técnicas
        if any(q_word in command for q_word in ['como', 'qual', 'quando']):
            return self._answer_question(command)
            
        return {'type': 'error', 'message': 'Comando não reconhecido'}

    def _detect_movement(self, command):
        movements = {
            'frente': 'forward',
            'trás': 'backward',
            'esquerda': 'left',
            'direita': 'right',
            'parar': 'stop'
        }
        for word, direction in movements.items():
            if word in command:
                return {
                    'type': 'action',
                    'command': direction,
                    'safety_check': random.random() > self.obstacle_prob
                }

    def _answer_question(self, question):
        # Primeiro tenta a base de conhecimento
        for key in self.knowledge_base:
            if key in question:
                return {
                    'type': 'info',
                    'answer': self.knowledge_base[key]
                }
        
        # Se não encontrar, usa o modelo NLP
        try:
            answer = self.nlp({
                'question': question,
                'context': "Cadeira de rodas elétrica com sistema de segurança avançado"
            })['answer']
            return {'type': 'info', 'answer': answer}
        except:
            return {'type': 'info', 'answer': "Não encontrei informações sobre isso"}