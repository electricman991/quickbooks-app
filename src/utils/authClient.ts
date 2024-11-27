/* @ts-ignore */
import OAuthClient from 'intuit-oauth';

const oauthClient = new OAuthClient({
    clientId: import.meta.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: import.meta.env.QUICKBOOKS_CLIENT_SECRET,
    environment: 'sandbox',
    redirectUri: import.meta.env.QUICKBOOKS_REDIRECT_URI,
});

export default oauthClient;

export function refreshTokenCookie() {
    try {
    // console.log(oauthClient.token.getToken())

    // oauthClient.setToken();

    const accessTokenPromise = new Promise((resolve, reject) => { 
        oauthClient.refresh()
        .then(function(authResponse: any){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.json));
            resolve(authResponse.json);
         })
        
        .catch(function(e: any) {
            console.error(e);
            reject(e)
        })
    });

    const accessTokenObj = accessTokenPromise 
    .then(res => res);
    const accessToken = accessTokenObj.access_token;
    // console.log(accessToken);

    return accessToken;
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        // throw error;
    }
}