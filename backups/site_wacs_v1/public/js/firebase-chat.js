// Inicializar Firebase
const firebaseConfig = {
    apiKey: window.ENV.FIREBASE_API_KEY,
    authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV.FIREBASE_PROJECT_ID,
    storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV.FIREBASE_APP_ID,
    measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Referências aos elementos do DOM
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('chatMessageInput');
const sendButton = document.getElementById('sendMessageBtn');
const chatImageInput = document.getElementById('chatImageInput');
const chatImageBtn = document.getElementById('chatImageBtn');

// Verificar autenticação
auth.onAuthStateChanged(function(user) {
    if (user) {
        // Usuário está logado
        loadChatMessages();
        setupChatListeners();
        setupImageUpload();
        addDeleteAllButton();
    } else {
        // Usuário não está logado, redirecionar para login
        window.location.href = '../index.html';
    }
});

// Carregar mensagens existentes
function loadChatMessages() {
    db.collection('chatMessages')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get()
        .then((querySnapshot) => {
            chatMessages.innerHTML = '';
            
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({id: doc.id, ...doc.data()});
            });
            
            const messagePromises = messages.map(async (message) => {
                if (!message.photoURL && message.userId) {
                    try {
                        const userDoc = await db.collection('users').doc(message.userId).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.photoURL) {
                                message.photoURL = userData.photoURL;
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao buscar foto de perfil:", error);
                    }
                }
                return message;
            });
            
            Promise.all(messagePromises).then(updatedMessages => {
                updatedMessages.reverse().forEach(message => {
                    addMessageToUI(message);
                });
                
                scrollToBottom();
                
                if (updatedMessages.length === 0) {
                    chatMessages.innerHTML = `
                        <div class="system-message">
                            <p>Ainda não há mensagens. Seja o primeiro a iniciar uma conversa!</p>
                        </div>
                    `;
                }
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar mensagens do chat:", error);
            chatMessages.innerHTML = `
                <div class="system-message">
                    <p>Erro ao carregar mensagens. Por favor, tente novamente.</p>
                </div>
            `;
        });
}

// Configurar listeners para novas mensagens
function setupChatListeners() {
    db.collection('chatMessages')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = {id: change.doc.id, ...change.doc.data()};
                    
                    if (!document.getElementById(`message-${message.id}`)) {
                        if (!message.photoURL && message.userId) {
                            db.collection('users').doc(message.userId).get()
                                .then(userDoc => {
                                    if (userDoc.exists) {
                                        const userData = userDoc.data();
                                        if (userData.photoURL) {
                                            message.photoURL = userData.photoURL;
                                        }
                                    }
                                    addMessageToUI(message);
                                    scrollToBottom();
                                })
                                .catch(error => {
                                    console.error("Erro ao buscar foto do usuário:", error);
                                    addMessageToUI(message);
                                    scrollToBottom();
                                });
                        } else {
                            addMessageToUI(message);
                            scrollToBottom();
                        }
                    }
                } else if (change.type === 'modified') {
                    const message = {id: change.doc.id, ...change.doc.data()};
                    const messageElement = document.getElementById(`message-${message.id}`);
                    
                    if (message.deleted && messageElement) {
                        const messageText = messageElement.querySelector('.message-text');
                        if (messageText) {
                            messageText.innerHTML = `<i class="fas fa-ban"></i> Esta mensagem foi apagada`;
                            messageText.classList.add('deleted-message');
                        }
                        
                        const deleteBtn = messageElement.querySelector('.message-delete-btn');
                        if (deleteBtn) {
                            deleteBtn.remove();
                        }
                    }
                }
            });
        }, (error) => {
            console.error("Erro no listener de mensagens:", error);
        });
    
    // Eventos de envio de mensagem
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

