import pinoRoll from 'pino-roll';
import pinoPretty from 'pino-pretty';

// Pino transport function
export default async function (opts: any) {
  // Initialize pino-roll with the provided options
  // pino-roll returns a Promise that resolves to the destination stream
  const rollingDestination = await pinoRoll({
    file: opts.file,
    size: opts.size,
    frequency: opts.frequency,
    limit: opts.limit,
    mkdir: opts.mkdir
  });

  // Create pino-pretty stream writing to the rolling destination
  const prettyStream = pinoPretty({
    ...opts, // Pass other options (translateTime, ignore, etc.) to pino-pretty
    destination: rollingDestination,
    colorize: false, // Ensure file output is not colorized unless requested
    sync: false 
  });

  return prettyStream;
}
