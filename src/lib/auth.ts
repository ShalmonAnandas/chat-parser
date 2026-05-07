import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

function normalizeUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/$/, '');
}

function normalizeHost(value?: string) {
  const normalizedValue = normalizeUrl(value);

  if (!normalizedValue) {
    return undefined;
  }

  return `https://${normalizedValue}`;
}

const githubClientId =
  process.env.GITHUB_CLIENT_ID ?? process.env.AUTH_GITHUB_ID;
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET ?? process.env.AUTH_GITHUB_SECRET;

// Prefer the explicit Auth.js URL, fall back to NextAuth's legacy alias, and
// only use Vercel's production hostname as a last resort for preview deploys.
const authUrl =
  normalizeUrl(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL) ??
  normalizeHost(process.env.VERCEL_PROJECT_PRODUCTION_URL);

const redirectProxyUrl =
  normalizeUrl(process.env.AUTH_REDIRECT_PROXY_URL) ??
  (authUrl ? `${authUrl}/api/auth` : undefined);

const providers =
  githubClientId && githubClientSecret
    ? [
        GitHub({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        }),
      ]
    : [];

if (!githubClientId || !githubClientSecret) {
  console.warn(
    'Missing GitHub OAuth credentials. Set GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET or AUTH_GITHUB_ID/AUTH_GITHUB_SECRET.'
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  redirectProxyUrl,
  providers,
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