// Enviar mensagem
function sendMessage() {
    const messageText = messageInput.value.trim();
    const user = auth.currentUser;
    
    if (messageText && user) {
        sendButton.disabled = true;
        
        db.collection('chatMessages')
            .orderBy('messageNumber', 'desc')
            .limit(1)
            .get()
            .then((querySnapshot) => {
                let nextMessageNumber = 1;
                
                if (!querySnapshot.empty) {
                    const lastMessage = querySnapshot.docs[0].data();
                    nextMessageNumber = (lastMessage.messageNumber || 0) + 1;
                }
                
                const message = {
                    text: messageText,
                    userId: user.uid,
                    userName: user.displayName || 'Usuário',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userEmail: user.email,
                    photoURL: user.photoURL || '',
                    messageNumber: nextMessageNumber
                };
                
                const messageId = `mensagem${String(nextMessageNumber).padStart(2, '0')}`;
                
                return db.collection('chatMessages').doc(messageId).set(message);
            })
            .then(() => {
                messageInput.value = '';
                sendButton.disabled = false;
            })
            .catch((error) => {
                console.error("Erro ao enviar mensagem:", error);
                alert("Erro ao enviar mensagem. Tente novamente.");
                sendButton.disabled = false;
            });
    }
}

// Adicionar mensagem à interface
function addMessageToUI(message) {
    const user = auth.currentUser;
    const isCurrentUser = user && message.userId === user.uid;
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isCurrentUser ? 'sent' : 'received'}`;
    messageElement.id = `message-${message.id}`;
    messageElement.setAttribute('data-message-id', message.id);
    
    const isDeleted = message.deleted === true;
    const timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
    const timeFormatted = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let photoContent = '';
    if (message.photoURL) {
        photoContent = `<div class="sender-photo" style="background-image: url('${message.photoURL}')"></div>`;
    } else if (message.userName && message.userName !== 'Usuário') {
        const initials = message.userName.split(' ').map(name => name[0]).join('').toUpperCase();
        photoContent = `<div class="sender-photo">${initials}</div>`;
    } else {
        photoContent = `<div class="sender-photo"><i class="fas fa-user" style="font-size: 0.7rem"></i></div>`;
    }
    
    let messageText = '';
    if (isDeleted) {
        messageText = `<p class="message-text deleted-message"><i class="fas fa-ban"></i> Esta mensagem foi apagada</p>`;
    } else if (message.type === 'image' && message.imageUrl) {
        messageText = `<div class="message-image"><img src="${message.imageUrl}" alt="Imagem enviada" style="width:200px; height:200px; border-radius:10px; object-fit:cover; box-shadow:0 1px 8px #0002; background:#eee;" /></div>`;
    } else {
        messageText = `<p class="message-text">${escapeHtml(message.text)}</p>`;
    }
    
    if (!isDeleted && isCurrentUser) {
        messageText += `<div class="message-delete-btn" data-message-id="${message.id}"><i class="fas fa-trash-alt"></i></div>`;
    }
    
    messageElement.innerHTML = `
        <div class="sender-info">
            ${photoContent}
            <span class="user-link" data-user-id="${message.userId}">${message.userName || 'Usuário'}</span>
        </div>
        <div class="message-content">
            ${messageText}
            <div class="message-time">${timeFormatted}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    if (!isDeleted && isCurrentUser) {
        const deleteBtn = messageElement.querySelector('.message-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const messageId = this.getAttribute('data-message-id');
                if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
                    deleteMessage(messageId);
                }
            });
        }
    }
}

