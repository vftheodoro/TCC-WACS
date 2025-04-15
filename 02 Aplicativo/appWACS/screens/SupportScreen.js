import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const faqs = [
  {
    question: 'Como conectar meu dispositivo?',
    answer: 'Vá para a tela de conexão, ative o Bluetooth do seu celular e selecione o dispositivo WACS na lista.',
  },
  {
    question: 'O que fazer se a cadeira não responder?',
    answer: 'Verifique a conexão Bluetooth, a bateria do dispositivo e tente reiniciar o aplicativo.',
  },
  {
    question: 'Como reportar um problema?',
    answer: 'Use o formulário de feedback nesta tela ou entre em contato com nosso suporte técnico.',
  },
];

const SupportScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !message) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    // Simulação de envio
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'faq' && styles.activeTab]}
            onPress={() => setActiveTab('faq')}
          >
            <Text style={styles.tabText}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'feedback' && styles.activeTab]}
            onPress={() => setActiveTab('feedback')}
          >
            <Text style={styles.tabText}>Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'contact' && styles.activeTab]}
            onPress={() => setActiveTab('contact')}
          >
            <Text style={styles.tabText}>Contato</Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'faq' && (
          <View style={styles.faqContainer}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  <Icon name="help-circle" size={16} color="#00f2fe" /> {faq.question}
                </Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
            
            <View style={styles.videoTutorials}>
              <Text style={styles.sectionTitle}>Tutoriais em Vídeo</Text>
              
              <View style={styles.videoCard}>
                <View style={styles.videoPlaceholder}>
                  <Icon name="play-circle" size={40} color="#00f2fe" />
                </View>
                <Text style={styles.videoTitle}>Como conectar seu dispositivo</Text>
              </View>
              
              <View style={styles.videoCard}>
                <View style={styles.videoPlaceholder}>
                  <Icon name="play-circle" size={40} color="#00f2fe" />
                </View>
                <Text style={styles.videoTitle}>Controles básicos</Text>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'feedback' && (
          <View style={styles.feedbackContainer}>
            {submitted ? (
              <View style={styles.successMessage}>
                <Icon name="check-circle" size={50} color="#00f2fe" />
                <Text style={styles.successText}>Obrigado pelo seu feedback!</Text>
                <Text style={styles.successSubtext}>Nossa equipe entrará em contato se necessário.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Envie seu Feedback</Text>
                <Text style={styles.label}>Seu Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#666"
                  value={name}
                  onChangeText={setName}
                />
                
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Text style={styles.label}>Mensagem</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  placeholder="Descreva seu problema, sugestão ou feedback"
                  placeholderTextColor="#666"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                />
                
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>ENVIAR FEEDBACK</Text>
                </TouchableOpacity>
                
                <Text style={styles.feedbackNote}>
                  Nossa equipe geralmente responde em até 24 horas.
                </Text>
              </>
            )}
          </View>
        )}
        
        {activeTab === 'contact' && (
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Informações de Contato</Text>
            
            <View style={styles.contactCard}>
              <Icon name="email" size={24} color="#00f2fe" />
              <Text style={styles.contactText}>suporte@wacs.com.br</Text>
            </View>
            
            <View style={styles.contactCard}>
              <Icon name="phone" size={24} color="#00f2fe" />
              <Text style={styles.contactText}>(11) 98765-4321</Text>
            </View>
            
            <View style={styles.contactCard}>
              <Icon name="clock" size={24} color="#00f2fe" />
              <Text style={styles.contactText}>Seg-Sex: 9h às 18h</Text>
            </View>
            
            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>Redes Sociais</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="whatsapp" size={30} color="#25D366" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="facebook" size={30} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="instagram" size={30} color="#E1306C" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Nossa Localização</Text>
              <View style={styles.mapPlaceholder}>
                <Icon name="map" size={50} color="#00f2fe" />
                <Text style={styles.mapText}>Av. Paulista, 1000 - São Paulo/SP</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },
  scrollContainer: {
    padding: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e2833',
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  faqContainer: {
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  faqQuestion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  faqAnswer: {
    color: '#7a828a',
    fontSize: 14,
    lineHeight: 20,
  },
  videoTutorials: {
    marginTop: 30,
  },
  videoCard: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  videoPlaceholder: {
    height: 150,
    backgroundColor: '#1a1f27',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  videoTitle: {
    color: 'white',
    fontSize: 16,
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#7a828a',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#14181d',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2e35',
  },
  messageInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#00f2fe',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#0a0e14',
    fontWeight: '700',
    fontSize: 16,
  },
  feedbackNote: {
    color: '#7a828a',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 15,
  },
  successMessage: {
    alignItems: 'center',
    padding: 30,
  },
  successText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  successSubtext: {
    color: '#7a828a',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  contactContainer: {
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  contactText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
  socialContainer: {
    marginTop: 30,
  },
  socialTitle: {
    color: '#7a828a',
    fontSize: 16,
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    backgroundColor: '#141a24',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  locationContainer: {
    marginTop: 30,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#141a24',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  mapText: {
    color: 'white',
    marginTop: 10,
  },
});

export default SupportScreen;