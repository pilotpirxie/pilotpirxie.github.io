---
layout: post
title: "How to add Limited Login Facebook on iOS and Android on server-side and client-side"
subtitle: "Meta recently introduced the concept of Limited Login for iOS authentication with Facebook. This tutorial provides a complete guide to implementing both standard and limited login flows."
author: "Meat Boy"
date: 2024-08-19T19:54:57.000Z
tags: ["reactnative", "react", "tutorial", "typescript"]
---
Meta recently introduced the concept of Limited Login for iOS authentication with Facebook. This tutorial provides a step-by-step guide on integrating Facebook Login into a React Native application, including server-side implementation, with a focus on supporting both standard and limited login flows in 2024.

# 1. Project Initialisation

If you have an existing application, you can bypass this section. For those starting anew, follow these instructions to create a new application:
[Initialise a new project using Expo](https://reactnative.dev/docs/getting-started-without-a-framework)
[Initialise a new project with React Native CLI](https://reactnative.dev/docs/environment-setup)

# 2. Installing react-native-fbsdk-next
Follow the official documentation for installation instructions:
[FBSDK Next - Expo Setup](https://github.com/thebergamo/react-native-fbsdk-next/#expo-installation)
or
[FBSDK Next - React Native CLI Setup](
https://github.com/thebergamo/react-native-fbsdk-next/?tab=readme-ov-file#1-install-the-library)

# 3. Implementing Limited Login on the Client Side

Integrate the following code snippet to implement Limited Login in your React Native project:

```ts
const loginWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(
        ['public_profile', 'email'],
        'limited' // This parameter ensures consistent limited login behaviour on iOS
      );
      if (result.isCancelled) {
        return;
      }

      let token = await (Platform.OS === 'ios'
        ? AuthenticationToken.getAuthenticationTokenIOS().then(
            data => data?.authenticationToken || ''
          )
        : AccessToken.getCurrentAccessToken().then(
            data => data?.accessToken || ''
          ));

      // Utilise the token for further operations, such as server-side authentication
    } catch (e) {
      console.error(e);
    }
  };
```

# 4. Server-Side Token Validation

The server-side implementation requires handling both authorisation codes and authentication tokens to support standard and limited login flows.

Let's create a new endpoint using Express. Note that this approach can be adapted to other web server frameworks with minimal modifications.

```ts
router.post('/auth/facebook', async (req, res, next) => {
  try {
    const { facebookToken } = req.body;
    const { facebookUserId, facebookUserName } = await getFacebookUser({ token: facebookToken, appId: facebookAppId });
    
    // Utilise facebookUserId and facebookUserName for user creation or authentication
  } catch (err) {
    // Token exchange or validation failure; handle the error or pass it to the next middleware
    next(err);
  }
});
```

Now, let's implement the ``getFacebookUser`` function to validate and exchange tokens for user data. This function handles both authentication tokens and OIDC Authorisation Tokens.

```ts
interface FacebookUser {
  facebookUserId: string;
  facebookUserName: string;
}

interface GetFacebookUserParams {
  token: string;
  appId: string;
}

export async function getFacebookUser({ token, appId }: GetFacebookUserParams): Promise<FacebookUser> {
  try {
    return await getStandardFacebookUser(token);
  } catch (error) {
    console.warn('Failed to get standard Facebook user, trying limited user');
    return getLimitedFacebookUser({ token, appId });
  }
}
```

First, let's handle the standard login flow with access tokens. You can use these tokens directly to fetch user data by calling the Graph API. We'll use ``axios`` for REST API calls. For the limited login flow, you'll also need the ``jwks-rsa`` library for extracting the proper key from the JWKS endpoint (you can also use axios, but it requires more effort) and the ``jsonwebtoken`` library for JWT validation and decoding. Of course, you can use any other tech stack. The general approach will be the same in Go, Python or Java.

```ts
const FACEBOOK_GRAPH_API = 'https://graph.facebook.com/me';

async function getStandardFacebookUser(token: string): Promise<FacebookUser> {
  try {
    const { data } = await axios.get(`${FACEBOOK_GRAPH_API}?fields=id,name&access_token=${token}`);
    if (!data.id || !data.name) {
      throw new Error('Invalid token (missing id or name)');
    }
    return { facebookUserId: data.id, facebookUserName: data.name };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch Facebook user: ${error.message}`);
    }
    throw error;
  }
}
```

In the response, you'll get both the ID and name of the user within your application scope. If any data is missing, an error will be thrown. However, if this happens, we still want to give the user a chance to sign in - perhaps they signed in using iOS with App Tracking Transparency disabled, resulting in an OIDC Authentication Token instead. In that case, we need to:

```ts
const FACEBOOK_JWKS_URI = 'https://www.facebook.com/.well-known/oauth/openid/jwks';
const FACEBOOK_ISSUER = 'https://www.facebook.com';

