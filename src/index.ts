import SimpleVideoServer from './server-simple';

async function startServer() {
  const server = new SimpleVideoServer();
  
  const port = parseInt(process.env.PORT || '3000');
  
  try {
    await server.start(port);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();