# Webauthn Example 🧿

This is a [Next.js](https://nextjs.org/) app showcasing [WebAuthn](https://webauthn.guide/).

## Getting Started

First, install the dependencies:

```bash
yarn
```

then create a local .env.local file with the relevant secrets:

```bash
# SMTP
NODE_ENV="development"
EMAIL_SERVER="smtp://client:secrete@smtp-server:port"
EMAIL_FROM="example@email.com"

# Mongo
MONGODB_URI=""

# Main DB
NEXT_AUTH_DBNAME=""

# WebAuth DB
WEBAUTHN_DBNAME=""
WEBAUTHN_APP_DOMAIN=""
WEBAUTHN_APP_ORIGIN=""
WEBAUTHN_APP_NAME="Webauthn Demo App"

# NextAuth
NEXTAUTH_URL=""
```

finally, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
