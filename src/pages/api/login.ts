import type { APIRoute } from 'astro';
/* @ts-ignore */
import OAuthClient from 'intuit-oauth';
import oauthClient from '../../utils/authClient';

export const GET: APIRoute = async ({ redirect }) => {
//   const oauthClient = new OAuthClient({
//     clientId: import.meta.env.QUICKBOOKS_CLIENT_ID,
//     clientSecret: import.meta.env.QUICKBOOKS_CLIENT_SECRET,
//     environment: 'sandbox', // or 'production'
//     redirectUri: import.meta.env.QUICKBOOKS_REDIRECT_URI,
//   });

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting], // adjust scope as needed
    state: 'testState',
  });

  return redirect(authUri);
};
