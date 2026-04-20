export const currentUser = {
  id: 'u1',
  username: 'neon_dreamer',
  fullName: 'Alex River',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
  followers: 12400,
  following: 342,
  bio: 'Digital artist | Cyberpunk aesthetics | 3D Modeler',
  isPro: true,
};

export const stories = [
  { id: 's1', user: { username: 'cyber_ninja', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ninja' }, hasUnseen: true },
  { id: 's2', user: { username: 'pixel_perfect', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pixel' }, hasUnseen: true },
  { id: 's3', user: { username: 'vector_voyager', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vector' }, hasUnseen: false },
  { id: 's4', user: { username: 'holo_gram', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Holo' }, hasUnseen: true },
  { id: 's5', user: { username: 'synth_wave', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Synth' }, hasUnseen: false },
  { id: 's6', user: { username: 'glitch_art', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Glitch' }, hasUnseen: true },
];

export const feed = [
  {
    id: 'p1',
    user: { username: 'cyber_ninja', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ninja' },
    media: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800',
    caption: 'Neon nights in Neo-Tokyo. #cyberpunk #3d',
    likes: 342,
    comments: 24,
    timeAgo: '2h',
    isLiked: false,
    isSaved: true
  },
  {
    id: 'p2',
    user: { username: 'synth_wave', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Synth' },
    media: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800',
    caption: 'Vaporwave vibes. Riding the retro grid. 🌴🌇',
    likes: 1024,
    comments: 89,
    timeAgo: '5h',
    isLiked: true,
    isSaved: false
  },
  {
    id: 'p3',
    user: { username: 'vector_voyager', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vector' },
    media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    caption: 'Abstract fluid dynamics. Rendered in Blender.',
    likes: 856,
    comments: 42,
    timeAgo: '1d',
    isLiked: false,
    isSaved: false
  }
];

export const exploreGrid = [
  { id: 'e1', media: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500', height: 300 },
  { id: 'e2', media: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=500', height: 200 },
  { id: 'e3', media: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=500', height: 400 },
  { id: 'e4', media: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=500', height: 250 },
  { id: 'e5', media: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=500', height: 350 },
  { id: 'e6', media: 'https://images.unsplash.com/photo-1588698188151-51213f596bfa?auto=format&fit=crop&q=80&w=500', height: 200 },
  { id: 'e7', media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500', height: 300 },
];

export const notifications = [
  { id: 'n1', type: 'like', user: { username: 'cyber_ninja', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ninja' }, post: { media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100' }, timeAgo: '10m', isRead: false },
  { id: 'n2', type: 'follow', user: { username: 'pixel_perfect', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pixel' }, timeAgo: '1h', isRead: false },
  { id: 'n3', type: 'comment', user: { username: 'holo_gram', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Holo' }, content: 'This lighting is incredible! How did you achieve this material?', post: { media: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=100' }, timeAgo: '3h', isRead: true },
  { id: 'n4', type: 'like', user: { username: 'vector_voyager', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vector' }, post: { media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100' }, timeAgo: '1d', isRead: true },
];
