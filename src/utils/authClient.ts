/* @ts-ignore */
import OAuthClient from 'intuit-oauth';

const oauthClient = new OAuthClient({
    clientId: import.meta.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: import.meta.env.QUICKBOOKS_CLIENT_SECRET,
    environment: 'sandbox',
    redirectUri: import.meta.env.QUICKBOOKS_REDIRECT_URI,
});

export default oauthClient;

export async function refreshTokenCookie() {
    try {
    console.log(oauthClient.token.getToken())

    // oauthClient.setToken();

    const accessTokenObj = await oauthClient.refresh();

    const accessToken = accessTokenObj.json.access_token;
    // console.log(accessTokenObj.json.access_token);

    return accessToken;
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}