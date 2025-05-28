// src/pages/api/proxy/[...path].ts
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

const backendUrl = 'http://localhost:8090';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/proxy': '', // strips `/api/proxy` from the URL path
    },
  })(req as any, res as any);
}
