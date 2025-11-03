'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Ticket {
  id: string;
  ticketNumber: string;
  user: { name: string; avatar: string };
  subject: string;
  category: 'Technical' | 'Billing' | 'Account' | 'Content' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  assignedTo: string | null;
  lastUpdate: string;
  createdAt: string;
  messages: number;
}

const DEMO_TICKETS: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TCK-2024-001',
    user: { name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John3' },
    subject: 'Cannot upload video content',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    assignedTo: null,
    lastUpdate: '5 minutes ago',
    createdAt: '2024-01-22 14:30',
    messages: 1,
  },
  {
    id: '2',
    ticketNumber: 'TCK-2024-002',
    user: { name: 'Sarah Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah3' },
    subject: 'Payment not received',
    category: 'Billing',
    priority: 'Urgent',
    status: 'In Progress',
    assignedTo: 'Support Team',
    lastUpdate: '1 hour ago',
    createdAt: '2024-01-22 12:00',
    messages: 5,
  },
  {
    id: '3',
    ticketNumber: 'TCK-2024-003',
    user: { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike3' },
    subject: 'Account verification issue',
    category: 'Account',
    priority: 'Medium',
    status: 'Waiting',
    assignedTo: 'Admin Team',
    lastUpdate: '3 hours ago',
    createdAt: '2024-01-22 09:15',
    messages: 3,
  },
  {
    id: '4',
    ticketNumber: 'TCK-2024-004',
    user: { name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma3' },
    subject: 'Content removal request',
    category: 'Content',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Moderation Team',
    lastUpdate: '1 day ago',
    createdAt: '2024-01-21 16:45',
    messages: 7,
  },
  {
    id: '5',
    ticketNumber: 'TCK-2024-005',
    user: { name: 'Alex Turner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex3' },
    subject: 'Subscription cancellation',
    category: 'Billing',
    priority: 'Medium',
    status: 'Closed',
    assignedTo: 'Billing Team',
    lastUpdate: '2 days ago',
    createdAt: '2024-01-20 14:00',
    messages: 4,
  },
  {
    id: '6',
    ticketNumber: 'TCK-2024-006',
    user: { name: 'Lisa Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa3' },
    subject: 'Feature request: Dark mode',
    category: 'Other',
    priority: 'Low',
    status: 'Open',
    assignedTo: null,
    lastUpdate: '4 hours ago',
    createdAt: '2024-01-22 10:30',
    messages: 2,
  },
  {
    id: '7',
    ticketNumber: 'TCK-2024-007',
    user: { name: 'David Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David3' },
    subject: 'Login issues on mobile',
    category: 'Technical',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Tech Team',
    lastUpdate: '2 hours ago',
    createdAt: '2024-01-22 08:00',
    messages: 6,
  },
  {
    id: '8',
    ticketNumber: 'TCK-2024-008',
    user: { name: 'Rachel Green', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel3' },
    subject: 'Payout delay inquiry',
    category: 'Billing',
    priority: 'Urgent',
    status: 'Open',
    assignedTo: null,
    lastUpdate: '30 minutes ago',
    createdAt: '2024-01-22 13:45',
    messages: 2,
  },
  {
    id: '9',
    ticketNumber: 'TCK-2024-009',
    user: { name: 'Chris Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris3' },
    subject: 'Profile picture upload error',
    category: 'Technical',
    priority: 'Medium',
    status: 'Waiting',
    assignedTo: 'Support Team',
    lastUpdate: '6 hours ago',
    createdAt: '2024-01-22 07:00',
    messages: 4,
  },
  {
    id: '10',
    ticketNumber: 'TCK-2024-010',
    user: { name: 'Amanda White', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda3' },
    subject: 'Copyright claim dispute',
    category: 'Content',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Legal Team',
    lastUpdate: '1 hour ago',
    createdAt: '2024-01-22 11:20',
    messages: 8,
  },
];

type TabType = 'all' | 'open' | 'in-progress' | 'waiting' | 'resolved';

export default function SupportPage() {  const t = useTranslations('admin.support');
  const [activeTab, setActiveTab] = useState<TabType>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Helper functions for translation
  function translateCategory(category: string): string {
    return t(`categories.${category.toLowerCase()}`);
  }

  function translatePriority(priority: string): string {
    return t(`priorities.${priority.toLowerCase()}`);
  }

  function translateStatus(status: string): string {
    const key = status.toLowerCase().replace(/\s+/g, '');
    if (key === 'inprogress') return t('statuses.inProgress');
    return t(`statuses.${key}`);
  }

  const stats = {
    open: DEMO_TICKETS.filter((t) => t.status === 'Open').length,
    inProgress: DEMO_TICKETS.filter((t) => t.status === 'In Progress').length,
    waiting: DEMO_TICKETS.filter((t) => t.status === 'Waiting').length,
    resolved: DEMO_TICKETS.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
    avgResponseTime: '2.5 hours',
    satisfactionRate: '94%',
  };

  const filteredTickets = DEMO_TICKETS.filter((ticket) => {
    let tabMatch = true;
    if (activeTab === 'open') tabMatch = ticket.status === 'Open';
    if (activeTab === 'in-progress') tabMatch = ticket.status === 'In Progress';
    if (activeTab === 'waiting') tabMatch = ticket.status === 'Waiting';
    if (activeTab === 'resolved') tabMatch = ticket.status === 'Resolved' || ticket.status === 'Closed';

    const searchMatch =
      searchQuery === '' ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedTickets(checked ? filteredTickets.map((t) => t.id) : []);
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    setSelectedTickets(checked ? [...selectedTickets, ticketId] : selectedTickets.filter((id) => id !== ticketId));
  };

  const handleAssignSelected = () => {
    const plural = selectedTickets.length > 1 ? 's' : '';
    toast.success(t('toasts.ticketsAssigned'), {
        description: t('toasts.ticketsAssignedMessage', { count: selectedTickets.length, plural
      }),
    });
    setSelectedTickets([]);
  };

  const handleCloseSelected = () => {
    const plural = selectedTickets.length > 1 ? 's' : '';
    toast.success(t('toasts.ticketsClosed'), {
        description: t('toasts.ticketsClosedMessage', { count: selectedTickets.length, plural
      }),
    });
    setSelectedTickets([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technical: 'bg-blue-100 text-blue-800',
      Billing: 'bg-green-100 text-green-800',
      Account: 'bg-purple-100 text-purple-800',
      Content: 'bg-orange-100 text-orange-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-gray-600">{t('stats.open')}</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <div className="text-sm text-gray-600">{t('stats.inProgress')}</div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-gray-600">{t('stats.waiting')}</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-600">{t('stats.resolved')}</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.avgResponse')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.satisfaction')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('tabs.all') },
          { key: 'open', label: t('tabs.open') },
          { key: 'in-progress', label: t('tabs.inProgress') },
          { key: 'waiting', label: t('tabs.waiting') },
          { key: 'resolved', label: t('tabs.resolved') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#00B8A9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTickets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">{selectedTickets.length} {t('bulk.selected')}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAssignSelected}>
              {t('bulk.assign')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCloseSelected}>
              {t('bulk.close')}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.ticket')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.user')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.subject')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.category')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.priority')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.assigned')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.lastUpdate')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-mono text-xs text-gray-900">{ticket.ticketNumber}</div>
                    <div className="text-xs text-gray-500">{ticket.createdAt}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={ticket.user.avatar} />
                      <AvatarFallback>{ticket.user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">{ticket.user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{ticket.subject}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messages} {t('table.messages')}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getCategoryColor(ticket.category)}>{translateCategory(ticket.category)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPriorityColor(ticket.priority)}>{translatePriority(ticket.priority)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(ticket.status)}>{translateStatus(ticket.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{ticket.assignedTo || t('table.unassigned')}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{ticket.lastUpdate}</span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm">
                    {t('actions.view')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
