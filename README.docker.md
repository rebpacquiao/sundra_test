# Docker Setup for Sundra Vue/Nuxt Application - Development Environment

This document provides instructions for running the Sundra Vue/Nuxt application in a Docker development environment.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Local host entry for my.sundra.io (already added to /etc/hosts)

## Running the Development Environment

### First-time Setup

For the first time or whenever dependencies change, run the setup service to install dependencies:

```bash
docker compose run --rm setup
```

This will install all the Node.js dependencies in a Docker volume, which will be shared with the development service.

### Starting the Development Server

To run the application in development mode with hot-reloading:

```bash
docker compose up app-dev
```

This will:
- Mount your local directory into the container
- Use the pre-installed dependencies
- Start the Nuxt development server with SSL certificates
- Make the application available at https://localhost:3000
- Enable hot-reloading for code changes

With this setup, any changes you make to your code should be automatically detected and the application will update in real-time without needing to restart the container.

## Accessing the Application

   - Make sure you have the following entry in your /etc/hosts file:
     ```
     127.0.0.1 my.sundra.io
     ```
   - Access the application at https://my.sundra.io:3000
   - This will use the self-signed certificate that matches the domain name

## Environment Variables

All environment variables defined in the `.env` file will be available to the application. Make sure that all the required variables are defined correctly.

## Troubleshooting

### Container not starting

Check the logs:

```bash
docker compose logs app-dev
```

### Changes not reflecting

If your code changes are not automatically detected and applied:

1. Make sure you've run the setup service first:
   ```bash
   docker compose run --rm setup
   ```

2. Try restarting the development container:
   ```bash
   docker compose down
   docker compose up app-dev
   ```

3. Check if file watching is working properly:
   ```bash
   docker compose logs app-dev
   ```
   Look for messages about file changes being detected.

4. If you're on Windows or macOS, file watching might be slower due to how Docker mounts volumes. You can try increasing the polling frequency by adding this to your nuxt.config.ts:
   ```typescript
   watchers: {
     webpack: {
       aggregateTimeout: 300,
       poll: 1000
     }
   }
   ```

### SSL Certificate Issues

If you encounter SSL certificate issues, make sure:
- The certificate files (my.sundra.io.pem and my.sundra.io-key.pem) are in the project root
- The certificate files have the correct permissions
- You're accessing the application using the correct hostname (my.sundra.io:3000)

### Hostname not resolving

Ensure that you have the following entry in your /etc/hosts file:

```
127.0.0.1 my.sundra.io
```

You can check this by running:

```bash
cat /etc/hosts | grep my.sundra.io
```
