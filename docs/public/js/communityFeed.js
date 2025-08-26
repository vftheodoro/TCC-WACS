// communityFeed.js - Novo sistema de feed da comunidade (100% inspirado no app)
// ATENÇÃO: Toda publicação, edição e exclusão de post deve ser feita exclusivamente via handlePublish, handleEditPost e handleDeletePost. Não use funções duplicadas ou antigas.

// --- Estado global do feed ---
const FeedState = {
  posts: [],
  lastDoc: null,
  loading: false,
  loadingMore: false,
  error: null,
  refreshing: false,
  selectedPost: null,
  comments: [],
  commentsLoading: false,
  toast: { visible: false, type: 'info', message: '' },
  PAGE_SIZE: 10,
};

// --- Utilitários Firebase ---
function getFirebaseApp() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase não está carregado');
    return null;
  }
  return firebase;
}

function initializeFirebaseFeed() {
  const firebase = getFirebaseApp();
  if (!firebase) return null;
  if (!firebase.apps.length) {
    const firebaseConfig = {
      apiKey: window.ENV.FIREBASE_API_KEY,
      authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
      projectId: window.ENV.FIREBASE_PROJECT_ID,
      storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.ENV.FIREBASE_APP_ID,
      measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
    };
    firebase.initializeApp(firebaseConfig);
  }
  return firebase;
}

function getCurrentUserFeed() {
  const firebase = initializeFirebaseFeed();
  if (!firebase) return null;
  return firebase.auth().currentUser;
}

function getCurrentUserIdFeed() {
  const user = getCurrentUserFeed();
  return user ? user.uid : null;
}

// --- Toasts ---
function showToast(type, message) {
  FeedState.toast = { visible: true, type, message };
  renderToast();
  setTimeout(() => {
    FeedState.toast.visible = false;
    renderToast();
  }, 3500);
}

function renderToast() {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  toastContainer.innerHTML = FeedState.toast.visible ? `
    <div class="toast toast-${FeedState.toast.type}">${FeedState.toast.message}</div>
  ` : '';
}

// --- Funções de Feed ---
async function fetchPostsPaginated({ pageSize, lastDoc }) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) throw new Error('Firebase não inicializado');
  const db = firebase.firestore();
  let query = db.collection('posts').orderBy('createdAt', 'desc').limit(pageSize);
  if (lastDoc) query = query.startAfter(lastDoc);
  const snap = await query.get();
  const posts = [];
  snap.forEach(doc => {
    posts.push({ id: doc.id, ...doc.data() });
  });
  return { posts, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

async function updateCommentsCountIfNeeded(post) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) return;
  const db = firebase.firestore();
  if (typeof post.commentsCount === 'number' && post.commentsCount > 0) return;
  let count = 0;
  try {
    const commentsSnap = await db.collection('posts').doc(post.id).collection('comments').get();
    count = commentsSnap.size;
  } catch {
    if (Array.isArray(post.comments)) count = post.comments.length;
  }
  await db.collection('posts').doc(post.id).update({ commentsCount: count });
}

async function loadPosts() {
  FeedState.loading = true;
  FeedState.error = null;
  renderFeedUI();
  try {
    const { posts, lastDoc } = await fetchPostsPaginated({ pageSize: FeedState.PAGE_SIZE });
    for (const post of posts) {
      if (typeof post.commentsCount !== 'number' || post.commentsCount === 0) {
        await updateCommentsCountIfNeeded(post);
      }
    }
    FeedState.posts = posts;
    FeedState.lastDoc = lastDoc;
  } catch (e) {
    FeedState.error = 'Não foi possível carregar o feed. ' + (e?.message || '');
  } finally {
    FeedState.loading = false;
    renderFeedUI();
  }
}

async function loadMorePosts() {
  if (!FeedState.lastDoc || FeedState.loadingMore) return;
  FeedState.loadingMore = true;
  renderFeedUI();
  try {
    const { posts, lastDoc } = await fetchPostsPaginated({ pageSize: FeedState.PAGE_SIZE, lastDoc: FeedState.lastDoc });
    FeedState.posts = [...FeedState.posts, ...posts];
    FeedState.lastDoc = lastDoc;
  } catch (e) {
    FeedState.error = 'Erro ao carregar mais posts. ' + (e?.message || '');
  } finally {
    FeedState.loadingMore = false;
    renderFeedUI();
  }
}

