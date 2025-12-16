---
layout: post
title: "Show me your keys - OAuth 2.0 & OIDC with JWT & JWKS"
subtitle: 'Authentication, authorization and JWT overview'
author: "pilotpirxie"
date: 2020-10-14T00:00:00.000Z
tags: ["jwt", "jwks", "oauth2", "oidc"]
---


# JWT - JSON Web Token

Since HTTP is a stateless protocol it requires some kind of handler to manage sessions. For a long time, after a successful authentication the standard container for session handling was a session cookie. Still, it's pretty common to see cookies on various websites and applications. In 2015 Internet Engineering Task Force (IETF) standardized JWT with the RFC 7519 document. The new technology is super useful when it comes to another standard - OpenID Connect, which is turning simple authorization servers with OAuth2 into powerful authorization and identity providers. JWT can be used for both session handling and managing permissions - whichever you need. It also has numerous other advantages.

## Typical Authentication & Authorization approaches

### Simple Authentication

Let's start with an authentication example. Like when you sign in to your favourite music service directly. Usually, a server creates a log-in session and returns some sort of session proof data (e.g. session cookie). You are authenticated (session is established) to a service and you can listen to your music.

### Authorization with OAuth 2.0

When you are trying to use Music Recommendation Service based on data from an external Music Service you have to sign in with an external account. With security standards like OAuth 2.0 usually you will be redirected to an authorization service first, to type your password if necessary. In the second step, you will grant (or not) your permission to let the Recommendation Service access personal data from Resource Server. If you agree, browser will redirect you back.

Recommendation Service has the authorization code that can be exchanged along with other client data (to make sure the authorization token is not hijacked) into Access Token. It can be used for performing an operation and requests to your data at Resource Server as long as the access token is valid, and you don't revoke access. Depending on the authorization server, even when you log out from a Music Service, your access token may be still valid and used somewhere else. Recommendation Service is authorized by you to perform some operations as long as the access token is valid but now it has nothing to authentication.

### OpenID Connect

