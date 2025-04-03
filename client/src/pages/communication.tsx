import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Message, Resident } from "@shared/schema";
import MessageForm from "@/components/message-form";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Inbox
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Communication() {
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const { toast } = useToast();
  
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });
  
  const {
    data: residents,
    isLoading: isLoadingResidents,
  } = useQuery<Resident[]>({
    queryKey: ['/api/residents'],
  });
  
  // Filter messages based on search query
  const filteredMessages = messages?.filter(message => {
    const subject = message.subject.toLowerCase();
    const content = message.content.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return subject.includes(query) || content.includes(query);
  }) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil((filteredMessages?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);
  
  const handleNewMessage = () => {
    setShowMessageForm(true);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Communication</h1>
      
      <Tabs 
        defaultValue="messages" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6">
          {showMessageForm ? (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <MessageForm
                  residents={residents || []}
                  onCancel={() => setShowMessageForm(false)}
                  onSuccess={() => {
                    setShowMessageForm(false);
                    toast({
                      title: "Message Sent",
                      description: "Your message has been sent successfully",
                    });
                  }} 
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Message History</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search messages..."
                        className="pl-9 pr-4 py-2 w-56"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <Button 
                      className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
                      onClick={handleNewMessage}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Subject</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Recipient</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Sent Date</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingMessages ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">Loading messages...</TableCell>
                        </TableRow>
                      ) : paginatedMessages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {searchQuery 
                              ? "No messages match your search" 
                              : "No messages sent yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedMessages.map(message => {
                          return (
                            <TableRow key={message.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="font-medium">{message.subject}</div>
                              </TableCell>
                              <TableCell>
                                {message.recipientType === 'individual' ? (
                                  <div className="flex items-center">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      Individual
                                    </span>
                                    <span className="ml-2">ID: {message.recipientId}</span>
                                  </div>
                                ) : message.recipientType === 'house' ? (
                                  <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs inline-block">
                                    House
                                  </div>
                                ) : (
                                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs inline-block">
                                    All Residents
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(message.sentAt), "MMM d, yyyy h:mma")}
                              </TableCell>
                              <TableCell>
                                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs inline-block">
                                  Sent
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-[#264653] hover:text-[#2A9D8F]"
                                    onClick={() => {
                                      toast({
                                        title: "View Message",
                                        description: "Message details will be shown here",
                                      });
                                    }}
                                  >
                                    View
                                  </button>
                                  <button 
                                    className="text-[#264653] hover:text-[#2A9D8F]"
                                    onClick={() => {
                                      toast({
                                        title: "Message sent again",
                                        description: "The message has been resent",
                                      });
                                    }}
                                  >
                                    Resend
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {filteredMessages.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMessages.length)} of {filteredMessages.length} messages
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum = currentPage;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage === 1) {
                          pageNum = i + 1;
                        } else if (currentPage === totalPages) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? "bg-[#2A9D8F]" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Announcements</h2>
                <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </div>
              
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                  <MessageSquare className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No announcements yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Create announcements to notify all residents about important information or upcoming events.
                </p>
                <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Announcement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Message Templates</h2>
                <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
              
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                  <Mail className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No templates yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Create message templates to quickly send common communications to residents.
                </p>
                <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
