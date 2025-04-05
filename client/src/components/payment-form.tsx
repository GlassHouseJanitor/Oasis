import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PaymentFormProps {
  residents: Resident[];
  selectedResident: Resident | null;
  onSuccess: () => void;
}

const paymentFormSchema = z.object({
  residentId: z.string().min(1, "Resident is required"),
  amount: z.string().min(1, "Amount is required")
    .refine(val => !isNaN(parseFloat(val)), "Amount must be a number")
    .refine(val => parseFloat(val) > 0, "Amount must be greater than 0"),
  datePaid: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function PaymentForm({ 
  residents, 
  selectedResident,
  onSuccess 
}: PaymentFormProps) {
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      residentId: selectedResident ? selectedResident.id.toString() : "",
      amount: "450.00",
      datePaid: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "Cash",
      notes: "",
      invoiceId: "",
    },
  });
  
  const onSubmit = async (values: PaymentFormValues) => {
    try {
      // Convert amount to cents for storage
      const amountInCents = Math.round(parseFloat(values.amount) * 100);
      
      await apiRequest("POST", "/api/payments", {
        residentId: parseInt(values.residentId),
        amount: amountInCents,
        datePaid: new Date(values.datePaid),
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        invoiceId: values.invoiceId || undefined,
      });
      
      toast({
        title: "Payment Recorded",
        description: "The payment has been successfully recorded",
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="residentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resident</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!!selectedResident}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resident" />
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
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  placeholder="450.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="datePaid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="invoiceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="INV-2023-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Additional payment details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => onSuccess()}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