When you are using OpenID Connect the authorization process is almost the same like a flow we went through with OAuth 2.0. OpenID Connect is a simple extension standard over OAuth 2.0 which provides some additional data. Now Recommendation Service will get Access Token and two new tokens: Id token and Refresh Token. Both Id Token and Refresh Token are using JWT format. Id Token contains some basic profile information about the currently signed-in person, but typically also has short expiration time built-in and must be revalidated. To revalidate a service has to send a Refresh Token to an authorization server (now, with OpenID Connect it's also an identity provider) which checks if it's valid and returns with new tokens. Refresh Token can be invalidated on logout from Music Service which makes tokens secure in case of a leak exposure and end of the session, too.

This process is the longest of all we're looking into, and since you are still using only Access Token to operate on user data, it may be not clear what differs OpenID Connect from OAuth 2.0. OIDC also provides a flexible and natural way to handle authentication between apps with refreshing tokens. Using this mechanism, you can build a secure single sign-on service where a user can have only one identity & authorization server grant access to data and session states for many external apps & services.

The entire flow with OAuth 2.0 and OpenID Connect looks like this:

![Initial request](/img/posts/initial-request.png)

![Usage of access token](/img/posts/usage-of-access-token.png)

![Refresh request](/img/posts/refresh-request.png)

In the above flow:

- **User** is the resource owner and an end-user.
- **Music Recommendation Service** is the client.
- **Music Service** is both an identity provider and authorization service.
- **Music Service Resource API** is a resource server.

## JWT

Now let's talk about this mythical **JWT**. What are they? How do they work? And what security concerns should you have in mind while working with them? JWT stands for JSON Web Token, and it's one of the members of JOSE (JSON Object Signing and Encryption) data structure family. JOSE is all about secure transport of claims between two parties using JSON as a data format.

JWT name is often used to refer to an entire token used between parties to transport claims. But to be precise, JWT is just a part of an encrypted token - JWE (JSON Web Encryption) or a signed token JWS (JSON Web Signature). In this article, we are going to focus on JWS implementation which is far more widespread and standardized.

The signed JWT is made of three parts:

- header (JOSE header),
- payload (JWT claims set),
- signature (JWS signature),

Parts are separated by dots. Typical JWT looks like this:

```
base64(header_json).base64(payload_json).base64(signed_jwt)
```

## JOSE header

**JOSE header** is a JSON with meta-information about a token. Standard minimum fields for these parts are:

- **alg** - algorithm used for the signing process. Can be a symmetric algorithm with one private key (secret) or an asymmetric kind which uses two keys: a private for signing and a public key for verifying the token. All of them are described in the JWA (JSON Web Algorithms) specification.
- **typ** - a type of token. Usually, it's simply a JWT.

Sample header:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Another field commonly used in a header is **kid**, used to determine an asymmetric pair or secret/key used for signing in and verifying. Sometimes you can also find **jku** field which stands for JSON Web Key Url - where you can find url with public keys for verifying.

## JWT payload

The payload is a JSON data structure with the information required by applications and services. Some fields are mandatory for specifications like OpenID Connect:

- **sub** - subject of the JWT. Usually, it's some kind of user id.
- **iss** - the issuer of the JWT. The client (e.g. app id) who requested for JWT.
- **aud** - audience. All applications/services that are allowed to use this JWT.
- **exp** - timestamp with an expiration date.
- **nbf** - not before - timestamp with the minimum date when the token will be accepted.
- **iat** - issued at - timestamp with issue date.

Other popular fields:

- **nonce** - string value used to prevent replay attack.
- **jti** - unique token id.

Among previously mentioned fields, you can add your own fields with additional data.

Sample payload:

```json
{
  "sub": "d527ab31-bd45-46a8-9a99-00e6503e9c34",
  "iss": "1234567",
  "aud": "http://example.com",
  "exp": "1600597409",
  "iat": "1593919195",
  "custom": "field"
}
```

## Signature

The final part of the signed JWT is a **signature**. It's a base64 result of signing operation depending on the alg field from the header and both header and payload.

In our case, it's **HS256**, which stands for HMAC-SHA256. Let's say our secret will be "tech".

Output for:

```
HMAC-SHA256(base64(header).base64(payload), "tech")
```

is

```
eHmNeDAjjjiyxbSAmd52ZOce2qJrd4bqWKSAIOXokaw
```

So the final JWT with all parts combined together is:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNTI3YWIzMS1iZDQ1LTQ2YTgtOWE5OS0wMGU2NTAzZTljMzQiLCJpc3MiOiIxMjM0NTY3IiwiYXVkIjoiaHR0cDovL2V4YW1wbGUuY29tIiwiZXhwIjoiMTYwMDU5NzQwOSIsImlhdCI6IjE1OTM5MTkxOTUiLCJjdXN0b20iOiJmaWVsZCJ9.eHmNeDAjjjiyxbSAmd52ZOce2qJrd4bqWKSAIOXokaw
```

## Verification and sharing secrets

To verify if the JWT is correct you have to check if **exp** date is greater than current, **nbf** field is less than current, your app is permitted to use JWT and finally **compute signature** based on **alg** field and key pair or secret. If the signature matches, the JWT is correct. Make sure alg is not set to "none" which is a valid value for alg field, but shouldn't be used. You can now send JWT with Authorization header to the resource server to retrieve data.

## Token types

There are a few types of JWT in OpenID Connect scenario. **Access Token** is used for accessing resources. Once generated it's not stored in the database. It typically has a short lifespan and should expire in a few minutes. Long-living JWT is called **Refresh Token**. It's saved in the database, and can be invalidated by putting it on the blacklist. Refresh Token is used for creating new short-living tokens. There is also an **Id Token** that only holds information about an end-user.

Access Token and Id Token are usually stateless, which means they aren't saved in the database and can be verified without additional calls to the authorization server. Access Token is only used for authorizing requests and can't be used for authentication. Refresh Token is stateful since in order to verify it we have to check if it's still valid and neither blacklisted nor rotated. Refresh Token can be invalidated when a user removes their account, logout or you detect malicious activity connected to this token. Also, after obtaining a short token, the old refresh token should be invalidated. This technique prevents forever living sessions and reduces the risk of a refresh token breach.

A resource server should be able to verify tokens without calling the database. The only requirement here is to share the same secret or public key with the resource server in a secure way without exposing it to the client and the user. And since the hardcoded secret is not a good option, you can use a pub/sub model or jku field to inform the audience about client secrets or keys.

## JWK & JWKS

Public token from an asymmetric pair can be also shared as JSON Web Key (JWK) with JSON Web Key Sets (JWKS) endpoint to allows any audience to verify the token. JWK is a JSON representation of a cryptographic key. JWKS is a JSON set of keys.

Typical JWKS looks like this:

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "42148Kf",
      "use": "sig",
      "alg": "RS256",
      "n": "iGaLqP6y-SJCCBq5Hv6pGDbG_SQ11MNjH7rWHcCFYz4hGwHC4lcSurTlV8u3avoVNM8jXevG1Iu1SY11qInqUvjJur--hghr1b56OPJu6H1iKulSxGjEIyDP6c5BdE1uwprYyrGaLqP6y-SJCCygjLFrh44XEGbDIFeImwvBAGOhmMB2AD1n1KviyNsH0bEB7phQtiLk-ILjv1bORSRl8AK677-1T8isGfHKXGZ_ZGtStDe7Lu0Ihp8zoUt59kx2o9uWpROkzF56ypresiIl4WprClRCjz8x6cPZXU2qNWhu71TQvUFwvIvbkE1oYaJMb0jcOTmBRGaLqP6y-SJCC",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "kid": "bEaunmA",
      "use": "sig",
      "alg": "RS256",
      "n": "BISvILNyn-lUu4goZSXBD9ackM9OJuwUVQQeVC_aqyc8GC6RX7dq_KvRAQAWPvkam8VQv4GK5T4ogklEKEvj5ISBamdDNq1n52TpxQwI2EqxSk7I9fKPKhRt4F8-2yETlYvye-2s6NeWJim0KBtOVrk0gWvEDgd6WOqJl_yt5WBISvILNyVg1qAAM8JeX6dRPosahRVDjA52G2X-Tip84wqwyRpUlq2ybzcLh3zyhCitBOebiRWDQfG26EH9lTlJhll-p_Dg8vAXxJLIJ4SNLcqgFeZe4OfHLgdzMvxXZJnPp_VgmkcpUdRotazKZumj6dBPcXI_XID4X-Tip84wqwyRpUlq2w",
      "e": "AQAB"
    }
  ]
}
```

and consists of meta-information about algorithm and certificate. A field `n` is the modulus of RSA public key and `e` is an exponent. Using those two fields you can create a pem file e.g. with OpenSSL. By using a JWKS server, jku and kid fields in the header of a JWT you can verify the token signature with a public key and keep the audience up to date by caching keys.

JWT is a relatively new technology but is widely used by giant companies from all around the globe. This won't make session cookies useless but instead, those two solutions complement each other.

You can see that the authentication and authorization processes nowadays are slightly different and more complex than they used to be. But that complexity comes with new opportunities, improved security, granular privacy and more responsive feeling for end-users. And this is what we want for our clients!

_This post was originally published on [Ringier Axel Springer Tech Blog](https://tech.ringieraxelspringer.com/blog/programming/show-me-your-keys-oauth-20-and-oidc-with-jwt-and-jwks,17)_