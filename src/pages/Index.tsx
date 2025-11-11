import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/ce4b70fb-5570-432e-b6b0-6c4eeae00c86';

interface User {
  id: number;
  username: string;
  avatar_url: string | null;
  reputation: number;
  post_count: number;
}

interface Topic {
  id: number;
  title: string;
  author_name: string;
  author_avatar: string | null;
  author_reputation: number;
  category_name: string;
  category_icon: string;
  replies: number;
  views: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  display_order: number;
}

export default function Index() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    loadTopics();
    loadCategories();
    loadTopUsers();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await fetch(`${API_URL}?action=topics`);
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}?action=categories`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTopUsers = async () => {
    try {
      const response = await fetch(`${API_URL}?action=top_users`);
      const data = await response.json();
      setTopUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadTopic = async (topicId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=topic&id=${topicId}`);
      const data = await response.json();
      setSelectedTopic(data);
    } catch (error) {
      console.error('Failed to load topic:', error);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle || !newTopicCategory || !newTopicContent) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_topic',
          title: newTopicTitle,
          category_id: parseInt(newTopicCategory),
          author_id: 1,
          content: newTopicContent,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Тема создана!',
        });
        setNewTopicTitle('');
        setNewTopicCategory('');
        setNewTopicContent('');
        loadTopics();
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const togglePin = async (topicId: number) => {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_pin', topic_id: topicId }),
      });
      loadTopics();
      toast({ title: 'Закрепление изменено' });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const toggleLock = async (topicId: number) => {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_lock', topic_id: topicId }),
      });
      loadTopics();
      toast({ title: 'Блокировка изменена' });
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 2000) return 'bg-purple-600';
    if (reputation >= 1000) return 'bg-purple-500';
    if (reputation >= 500) return 'bg-purple-400';
    return 'bg-gray-400';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    return `${Math.floor(seconds / 86400)} дн назад`;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="MessagesSquare" size={32} className="text-primary-foreground" />
              <h1 className="text-2xl font-bold">Форум сообщества</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <Icon name="Sun" size={18} className={!darkMode ? 'text-yellow-400' : 'text-white/50'} />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Icon name="Moon" size={18} className={darkMode ? 'text-blue-300' : 'text-white/50'} />
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                <Icon name="Shield" size={16} className="mr-2" />
                Админ
              </Button>
              <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по темам и сообщениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-background/50"
            />
          </div>
        </div>
      </header>

      {showAdminPanel && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={20} className="text-yellow-600 dark:text-yellow-400" />
                <h2 className="font-semibold text-yellow-900 dark:text-yellow-200">Панель администратора</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAdminPanel(false)}>
                <Icon name="X" size={18} />
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={loadTopics}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
              <Button size="sm" variant="outline">
                <Icon name="Users" size={16} className="mr-2" />
                Пользователи
              </Button>
              <Button size="sm" variant="outline">
                <Icon name="Flag" size={16} className="mr-2" />
                Жалобы
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="FolderOpen" size={20} />
                  Категории
                </h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={category.icon as any} size={18} className="text-primary" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} />
                  Топ пользователей
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.username}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${getReputationColor(user.reputation)}`} />
                        <span className="text-xs text-muted-foreground">{user.reputation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Последние темы</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Создать тему
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Новая тема</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Заголовок</Label>
                      <Input
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="О чём вы хотите поговорить?"
                      />
                    </div>
                    <div>
                      <Label>Категория</Label>
                      <Select value={newTopicCategory} onValueChange={setNewTopicCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Сообщение</Label>
                      <Textarea
                        value={newTopicContent}
                        onChange={(e) => setNewTopicContent(e.target.value)}
                        placeholder="Расскажите подробнее..."
                        rows={6}
                      />
                    </div>
                    <Button onClick={createTopic} className="w-full">
                      Создать тему
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {topics.map((topic, index) => (
                  <div key={topic.id}>
                    <div className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 hidden sm:block">
                          <AvatarImage src={topic.author_avatar || ''} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {topic.author_name[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            {topic.is_pinned && (
                              <Icon name="Pin" size={16} className="text-primary mt-1 flex-shrink-0" />
                            )}
                            {topic.is_locked && (
                              <Icon name="Lock" size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
                            )}
                            <h3 
                              className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer"
                              onClick={() => loadTopic(topic.id)}
                            >
                              {topic.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {topic.author_name}
                            </span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {topic.category_name}
                            </Badge>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <div className={`h-2 w-2 rounded-full ${getReputationColor(topic.author_reputation)}`} />
                              {topic.author_reputation}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="MessageSquare" size={16} />
                              {topic.reply_count} ответов
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Eye" size={16} />
                              {topic.views} просмотров
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                              <Icon name="Clock" size={16} />
                              {getTimeAgo(topic.updated_at)}
                            </span>
                            {showAdminPanel && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => togglePin(topic.id)}
                                >
                                  <Icon name="Pin" size={14} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => toggleLock(topic.id)}
                                >
                                  <Icon name="Lock" size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < topics.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTopic.topic?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTopic.posts?.map((post: any, index: number) => (
                <Card key={post.id} className={index === 0 ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author_avatar || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {post.author_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{post.author_name}</span>
                          {post.is_admin && (
                            <Badge variant="destructive">Админ</Badge>
                          )}
                          {post.is_moderator && (
                            <Badge variant="secondary">Модератор</Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {getTimeAgo(post.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                        {post.attachments?.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {post.attachments.map((att: any) => (
                              <Badge key={att.id} variant="outline">
                                <Icon name="Paperclip" size={12} className="mr-1" />
                                {att.filename}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary transition-colors">Правила форума</a>
              <a href="#" className="hover:text-primary transition-colors">Помощь</a>
              <a href="#" className="hover:text-primary transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              <span>Всего пользователей: {topUsers.length}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
