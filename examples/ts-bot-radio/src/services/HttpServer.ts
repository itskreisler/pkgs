// examples/ts-bot-radio/src/services/HttpServer.ts
import express, { Express } from 'express';
import http, { Server as HttpServerType } from 'http';

/**
 * @class HttpServer
 * Manages the setup and lifecycle of an HTTP server using Express.
 */
export class HttpServer {
  /**
   * @public
   * @type {Express}
   * The Express application instance.
   */
  public app: Express;

  /**
   * @private
   * @type {HttpServerType}
   * The underlying Node.js HTTP server instance.
   */
  private server: HttpServerType;

  /**
   * @private
   * @type {number}
   * The port number the server will listen on.
   */
  private port: number;

  /**
   * Creates an instance of HttpServer.
   * @param {number} port - The port number for the server to listen on.
   */
  constructor(port: number) {
    this.port = port;
    this.app = express(); // Initialize the Express app
    this.server = http.createServer(this.app); // Create an HTTP server with the Express app
  }

  /**
   * Returns the Express application instance.
   * Useful for adding middleware or routes from outside this class.
   * @returns {Express} The Express app.
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * Returns the raw Node.js HTTP server instance.
   * @returns {HttpServerType} The HTTP server.
   */
  public getServer(): HttpServerType {
    return this.server;
  }

  /**
   * Starts the HTTP server and makes it listen on the configured port.
   * @param {Function} [callback] - An optional callback to execute once the server starts listening.
   */
  public start(callback?: () => void): void {
    this.server.listen(this.port, () => {
      console.log(`HTTP Server listening on port ${this.port}`);
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Stops the HTTP server.
   * @param {Function} [callback] - An optional callback to execute once the server is closed.
   * It can receive an error argument if closing failed.
   */
  public stop(callback?: (err?: Error) => void): void {
    this.server.close(callback);
  }
}