async function toggleLikePostWeb(postId, liked) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) throw new Error('Firebase não inicializado');
  const db = firebase.firestore();
  const userId = getCurrentUserIdFeed();
  if (!userId) throw new Error('Usuário não autenticado');
  const postRef = db.collection('posts').doc(postId);
  await postRef.update({
    likes: liked ? firebase.firestore.FieldValue.arrayRemove(userId) : firebase.firestore.FieldValue.arrayUnion(userId)
  });
}

async function fetchCommentsWeb(postId) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) return [];
  const db = firebase.firestore();
  const snap = await db.collection('posts').doc(postId).collection('comments').orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), likes: Array.isArray(doc.data().likes) ? doc.data().likes : [] }));
}

async function addCommentWeb(postId, text) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) throw new Error('Firebase não inicializado');
  const db = firebase.firestore();
  const user = getCurrentUserFeed();
  if (!user) throw new Error('Usuário não autenticado');
  const commentData = {
    userId: user.uid,
    userName: user.displayName,
    userPhoto: user.photoURL,
    text,
    createdAt: new Date().toISOString(),
    likes: [],
  };
  await db.collection('posts').doc(postId).collection('comments').add(commentData);
  await db.collection('posts').doc(postId).update({
    commentsCount: firebase.firestore.FieldValue.increment(1)
  });
}

async function deleteCommentWeb(postId, commentId) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) throw new Error('Firebase não inicializado');
  const db = firebase.firestore();
  await db.collection('posts').doc(postId).collection('comments').doc(commentId).delete();
  await db.collection('posts').doc(postId).update({
    commentsCount: firebase.firestore.FieldValue.increment(-1)
  });
}

async function toggleLikeCommentWeb(postId, commentId, liked) {
  const firebase = initializeFirebaseFeed();
  if (!firebase) throw new Error('Firebase não inicializado');
  const db = firebase.firestore();
  const userId = getCurrentUserIdFeed();
  if (!userId) throw new Error('Usuário não autenticado');
  const commentRef = db.collection('posts').doc(postId).collection('comments').doc(commentId);
  await commentRef.update({
    likes: liked ? firebase.firestore.FieldValue.arrayRemove(userId) : firebase.firestore.FieldValue.arrayUnion(userId)
  });
}

// --- Renderização do Feed ---
function renderFeedUI() {
  const feedEl = document.querySelector('.community-feed');
  if (!feedEl) return;
  feedEl.innerHTML = '';
  if (FeedState.loading) {
    feedEl.innerHTML = '<div class="loading-feed">Carregando posts...</div>';
    return;
  }
  if (FeedState.error) {
    feedEl.innerHTML = `<div class="error-feed">${FeedState.error}</div>`;
    return;
  }
  if (FeedState.posts.length === 0) {
    feedEl.innerHTML = '<div class="empty-feed">Nenhum post encontrado. Seja o primeiro a publicar!</div>';
    return;
  }
  FeedState.posts.forEach(post => {
    feedEl.appendChild(createPostCardWeb(post));
  });
  if (FeedState.loadingMore) {
    const loadingMore = document.createElement('div');
    loadingMore.className = 'loading-more-feed';
    loadingMore.innerText = 'Carregando mais posts...';
    feedEl.appendChild(loadingMore);
  }
}

