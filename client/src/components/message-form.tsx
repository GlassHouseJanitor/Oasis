import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Resident } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MessageFormProps {
  residents: Resident[];
  onCancel: () => void;
  onSuccess: () => void;
}

const messageFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message content is required"),
  recipientType: z.string().min(1, "Recipient type is required"),
  recipientId: z.string().optional(),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export default function MessageForm({ 
  residents, 
  onCancel,
  onSuccess 
}: MessageFormProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      content: "",
      recipientType: "all",
      recipientId: "",
    },
  });
  
  // Watch recipient type to conditionally show recipient select
  const recipientType = form.watch("recipientType");
  
  const onSubmit = async (values: MessageFormValues) => {
    setIsSending(true);
    
    try {
      await apiRequest("POST", "/api/messages", {
        subject: values.subject,
        content: values.content,
        recipientType: values.recipientType,
        recipientId: values.recipientType === "individual" ? parseInt(values.recipientId!) : undefined,
        sentAt: new Date(),
        sender: "Admin User", // Hardcoded for demo, would come from auth in real app
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onSuccess();
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold font-montserrat text-[#264653] mb-4">Send Message</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="recipientType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset recipientId if not individual
                    if (value !== "individual") {
                      form.setValue("recipientId", "");
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Residents</SelectItem>
                    <SelectItem value="individual">Individual Resident</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {recipientType === "individual" && (
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Resident</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem 
                          key={resident.id} 
                          value={resident.id.toString()}
                        >
                          {resident.firstName} {resident.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Message subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your message here"
                    className="min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
