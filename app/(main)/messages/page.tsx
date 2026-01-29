'use client';

import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone,
  Video,
  Paperclip,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Message } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await api.request('/messages/conversations');
      if (response.success && response.data) {
        setConversations(response.data);
        if (response.data.length > 0) {
          setSelectedConversation(response.data[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      const response = await api.request(`/messages/${userId}`);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await api.request(`/messages/${selectedConversation.user.id}`, {
        method: 'POST',
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'TEXT'
        })
      });

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const displayName = conv.user.displayName?.toLowerCase() || '';
    const username = conv.user.username.toLowerCase();
    const lastMessage = conv.lastMessage.content?.toLowerCase() || '';
    
    console.log('Search Debug:', {
      query,
      displayName,
      username,
      lastMessage,
      matches: {
        displayName: displayName.includes(query),
        username: username.includes(query),
        lastMessage: lastMessage.includes(query)
      }
    });
    
    return displayName.includes(query) || 
           username.includes(query) || 
           lastMessage.includes(query);
  });

  console.log('Conversations:', conversations.length);
  console.log('Filtered:', filteredConversations.length);
  console.log('Search Query:', searchQuery);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div className="h-full">
        <div className="flex h-full bg-white">
          {/* Desktop & Tablet Layout */}
          <div className="hidden md:flex h-full w-full">
            {/* Sidebar */}
            <div className="w-64 md:w-72 lg:w-80 border-r flex flex-col">
              {/* Sidebar Header */}
              <div className="p-3 md:p-4 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  <h1 className="text-lg md:text-xl font-bold">Chats</h1>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search in chats"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 text-sm"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-sm">Loading conversations...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        className={`p-2 md:p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-1 ${
                          selectedConversation?.user.id === conversation.user.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarImage src={conversation.user.profileImageUrl} />
                              <AvatarFallback className="bg-muted text-xs md:text-sm">
                                {(conversation.user.displayName || conversation.user.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-xs md:text-sm truncate">
                                {conversation.user.displayName || conversation.user.username}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-sm md:text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        No conversations match "{searchQuery}"
                      </p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-sm md:text-lg font-semibold mb-2">No conversations yet</h3>
                      <p className="text-muted-foreground mb-4 text-xs md:text-sm">
                        Start connecting with other users to begin messaging
                      </p>
                      <Button variant="outline" onClick={() => window.location.href = '/explore'} size="sm">
                        Discover Users
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Clear search to see all conversations
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 md:p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage src={selectedConversation.user.profileImageUrl} />
                            <AvatarFallback>
                              {(selectedConversation.user.displayName || selectedConversation.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConversation.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">
                            {selectedConversation.user.displayName || selectedConversation.user.username}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {selectedConversation.isOnline ? 'Online now' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                          <Search className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                          <Video className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-3 md:p-6">
                      {messages.length > 0 ? (
                        <div className="space-y-3 md:space-y-4 max-w-2xl md:max-w-4xl">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderId === selectedConversation.user.id ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[85%] md:max-w-md lg:max-w-lg px-3 md:px-4 py-2 md:py-3 rounded-2xl ${
                                  message.senderId === selectedConversation.user.id
                                    ? 'bg-muted text-foreground rounded-bl-md'
                                    : 'bg-blue-500 text-white rounded-br-md'
                                }`}
                              >
                                <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <MessageCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm md:text-base">No messages yet</p>
                            <p className="text-xs md:text-sm text-muted-foreground">Send a message to start the conversation</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-3 md:p-6 border-t">
                      <form onSubmit={sendMessage} className="flex items-center gap-2 md:gap-4 max-w-2xl md:max-w-4xl">
                        <Button variant="ghost" size="icon" type="button" className="h-8 w-8 md:h-10 md:w-10">
                          <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isSending}
                            className="pr-10 md:pr-12 rounded-full h-10 md:h-12 text-sm md:text-base"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button"
                            className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8"
                          >
                            <Smile className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={!newMessage.trim() || isSending}
                          className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0"
                        >
                          <Send className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-base md:text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground text-sm md:text-base">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col h-full w-full">
            {!selectedConversation ? (
              /* Mobile Conversations List */
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                    <h1 className="text-xl font-bold">Messages</h1>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search conversations"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/30"
                    />
                  </div>
                </div>

                {/* Mobile Conversations */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading conversations...</p>
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      filteredConversations.map((conversation) => (
                        <div
                          key={conversation.user.id}
                          className="p-4 rounded-lg border bg-white cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={conversation.user.profileImageUrl} />
                                <AvatarFallback className="bg-muted">
                                  {(conversation.user.displayName || conversation.user.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold truncate">
                                  {conversation.user.displayName || conversation.user.username}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage.content}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start connecting with other users to begin messaging
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/explore'}>
                          Discover Users
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              /* Mobile Chat View */
              <div className="flex flex-col h-full">
                {/* Mobile Chat Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      className="h-8 w-8"
                    >
                      <Search className="h-4 w-4 rotate-180" />
                    </Button>
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.user.profileImageUrl} />
                        <AvatarFallback>
                          {(selectedConversation.user.displayName || selectedConversation.user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {selectedConversation.user.displayName || selectedConversation.user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.isOnline ? 'Online now' : 'Offline'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === selectedConversation.user.id ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                              message.senderId === selectedConversation.user.id
                                ? 'bg-muted text-foreground rounded-bl-md'
                                : 'bg-blue-500 text-white rounded-br-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Mobile Message Input */}
                <div className="p-4 border-t bg-white">
                  <form onSubmit={sendMessage} className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" type="button" className="h-10 w-10">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className="pr-12 rounded-full h-12"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className="rounded-full h-12 w-12 p-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}