import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from "../../server";

const app = createServer();
const pingMessage = process.env.PING_MESSAGE ?? "ping";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle ping endpoint
  if (req.url === '/api/ping') {
    return res.status(200).json({ message: pingMessage });
  }
  
  // Handle demo endpoint
  if (req.url === '/api/demo') {
    return res.status(200).json({ message: "Hello from Express server" });
  }
  
  // Return 404 for undefined routes
  return res.status(404).json({ error: "API endpoint not found" });
}