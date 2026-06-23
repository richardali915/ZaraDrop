import { useState, useCallback, useEffect } from 'react';

// Mock hub data by region
const HUBS_BY_REGION = {
  'Maitama': {
    id: 'hub_maitama',
    name: 'Maitama Hub',
    region: 'Maitama',
    emoji: '🏙️',
    members: 1243,
    isMember: false,
    discussions: [
      { id: 'd1', author: 'Chioma O.', avatar: '👩‍💼', content: 'Best restaurants in Maitama? Just moved here!', replies: 12, likes: 45, date: 'Today 2:30 PM' },
      { id: 'd2', author: 'Ahmed K.', avatar: '👨‍💻', content: 'Pro tip: Try Mama\'s Kitchen on weekdays for 20% off!', replies: 8, likes: 67, date: 'Today 1:15 PM' },
      { id: 'd3', author: 'Linda P.', avatar: '👩', content: 'Rider Kola is amazing! Super fast and friendly.', replies: 5, likes: 34, date: 'Yesterday 6:45 PM' },
    ],
  },
  'Wuse II': {
    id: 'hub_wuse2',
    name: 'Wuse II Hub',
    region: 'Wuse II',
    emoji: '🏬',
    members: 987,
    isMember: true,
    discussions: [
      { id: 'd4', author: 'You', avatar: '👤', content: 'Pizza Palace delivery is always on time!', replies: 3, likes: 22, date: 'Today 4:00 PM' },
      { id: 'd5', author: 'Tunde B.', avatar: '👨', content: 'Anyone know good pharmacies with late hours?', replies: 15, likes: 28, date: 'Today 11:30 AM' },
    ],
  },
  'Garki': {
    id: 'hub_garki',
    name: 'Garki Hub',
    region: 'Garki',
    emoji: '🌳',
    members: 654,
    isMember: false,
    discussions: [
      { id: 'd6', author: 'Ade M.', avatar: '👨‍🔧', content: 'New supermarket opening next month!', replies: 21, likes: 89, date: 'Today 9:15 AM' },
    ],
  },
  'Gwarimpa': {
    id: 'hub_gwarimpa',
    name: 'Gwarimpa Hub',
    region: 'Gwarimpa',
    emoji: '🌆',
    members: 2134,
    isMember: true,
    discussions: [
      { id: 'd7', author: 'Grace E.', avatar: '👩‍🎨', content: 'Store review: 5 stars for Chicken X-Press!', replies: 7, likes: 51, date: 'Today 3:45 PM' },
    ],
  },
  'Kubwa': {
    id: 'hub_kubwa',
    name: 'Kubwa Hub',
    region: 'Kubwa',
    emoji: '🏘️',
    members: 543,
    isMember: false,
    discussions: [],
  },
};

export function useHubs(userRegion = 'Wuse II') {
  const [currentRegion, setRegion] = useState(userRegion);
  const [selectedHub, setHub] = useState(null);
  const [expandedDiscussion, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');

  const hub = HUBS_BY_REGION[currentRegion] || HUBS_BY_REGION['Wuse II'];

  const joinHub = useCallback((region) => {
    const h = HUBS_BY_REGION[region];
    if (h) {
      h.isMember = true;
      setRegion(region);
    }
  }, []);

  const postDiscussion = useCallback((text) => {
    if (!text.trim() || !hub) return;
    const discussion = {
      id: `d${Date.now()}`,
      author: 'You',
      avatar: '👤',
      content: text,
      replies: 0,
      likes: 0,
      date: 'Just now',
    };
    hub.discussions.unshift(discussion);
    setNewDiscussion('');
  }, [hub]);

  const likeDiscussion = useCallback((discussionId) => {
    if (!hub) return;
    const d = hub.discussions.find(x => x.id === discussionId);
    if (d) d.likes++;
  }, [hub]);

  const replyToDiscussion = useCallback((discussionId, text) => {
    if (!text.trim() || !hub) return;
    const d = hub.discussions.find(x => x.id === discussionId);
    if (d) {
      d.replies++;
    }
    setReplyText('');
  }, [hub]);

  return {
    hub,
    currentRegion,
    setRegion,
    selectedHub,
    setHub,
    expandedDiscussion,
    setExpanded,
    replyText,
    setReplyText,
    newDiscussion,
    setNewDiscussion,
    joinHub,
    postDiscussion,
    likeDiscussion,
    replyToDiscussion,
    allRegions: Object.keys(HUBS_BY_REGION),
    allHubs: Object.values(HUBS_BY_REGION),
  };
}
