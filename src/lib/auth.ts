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

  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, '');
}

const githubClientId =
  process.env.GITHUB_CLIENT_ID ?? process.env.AUTH_GITHUB_ID;
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET ?? process.env.AUTH_GITHUB_SECRET;

const authUrl = normalizeUrl(
  process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL
);

const redirectProxyUrl =
  normalizeUrl(process.env.AUTH_REDIRECT_PROXY_URL) ??
  (authUrl ? `${authUrl}/api/auth` : undefined);

if (!githubClientId || !githubClientSecret) {
  console.warn(
    'Missing GitHub OAuth credentials. Set GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET or AUTH_GITHUB_ID/AUTH_GITHUB_SECRET.'
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  redirectProxyUrl,
  providers: [
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
