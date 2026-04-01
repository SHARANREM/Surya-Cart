import { db, auth } from './firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    addDoc, 
    serverTimestamp, 
    onSnapshot, 
    orderBy
} from 'firebase/firestore';
import { showToast } from '../utils/helpers.js';

export function listenToMessages(chatId, container) {
    const q = query(
        collection(db, 'messages'), 
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<div class="flex-grow flex items-center justify-center text-gray-400"><p>No messages yet. Say hello!</p></div>';
            return;
        }

        snapshot.forEach(doc => {
            const msg = doc.data();
            const isMe = msg.senderId === auth.currentUser.uid;
            
            const div = document.createElement('div');
            div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            div.innerHTML = `
                <div class="max-w-[70%] px-4 py-2 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}">
                    <p class="text-sm">${msg.message}</p>
                    <p class="text-[10px] mt-1 opacity-70 text-right">${msg.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || '...'}</p>
                </div>
            `;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    });
}

export async function sendMessage(chatId, message) {
    if (!message || !chatId) return;

    try {
        const user = auth.currentUser;
        const [id1, id2] = chatId.split('_');
        const targetId = id1 === user.uid ? id2 : id1;

        await addDoc(collection(db, 'messages'), {
            chatId,
            senderId: user.uid,
            receiverId: targetId,
            message,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        showToast(error.message, 'error');
    }
}