function createPostCardWeb(post) {
  const user = getCurrentUserFeed();
  const isOwner = user && (user.uid === post.userId);
  const card = document.createElement('div');
  card.className = 'post-card' + (isOwner ? ' post-card-owner' : '');
  card.innerHTML = `
    <div class="post-header">
                      <img src="${post.userPhoto || '/public/images/fotos-perfil/default-avatar.png'}" class="post-avatar" onerror="this.src='/public/images/fotos-perfil/default-avatar.png'">
      <div class="post-header-info">
        <span class="post-user">${post.userName || 'Usuário'}</span>
        <span class="post-date">${getRelativeDate(post.createdAt)}</span>
      </div>
      ${isOwner ? `<button class="post-menu-btn"><i class="fas fa-ellipsis-v"></i></button>` : ''}
    </div>
    <div class="post-text">${post.text || ''}</div>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" style="cursor:zoom-in" alt="Imagem do post">` : ''}
    <div class="post-actions">
      <button class="like-btn${post.likes && user && post.likes.includes(user.uid) ? ' liked' : ''}"><i class="fas fa-heart"></i> <span class="like-count">${post.likes ? post.likes.length : 0}</span></button>
      <button class="comment-btn"><i class="fas fa-comment"></i> <span class="comment-count">${typeof post.commentsCount === 'number' ? post.commentsCount : 0}</span></button>
    </div>
  `;
  // Like post
  card.querySelector('.like-btn').onclick = async () => {
    await handleLike(post.id, post.likes && user && post.likes.includes(user.uid));
  };
  // Comentários
  card.querySelector('.comment-btn').onclick = () => {
    handleComment(post);
  };
  // Abrir imagem em tela cheia
  if (post.imageUrl) {
    card.querySelector('.post-image').onclick = () => openImageModal(post.imageUrl);
  }
  // Menu de 3 pontos
  if (isOwner) {
    card.querySelector('.post-menu-btn').onclick = (e) => {
      e.stopPropagation();
      showPostMenuWeb(card, post);
    };
  }
  return card;
}

function showPostMenuWeb(card, post) {
  let menu = card.querySelector('.post-menu');
  if (menu) menu.remove();
  menu = document.createElement('div');
  menu.className = 'post-menu';
  menu.innerHTML = `
    <button class="edit-post-btn">Editar</button>
    <button class="delete-post-btn">Apagar</button>
  `;
  card.appendChild(menu);
  menu.querySelector('.edit-post-btn').onclick = () => {
    menu.remove();
    showEditPostModalWeb(post);
  };
  menu.querySelector('.delete-post-btn').onclick = async () => {
    menu.remove();
    if (confirm('Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.')) {
      await handleDeletePost(post);
    }
  };
  document.addEventListener('click', function hideMenu(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', hideMenu);
    }
  });
}

function showEditPostModalWeb(post) {
  let modal = document.querySelector('.edit-post-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.className = 'edit-post-modal';
  modal.innerHTML = `
    <div class="edit-post-content">
      <h3>Editar post</h3>
      <textarea class="edit-post-textarea">${post.text || ''}</textarea>
      <div class="edit-post-actions">
        <button class="cancel-edit-btn">Cancelar</button>
        <button class="save-edit-btn">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.cancel-edit-btn').onclick = () => modal.remove();
  modal.querySelector('.save-edit-btn').onclick = async () => {
    const newText = modal.querySelector('.edit-post-textarea').value.trim();
    if (!newText) return;
    await handleEditPost(post, newText);
    modal.remove();
  };
}

function getRelativeDate(date) {
  if (!date) return '';
  let d = typeof date === 'object' && date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - postDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString('pt-BR', { dateStyle: 'short' });
}

// --- Comentários ---
async function handleComment(post) {
  FeedState.selectedPost = post;
  FeedState.commentsLoading = true;
  renderCommentsModalWeb();
  try {
    let fetched = await fetchCommentsWeb(post.id);
    // Migração de comentários antigos (se necessário)
    if ((!fetched || fetched.length === 0) && Array.isArray(post.comments) && post.comments.length > 0) {
      for (const c of post.comments) {
        await addCommentWeb(post.id, c.text);
      }
      fetched = await fetchCommentsWeb(post.id);
    }
    if ((!fetched || fetched.length === 0) && Array.isArray(post.comments) && post.comments.length > 0) {
      fetched = post.comments.map((c, idx) => ({ ...c, id: c.createdAt || String(idx), likes: [] }));
    }
    FeedState.comments = fetched;
  } catch (e) {
    FeedState.comments = [];
  }
  FeedState.commentsLoading = false;
  renderCommentsModalWeb();
}

