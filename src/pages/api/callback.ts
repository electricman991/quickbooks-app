import type { APIRoute } from 'astro';
/* @ts-ignore */
import OAuthClient from 'intuit-oauth';
import { serialize } from 'cookie';
import oauthClient from '../../utils/authClient'

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect }) => {

  const query = new URLSearchParams(url.search);
  const authCode = query.get('code');
  const state = query.get('state'); // Handle state validation if needed

  if (!authCode) {
    return new Response('Authorization failed', { status: 400 });
  }

  try {
    const authResponse = await oauthClient.createToken(url.href);
    // console.log(authResponse.json);
    const tokens = authResponse.json;

    // Save tokens in a database or session storage here
    // Serialize tokens into cookies
    const accessTokenCookie = serialize('accessToken', tokens.access_token, {
      httpOnly: true,
      secure: import.meta.env.PROD, // Only secure in production
      path: '/',
      maxAge: tokens.expires_in, // Set expiry to match token expiry
    });

    const refreshTokenCookie = serialize('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // Set a longer expiry for the refresh token
    });

    const headers = new Headers();
    headers.append('Set-Cookie', accessTokenCookie);
    headers.append('Set-Cookie', refreshTokenCookie);

    headers.append('Location', '/');

    let authToken = oauthClient.token.getToken();

    oauthClient.setToken(authToken);

    return new Response(null, { 
      status: 303, 
      headers: headers 
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return new Response('Token exchange failed', { status: 500 });
  }
};