// Configurar upload de imagens
function setupImageUpload() {
    if (chatImageBtn && chatImageInput) {
        chatImageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            chatImageInput.click();
        });
        
        chatImageInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const user = auth.currentUser;
            if (!user) {
                alert('É necessário estar logado para enviar imagens.');
                return;
            }
            
            sendButton.disabled = true;
            chatImageBtn.disabled = true;
            
            try {
                const storageRef = storage.ref(`chatImages/${user.uid}_${Date.now()}`);
                await storageRef.put(file);
                const imageUrl = await storageRef.getDownloadURL();
                
                const lastMessageQuery = await db.collection('chatMessages')
                    .orderBy('messageNumber', 'desc')
                    .limit(1)
                    .get();

                let nextMessageNumber = 1;
                
                if (!lastMessageQuery.empty) {
                    const lastMessage = lastMessageQuery.docs[0].data();
                    nextMessageNumber = (lastMessage.messageNumber || 0) + 1;
                }
                
                const messageId = `mensagem${String(nextMessageNumber).padStart(2, '0')}`;
                
                await db.collection('chatMessages').doc(messageId).set({
                    type: 'image',
                    imageUrl,
                    userId: user.uid,
                    userName: user.displayName || user.email || 'Usuário',
                    userEmail: user.email || '',
                    photoURL: user.photoURL || '',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    messageNumber: nextMessageNumber
                });
                
                console.log('Imagem enviada com sucesso');
            } catch (err) {
                alert('Erro ao enviar imagem: ' + err.message);
                console.error('Erro no upload/salvamento da imagem:', err);
            }
            
            chatImageInput.value = '';
            sendButton.disabled = false;
            chatImageBtn.disabled = false;
        };
    }
}

// Adicionar botão de apagar todas as mensagens (apenas para admins)
function addDeleteAllButton() {
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('users').doc(user.uid).get()
        .then(userDoc => {
            const userData = userDoc.data();
            const isAdmin = userData && userData.ADM === 1;
            
            if (isAdmin) {
                const deleteAllBtn = document.createElement('button');
                deleteAllBtn.className = 'delete-all-btn';
                deleteAllBtn.innerHTML = '<i class="fas fa-trash"></i> Apagar todas as mensagens';
                
                deleteAllBtn.addEventListener('click', function() {
                    if (confirm('Tem certeza que deseja apagar TODAS as mensagens do chat? Esta ação não pode ser desfeita.')) {
                        deleteAllMessages();
                    }
                });
                
                const chatContainer = document.querySelector('.chat-container');
                chatContainer.parentNode.insertBefore(deleteAllBtn, chatContainer.nextSibling);
            }
        })
        .catch(error => {
            console.error('Erro ao verificar permissões de admin:', error);
        });
}

// Apagar uma mensagem
function deleteMessage(messageId) {
    if (!messageId) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('chatMessages').doc(messageId).get()
        .then(doc => {
            if (doc.exists) {
                const message = doc.data();
                
                return db.collection('users').doc(user.uid).get()
                    .then(userDoc => {
                        const userData = userDoc.data();
                        const isAdmin = userData && userData.ADM === 1;
                        
                        if (message.userId === user.uid || isAdmin) {
                            return db.collection('chatMessages').doc(messageId).delete();
                        } else {
                            throw new Error('Você não tem permissão para apagar esta mensagem');
                        }
                    });
            } else {
                throw new Error('Mensagem não encontrada');
            }
        })
        .then(() => {
            console.log('Mensagem excluída com sucesso');
            const messageElement = document.getElementById(`message-${messageId}`);
            if (messageElement) {
                messageElement.remove();
            }
        })
        .catch(error => {
            console.error('Erro ao excluir mensagem:', error);
            alert('Erro ao excluir mensagem: ' + error.message);
        });
}

// Apagar todas as mensagens
function deleteAllMessages() {
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('users').doc(user.uid).get()
        .then(userDoc => {
            const userData = userDoc.data();
            if (userData && userData.ADM === 1) {
                return db.collection('chatMessages').get()
                    .then(snapshot => {
                        const batch = db.batch();
                        snapshot.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        return batch.commit();
                    })
                    .then(() => {
                        chatMessages.innerHTML = `
                            <div class="system-message">
                                <p>Nenhuma mensagem no chat.</p>
                            </div>
                        `;
                    });
            } else {
                throw new Error('Apenas administradores podem apagar todas as mensagens');
            }
        })
        .catch(error => {
            console.error('Erro ao apagar todas as mensagens:', error);
            alert('Erro ao apagar mensagens: ' + error.message);
        });
}

// Funções auxiliares
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
} 