// src/hooks/useChat.js
// Production-grade chat hook.
// • Typing indicators — debounced, auto-cleared after 3s
// • Message delivery receipts (✓ sent → ✓✓ read)
// • Pagination — loads 30 messages, infinite scroll backwards
// • Image upload via Supabase Storage
// • Unread badge per conversation

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, uploadChatImage } from '@zaradrop/lib';

const PAGE_SIZE    = 30;
const TYPING_MS    = 3000; // clear typing indicator after 3s

export function useChat(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const mounted       = useRef(true);
  const typingTimers  = useRef({}); // convId → timerId
  const typingStates  = useRef({}); // convId → Set of userIds currently typing

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── Fetch conversations ────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('conversations')
        .select(`
          id, last_message, last_at, created_at,
          p1:profiles!conversations_participant_1_fkey(id, name, role, avatar_url),
          p2:profiles!conversations_participant_2_fkey(id, name, role, avatar_url),
          messages!messages_conversation_id_fkey(id, is_read, sender_id, created_at)
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_at', { ascending: false });

      const enriched = (data ?? []).map(c => {
        const other  = c.p1?.id === userId ? c.p2 : c.p1;
        const msgs   = c.messages ?? [];
        const unread = msgs.filter(m => !m.is_read && m.sender_id !== userId).length;
        const emo    = other?.role === 'store' ? '🏪'
                     : other?.role === 'rider' ? '🏍️' : '🛍️';
        return { ...c, other, emo, unread };
      });

      if (mounted.current) { setConversations(enriched); setLoading(false); }
    } catch {
      if (mounted.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Realtime: conversation list updates ───────────────────
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`convs_rt_${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `participant_1=eq.${userId}`,
      }, fetchConversations)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `participant_2=eq.${userId}`,
      }, fetchConversations)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [userId, fetchConversations]);

  // ── Get or create a 1:1 conversation ──────────────────────
  const getOrCreateConversation = useCallback(async (otherUserId, orderId = null) => {
    const { data, error: e } = await supabase.rpc('get_or_create_conversation', {
      p1: userId, p2: otherUserId, oid: orderId,
    });
    if (e) throw e;
    await fetchConversations();
    return data;
  }, [userId, fetchConversations]);

  // ── Fetch messages (with pagination) ──────────────────────
  const fetchMessages = useCallback(async (convId, { before = null } = {}) => {
    let q = supabase
      .from('messages')
      .select('id, sender_id, content, image_url, is_read, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (before) q = q.lt('created_at', before);

    const { data } = await q;
    // Reverse to chronological order
    return (data ?? []).reverse();
  }, []);

  // ── Subscribe to new messages in a conversation ────────────
  const subscribeToMessages = useCallback((convId, onMessage) => {
    const ch = supabase.channel(`msgs_rt_${convId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (p) => onMessage(p.new))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (p) => onMessage({ ...p.new, _update: true })) // mark as an update
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  // ── Subscribe to typing presence ─────────────────────────
  // Uses Supabase Realtime Presence (no DB writes needed)
  const subscribeToTyping = useCallback((convId, onTypingChange) => {
    const channel = supabase.channel(`typing_${convId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingUsers = Object.keys(state)
          .filter(uid => uid !== userId && state[uid]?.[0]?.typing);
        onTypingChange(typingUsers);
      })
      .subscribe();

    return {
      // Call this when the local user types
      setTyping: (isTyping) => {
        channel.track({ typing: isTyping });
        // Auto-clear after TYPING_MS
        clearTimeout(typingTimers.current[convId]);
        if (isTyping) {
          typingTimers.current[convId] = setTimeout(() => {
            channel.track({ typing: false });
          }, TYPING_MS);
        }
      },
      unsubscribe: () => supabase.removeChannel(channel),
    };
  }, [userId]);

  // ── Send message (text or image) ──────────────────────────
  const sendMessage = useCallback(async (convId, content, imageFile = null) => {
    if (!content?.trim() && !imageFile) return;

    let image_url = null;
    if (imageFile) {
      // Validate file type + size
      const MAX_MB = 10;
      if (!imageFile.type.startsWith('image/')) throw new Error('Only image files are supported');
      if (imageFile.size > MAX_MB * 1024 * 1024) throw new Error(`Image must be under ${MAX_MB}MB`);
      image_url = await uploadChatImage(convId, imageFile);
    }

    const { error: e } = await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id:       userId,
      content:         content?.trim() || null,
      image_url,
    });
    if (e) throw e;
  }, [userId]);

  // ── Mark conversation as read ─────────────────────────────
  const markRead = useCallback(async (convId) => {
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unread: 0 } : c)
    );
  }, [userId]);

  // ── Delete my message ─────────────────────────────────────
  const deleteMessage = useCallback(async (messageId) => {
    await supabase.from('messages')
      .update({ content: null, image_url: null })  // soft delete (preserve receipt)
      .eq('id', messageId)
      .eq('sender_id', userId);
  }, [userId]);

  // ── Computed ───────────────────────────────────────────────
  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unread ?? 0), 0);

  return {
    conversations, loading, unreadTotal,
    refresh:                fetchConversations,
    getOrCreateConversation,
    fetchMessages,          subscribeToMessages,
    subscribeToTyping,
    sendMessage,            deleteMessage,
    markRead,
  };
}