async function getLimitedFacebookUser({ token, appId }: GetFacebookUserParams): Promise<FacebookUser> {
  const client = jwksClient({ jwksUri: FACEBOOK_JWKS_URI });

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      async (header, callback) => {
        try {
          const key = await client.getSigningKey(header.kid);
          callback(null, key.getPublicKey());
        } catch (error) {
          callback(error as Error, undefined);
        }
      },
      {
        algorithms: ['RS256'],
        audience: appId,
        issuer: FACEBOOK_ISSUER,
      },
      (err, decoded) => {
        if (err) {
          reject(new Error(`JWT verification failed: ${err.message}`));
        } else {
          const { sub, name } = decoded as JwtPayload;
          if (!sub || !name) {
            reject(new Error('Invalid token (missing sub or name)'));
          } else {
            resolve({ facebookUserId: sub, facebookUserName: name });
          }
        }
      }
    );
  });
}
```

In the code above, you create a JWKS client to fetch Facebook's list of public keys. Then you extract the key ID (kid) from the JWT header to get the appropriate public key. Currently, all JWT signatures are signed using the RS256 algorithm, so you must specify this. The audience of the JWT is your application, so it must be set to your app ID from the Facebook Developer dashboard. The issuer is constant and always ``https://www.facebook.com``.

The JWT will either be validated or rejected. If validation succeeds, you can safely decode it and extract both the ``sub`` and ``name`` claims. The ``sub`` property is the user ID within your Facebook application scope, while ``name`` is the user's public display name.

The whole code looks like this:

```ts
import jwksClient from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios, { isAxiosError } from 'axios';

export async function getStandardFacebookUser(token: string) {
  const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name&access_token=${token}`);
  if (!data.id || !data.name) {
    throw new Error('Invalid token (missing id or name)');
  }
  return { facebookUserId: data.id, facebookUserName: data.name };
}

export async function getLimitedFacebookUser({
  token,
  appId,
}: {
  token: string;
  appId: string;
}) {
  const client = jwksClient({
    jwksUri: 'https://www.facebook.com/.well-known/oauth/openid/jwks',
  });

  return new Promise<{
    facebookUserId: string;
    facebookUserName: string;
  }>((resolve, reject) => {
    jwt.verify(
      token,
      async (header, callback) => {
        const key = await client.getSigningKey(header.kid);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      },
      {
        algorithms: ['RS256'],
        audience: appId,
        issuer: 'https://www.facebook.com',
      },
      (err, decoded) => {
        if (err) reject(err);
        const decodedData = decoded as JwtPayload;
        if (!decodedData.sub || !decodedData.name) {
          reject(new Error('Invalid token (missing sub or name)'));
        } else {
          resolve({ facebookUserId: decodedData.sub, facebookUserName: decodedData.name });
        }
      },
    );
  });
}

export async function getFacebookUser({
  token,
  appId,
}: {
  token: string;
  appId: string;
}) {
  try {
    return await getStandardFacebookUser(token);
  } catch (error) {
    if (isAxiosError(error)) {
      console.warn('Failed to get standard Facebook user, trying limited user');
    }
    return getLimitedFacebookUser({
      token,
      appId,
    });
  }
}

router.post('/auth/facebook', async (req, res, next) => {
  try {
    const { facebookToken } = req.body;
    const { facebookUserId, facebookUserName } = await getFacebookUser({ token: facebookToken, appId: facebookAppId });
    
    // Utilise facebookUserId and facebookUserName for user creation or authentication
  } catch (err) {
    // Token exchange or validation failure; handle the error or pass it to the next middleware
    next(err);
  }
});
```

This implementation provides a quick solution for authenticating users regardless of their chosen login flow. If you require further assistance, please leave a comment, and I will do my best to help :)
