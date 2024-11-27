import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import oauthClient from "../utils/authClient";
/* @ts-ignore */
import QuickBooks from 'node-quickbooks';
import { refreshTokenCookie } from "../utils/authClient";

// const accessToken = oauthClient.token.getToken();

const token = oauthClient.token.getToken()

const qbo = new QuickBooks(
        import.meta.env.QUICKBOOKS_CLIENT_ID,
        import.meta.env.QUICKBOOKS_CLIENT_SECRET,
         token.access_token,
         false, // no token secret for oAuth 2.0
         token.realmId,
         true, // use the sandbox?
         true, // enable debugging?
         null, // set minorversion, or null for the latest version
         '2.0', //oAuth version
         token.refresh_token);

export const server = {
    postTransaction: defineAction({
        input: z.object({
          name: z.string(),
          date: z.string(),
          amount: z.number(),
          payment_method: z.string(),
          trans_no: z.number() || undefined
        }),
        handler: async (input) => {
            let customerId: string = await new Promise((resolve, reject) => {
              qbo.findCustomers(`where DisplayName = '${input.name}'`, function (err: any, customers: any) {
                if (err) resolve(customers.QueryResponse)
                  // reject(new ActionError({code: "BAD_REQUEST", message: 'No customer found'}));
                if (customers.QueryResponse) {
                  resolve(customers.QueryResponse.Customer[0].Id);
                }
                
              })
            });
            
            if (!customerId) {
              customerId = await new Promise((resolve, reject) => {
                qbo.createCustomer({
                DisplayName: input.name,
                FullyQualifiedName: input.name
              }, function (err: any, customer: any) {
                if (err) reject(new ActionError({code:"BAD_REQUEST", message:'No customer created'}));
                resolve(customer.Id)
              })
            })
          }

            const ItemId: string = await new Promise((resolve, reject ) => { 
              qbo.findItems(`where Name = 'Installation'`, function (err: any, items: any) {
              if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No item found'}));
              // console.log('item id', items.QueryResponse.Item[0].Id);
              resolve(items.QueryResponse.Item[0].Id);
              })
            });

            const DocNumber : number = await new Promise((resolve, reject) => {
              qbo.findInvoices(`ORDER BY Id DESC MAXRESULTS 1`, function (err: any, invoices: any) {
                if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No invoice found'}));
                // console.log('DocNumber', invoices.QueryResponse.Invoice[0].DocNumber);
                const num = parseInt(invoices.QueryResponse.Invoice[0].DocNumber)
                resolve(num);
            })
          });

            const invoice = { 
              TxnDate: input.date,
              DocNumber: (DocNumber + 1).toString(),
              CustomerRef: {
                value: customerId // Replace with actual customer ID
              },
              Line: [
                {
                  Amount: input.amount, // Set item price here
                  DetailType: 'SalesItemLineDetail',
                  SalesItemLineDetail: {
                    Qty: 1,
                    UnitPrice: input.amount,
                    ItemRef: {
                      value: ItemId // The item Id
                    }
                  }
                }
              ],
            }

            const savedInvoice = await new Promise((resolve, reject) => {
              qbo.createInvoice(invoice, function (err: any, invoice: any) {
              if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No invoice created'}));
              console.log('Created Invoice', invoice);
              resolve(invoice);
              })
            });

            const paymentMethod = await new Promise((resolve, reject) => {
              qbo.findPaymentMethods(`where Name = '${input.payment_method.trim()}'`, function (err: any, paymentMethod: any) {
              if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No payment method found'}));
              resolve(paymentMethod.QueryResponse.PaymentMethod);
              // console.log('payment method', paymentMethod.QueryResponse.PaymentMethod);
              })
            });

            const account = await new Promise((resolve, reject) => {
              qbo.findAccounts(`where FullyQualifiedName = 'Checking'`, function (err: any, accounts: any) {
                if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No account found'}));
                resolve(accounts.QueryResponse.Account[0])
              })
            });

            const payment = {
              PaymentMethodRef: {
                /* @ts-ignore */
                  value: paymentMethod[0].Id,
               },
               TxnDate: input.date,
               TotalAmt: input.amount,
               CustomerRef: {
                value: customerId
               },
               DepositToAccountRef: {
                /* @ts-ignore */
                value: account.Id
               },
               Line: [
                {
                   Amount: input.amount, // Set item price here
                   LinkedTxn: [
                    {
                      /* @ts-ignore */
                      TxnId: savedInvoice.Id,
                      TxnType: 'Invoice',
                    }
                   ]
                }
               ]
            }

            if (input.trans_no !== 0) {
              Object.assign(payment, {PaymentRefNum: input.trans_no});
              // payment.PaymentRefNum = input.trans_no;
            }

            const savedPayment = await new Promise((resolve, reject) => {
              qbo.createPayment(payment, function (err: any, payments: any) {
              if (err) reject(new ActionError({code: "BAD_REQUEST", message: 'No payment created'}));
              console.log('Created Payment', payments);
              resolve(payments)
              })
            });
        }
    }),

    refreshToken: defineAction({ 
      handler: async () => {

        return  {
          token: refreshTokenCookie()
      }
    }
    })
}