function renderCommentsModalWeb() {
  let modal = document.querySelector('.comments-modal');
  if (modal) modal.remove();
  if (!FeedState.selectedPost) return;
  modal = document.createElement('div');
  modal.className = 'comments-modal';
  modal.innerHTML = `
    <div class="comments-content">
      <div class="comments-header">
        <span>Comentários</span>
        <button class="close-comments-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="comments-list">${FeedState.commentsLoading ? 'Carregando...' : ''}</div>
      <div class="comments-input-row">
                        <img src="${getCurrentUserFeed()?.photoURL || '/public/images/fotos-perfil/default-avatar.png'}" class="comments-avatar">
        <input type="text" class="comments-input" placeholder="Adicionar um comentário...">
        <button class="send-comment-btn"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.close-comments-btn').onclick = () => {
    FeedState.selectedPost = null;
    modal.remove();
  };
  // Renderizar lista de comentários
  if (!FeedState.commentsLoading) {
    renderCommentsListWeb(modal.querySelector('.comments-list'));
  }
  // Enviar comentário
  modal.querySelector('.send-comment-btn').onclick = async () => {
    const input = modal.querySelector('.comments-input');
    const text = input.value.trim();
    if (!text) return;
    await handleAddComment(text);
    input.value = '';
  };
}

function renderCommentsListWeb(listEl) {
  if (!FeedState.comments || FeedState.comments.length === 0) {
    listEl.innerHTML = '<div class="no-comments">Nenhum comentário ainda.</div>';
    return;
  }
  FeedState.comments.forEach(comment => {
    const user = getCurrentUser();
    const isOwner = user && (user.uid === comment.userId);
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
                      <img src="${comment.userPhoto || '/public/images/fotos-perfil/default-avatar.png'}" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-user">${comment.userName}</span>
          <span class="comment-date">${getRelativeDate(comment.createdAt)}</span>
          <button class="like-comment-btn${comment.likes && user && comment.likes.includes(user.uid) ? ' liked' : ''}"><i class="fas fa-heart"></i> <span class="like-count">${comment.likes ? comment.likes.length : 0}</span></button>
          ${isOwner ? `<button class="delete-comment-btn"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <div class="comment-text">${comment.text}</div>
      </div>
    `;
    // Like comentário
    item.querySelector('.like-comment-btn').onclick = async () => {
      await handleLikeComment(comment);
    };
    // Deletar comentário
    if (isOwner) {
      item.querySelector('.delete-comment-btn').onclick = async () => {
        await handleDeleteComment(comment);
      };
    }
    listEl.appendChild(item);
  });
}

async function handleAddComment(text) {
  if (!FeedState.selectedPost) return;
  FeedState.commentsLoading = true;
  renderCommentsModalWeb();
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const user = getCurrentUserFeed();
    if (!user) throw new Error('Usuário não autenticado');
    const commentData = {
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      text,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    await db.collection('posts').doc(FeedState.selectedPost.id).collection('comments').add(commentData);
    await db.collection('posts').doc(FeedState.selectedPost.id).update({
      commentsCount: firebase.firestore.FieldValue.increment(1)
    });
    const updated = await fetchCommentsWeb(FeedState.selectedPost.id);
    FeedState.comments = updated;
    FeedState.posts = FeedState.posts.map(post =>
      post.id === FeedState.selectedPost.id
        ? { ...post, commentsCount: (typeof post.commentsCount === 'number' ? post.commentsCount + 1 : 1) }
        : post
    );
    showToast('success', 'Comentário adicionado!');
    renderFeedUI();
  } catch (e) {
    showToast('error', 'Erro ao comentar.');
  }
  FeedState.commentsLoading = false;
  renderCommentsModalWeb();
}

async function handleDeleteComment(comment) {
  if (!FeedState.selectedPost) return;
  FeedState.commentsLoading = true;
  renderCommentsModalWeb();
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    await db.collection('posts').doc(FeedState.selectedPost.id).collection('comments').doc(comment.id).delete();
    await db.collection('posts').doc(FeedState.selectedPost.id).update({
      commentsCount: firebase.firestore.FieldValue.increment(-1)
    });
    const updated = await fetchCommentsWeb(FeedState.selectedPost.id);
    FeedState.comments = updated;
    FeedState.posts = FeedState.posts.map(post =>
      post.id === FeedState.selectedPost.id
        ? { ...post, commentsCount: Math.max((typeof post.commentsCount === 'number' ? post.commentsCount - 1 : 0), 0) }
        : post
    );
    showToast('success', 'Comentário apagado!');
    renderFeedUI();
  } catch (e) {
    showToast('error', 'Erro ao apagar comentário.');
  }
  FeedState.commentsLoading = false;
  renderCommentsModalWeb();
}

async function handleLikeComment(comment) {
  if (!FeedState.selectedPost) return;
  FeedState.commentsLoading = true;
  renderCommentsModalWeb();
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const userId = getCurrentUserIdFeed();
    if (!userId) throw new Error('Usuário não autenticado');
    const commentRef = db.collection('posts').doc(FeedState.selectedPost.id).collection('comments').doc(comment.id);
    await commentRef.update({
      likes: comment.likes && comment.likes.includes(userId)
        ? firebase.firestore.FieldValue.arrayRemove(userId)
        : firebase.firestore.FieldValue.arrayUnion(userId)
    });
    const updated = await fetchCommentsWeb(FeedState.selectedPost.id);
    FeedState.comments = updated;
  } catch (e) {}
  FeedState.commentsLoading = false;
  renderCommentsModalWeb();
}

async function handleDeletePost(post) {
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const storage = firebase.storage();
    // Deleta imagem do Storage se houver
    if (post.imageUrl) {
      try {
        const url = new URL(post.imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)$/);
        let storagePath = null;
        if (pathMatch && pathMatch[1]) {
          storagePath = decodeURIComponent(pathMatch[1].split('?')[0]);
        } else {
          storagePath = post.imageUrl.split('/o/')[1]?.split('?')[0];
        }
        if (storagePath) {
          const imageRef = storage.ref().child(storagePath);
          await imageRef.delete();
        }
      } catch (err) {
        // Loga mas não impede a exclusão do post
        console.warn('Erro ao deletar imagem do Storage:', err);
      }
    }
    await db.collection('posts').doc(post.id).delete();
    FeedState.posts = FeedState.posts.filter(p => p.id !== post.id);
    showToast('success', 'Post apagado com sucesso!');
    await loadPosts();
  } catch (err) {
    showToast('error', 'Erro ao apagar post: ' + (err?.message || ''));
  }
}

async function handleEditPost(post, newText) {
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    await db.collection('posts').doc(post.id).update({ text: newText });
    FeedState.posts = FeedState.posts.map(p => p.id === post.id ? { ...p, text: newText } : p);
    showToast('success', 'Post atualizado!');
    renderFeedUI();
  } catch (e) {
    showToast('error', 'Erro ao atualizar post.');
  }
}

// --- Publicação de novo post ---
function setupPostInputWeb() {
  const postBtn = document.querySelector('.post-btn');
  const textarea = document.querySelector('.post-textarea');
  const imageInput = document.querySelector('.post-image-input');
  const imageBtn = document.querySelector('.post-image-btn');
  let selectedImageFile = null;
  if (imageBtn && imageInput) {
    imageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
  }
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      selectedImageFile = e.target.files[0];
    });
  }
  if (postBtn) {
    postBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text && !selectedImageFile) return;
      try {
        await handlePublish({ text, imageFile: selectedImageFile });
        textarea.value = '';
        if (imageInput) imageInput.value = '';
        selectedImageFile = null;
      } catch (err) {}
    });
  }
}

// --- Infinite Scroll ---
function setupInfiniteScrollWeb() {
  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      loadMorePosts();
    }
  });
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  setupPostInputWeb();
  setupInfiniteScrollWeb();
  loadPosts();
});

// Exportar funções para debug
window.CommunityFeed = {
  loadPosts,
  loadMorePosts,
  handlePublish,
  handleLike,
  handleComment,
  handleAddComment,
  handleDeleteComment,
  handleLikeComment,
  handleDeletePost,
  handleEditPost
};

async function handleLike(postId, liked) {
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const userId = getCurrentUserIdFeed();
    if (!userId) throw new Error('Usuário não autenticado');
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({
      likes: liked ? firebase.firestore.FieldValue.arrayRemove(userId) : firebase.firestore.FieldValue.arrayUnion(userId)
    });
    FeedState.posts = FeedState.posts.map(post => {
      if (post.id !== postId) return post;
      let newLikes = Array.isArray(post.likes) ? [...post.likes] : [];
      if (liked) {
        newLikes = newLikes.filter(uid => uid !== userId);
      } else {
        newLikes.push(userId);
      }
      return { ...post, likes: newLikes };
    });
    renderFeedUI();
    showToast('success', liked ? 'Curtida removida!' : 'Post curtido!');
  } catch (e) {
    showToast('error', 'Erro ao curtir/descurtir post. ' + (e?.message || ''));
  }
}

// --- Função de publicar post igual ao app ---
async function handlePublish({ text, imageFile }) {
  if (FeedState.loading) return; // Evita múltiplos envios
  FeedState.loading = true;
  renderFeedUI();
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const storage = firebase.storage();
    const user = getCurrentUserFeed();
    if (!user) throw new Error('Usuário não autenticado');
    let imageUrl = null;
    if (imageFile) {
      const fileName = `posts/${user.uid}_${Date.now()}`;
      const postImageRef = storage.ref().child(fileName);
      await postImageRef.put(imageFile);
      imageUrl = await postImageRef.getDownloadURL();
    }
    const postData = {
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      text,
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      likes: [],
      commentsCount: 0,
    };
    const docRef = await db.collection('posts').add(postData);
    // Adiciona localmente para feedback instantâneo
    FeedState.posts = [{ id: docRef.id, ...postData }, ...FeedState.posts];
    renderFeedUI();
    showToast('success', 'Post publicado com sucesso!');
    setTimeout(loadPosts, 1000);
  } catch (e) {
    showToast('error', 'Erro ao publicar post. ' + (e?.message || ''));
  } finally {
    FeedState.loading = false;
    renderFeedUI();
  }
}

// --- Função de editar post igual ao app ---
async function handleEditPost(post, newText) {
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    await db.collection('posts').doc(post.id).update({ text: newText });
    FeedState.posts = FeedState.posts.map(p => p.id === post.id ? { ...p, text: newText } : p);
    showToast('success', 'Post atualizado!');
    renderFeedUI();
  } catch (e) {
    showToast('error', 'Erro ao atualizar post.');
  }
}

// --- Função de excluir post igual ao app ---
async function handleDeletePost(post) {
  try {
    const firebase = initializeFirebaseFeed();
    if (!firebase) throw new Error('Firebase não inicializado');
    const db = firebase.firestore();
    const storage = firebase.storage();
    // Deleta imagem do Storage se houver
    if (post.imageUrl) {
      try {
        const url = new URL(post.imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)$/);
        let storagePath = null;
        if (pathMatch && pathMatch[1]) {
          storagePath = decodeURIComponent(pathMatch[1].split('?')[0]);
        } else {
          storagePath = post.imageUrl.split('/o/')[1]?.split('?')[0];
        }
        if (storagePath) {
          const imageRef = storage.ref().child(storagePath);
          await imageRef.delete();
        }
      } catch (err) {
        // Loga mas não impede a exclusão do post
        console.warn('Erro ao deletar imagem do Storage:', err);
      }
    }
    await db.collection('posts').doc(post.id).delete();
    FeedState.posts = FeedState.posts.filter(p => p.id !== post.id);
    showToast('success', 'Post apagado com sucesso!');
    await loadPosts();
  } catch (err) {
    showToast('error', 'Erro ao apagar post: ' + (err?.message || ''));
  }
}

// --- Abrir imagem em tela cheia ---
function openImageModal(imageUrl) {
  let modal = document.createElement('div');
  modal.className = 'image-fullscreen-modal';
  modal.innerHTML = `
    <div class="image-fullscreen-overlay"></div>
    <img src="${imageUrl}" class="image-fullscreen-content" alt="Imagem do post" />
    <button class="image-fullscreen-close" aria-label="Fechar imagem"><i class="fas fa-times"></i></button>
  `;
  document.body.appendChild(modal);
  // Fechar ao clicar fora ou no botão
  modal.querySelector('.image-fullscreen-overlay').onclick = close;
  modal.querySelector('.image-fullscreen-close').onclick = close;
  function close() { modal.remove(); }
  // Fechar ao pressionar ESC
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
} 