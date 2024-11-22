import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { actions } from "astro:actions";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
 
const formSchema = z.object({
  name: z.string().min(2).max(50),
  date: z.string(),
  amount: z.number().positive(),
  payment_method: z.string(),
  trans_no: z.number()
})

export function ProfileForm() {
    const { toast } = useToast()
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        date: new Date("2024-11-13").toISOString().split("T")[0],
        amount: 0,
        payment_method: "check",
        trans_no: 0,
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      // console.log(values)
      const { data, error } = await actions.postTransaction(values);
      form.reset();
      toast({
        title: "Submitted",
        description: "The data has been submitted to quickbooks",
      })
      // If there is an error, show it to user.
      // ❌ This won't be type safe because `error` is not a `z.infer<typeof formSchema>`
      if (error) {
        console.log(error);
      }
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField 
            control={form.control} 
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
          )}
            />

            <FormField 
            control={form.control} 
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} 
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
          )}
            />

          <FormField 
            control={form.control} 
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
          )}
            />

          <FormField 
            control={form.control} 
            name="trans_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Number</FormLabel>
                <FormControl>
                  <Input type="number" {...field} 
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}  
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
          )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )
  }

