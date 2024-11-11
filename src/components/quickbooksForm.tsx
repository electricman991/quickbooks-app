import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
 
const formSchema = z.object({
  name: z.string().min(2).max(50),
  date: z.string(),
  amount: z.number().positive(),
  payment_method: z.string(),
  trans_no: z.number().positive()
})

export function ProfileForm() {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        date: new Date("2023-05-04").toISOString().split("T")[0],
        amount: 0,
        payment_method:""
      },
    })
   
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      console.log(values)
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
                <FormControl>
                  <Input type="text" placeholder="check" {...field} />
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

