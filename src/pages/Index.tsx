import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface User {
  id: number;
  name: string;
  avatar: string;
  reputation: number;
  posts: number;
  rank: string;
}

interface Topic {
  id: number;
  title: string;
  author: User;
  category: string;
  replies: number;
  views: number;
  lastReply: {
    author: string;
    time: string;
  };
  isPinned?: boolean;
  isLocked?: boolean;
}

const mockUsers: User[] = [
  { id: 1, name: 'Алексей', avatar: '', reputation: 1250, posts: 342, rank: 'Модератор' },
  { id: 2, name: 'Мария', avatar: '', reputation: 890, posts: 156, rank: 'Активный участник' },
  { id: 3, name: 'Дмитрий', avatar: '', reputation: 2100, posts: 678, rank: 'Эксперт' },
  { id: 4, name: 'Елена', avatar: '', reputation: 450, posts: 89, rank: 'Новичок' },
];

const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Добро пожаловать на форум! Правила общения',
    author: mockUsers[0],
    category: 'Объявления',
    replies: 24,
    views: 1203,
    lastReply: { author: 'Мария', time: '2 часа назад' },
    isPinned: true,
  },
  {
    id: 2,
    title: 'Как правильно задавать вопросы на форуме',
    author: mockUsers[2],
    category: 'Помощь новичкам',
    replies: 156,
    views: 5432,
    lastReply: { author: 'Дмитрий', time: '15 минут назад' },
  },
  {
    id: 3,
    title: 'Обсуждение новых функций платформы',
    author: mockUsers[1],
    category: 'Обсуждения',
    replies: 89,
    views: 2341,
    lastReply: { author: 'Алексей', time: '1 час назад' },
  },
  {
    id: 4,
    title: 'Решение проблем с авторизацией',
    author: mockUsers[0],
    category: 'Техническая поддержка',
    replies: 12,
    views: 456,
    lastReply: { author: 'Елена', time: '30 минут назад' },
    isLocked: true,
  },
];

const categories = [
  { name: 'Объявления', count: 45, icon: 'Megaphone' },
  { name: 'Обсуждения', count: 234, icon: 'MessagesSquare' },
  { name: 'Помощь новичкам', count: 156, icon: 'HelpCircle' },
  { name: 'Техническая поддержка', count: 89, icon: 'Wrench' },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');

  const getReputationColor = (reputation: number) => {
    if (reputation >= 2000) return 'bg-purple-600';
    if (reputation >= 1000) return 'bg-purple-500';
    if (reputation >= 500) return 'bg-purple-400';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="MessagesSquare" size={32} className="text-primary-foreground" />
              <h1 className="text-2xl font-bold">Форум сообщества</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>
              <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Icon name="UserPlus" size={16} className="mr-2" />
                Регистрация
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по темам и сообщениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/95"
            />
          </div>
        </div>
      </header>

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
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={category.icon as any} size={18} className="text-primary" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
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
                {mockUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
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
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать тему
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {mockTopics.map((topic, index) => (
                  <div key={topic.id}>
                    <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 hidden sm:block">
                          <AvatarImage src={topic.author.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {topic.author.name[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            {topic.isPinned && (
                              <Icon name="Pin" size={16} className="text-primary mt-1 flex-shrink-0" />
                            )}
                            {topic.isLocked && (
                              <Icon name="Lock" size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
                            )}
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                              {topic.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {topic.author.name}
                            </span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <div className={`h-2 w-2 rounded-full ${getReputationColor(topic.author.reputation)}`} />
                              {topic.author.reputation}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="MessageSquare" size={16} />
                              {topic.replies} ответов
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Eye" size={16} />
                              {topic.views} просмотров
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                              <Icon name="Clock" size={16} />
                              {topic.lastReply.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < mockTopics.length - 1 && <Separator />}
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
              <span>Онлайн: 127 пользователей</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
