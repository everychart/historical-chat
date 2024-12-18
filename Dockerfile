# # Use an official Node.js runtime as a parent image
# FROM node:22-slim

# # Set the working directory to the root directory
# WORKDIR /project-root

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # Expose the port the app runs on
# EXPOSE 5000

# # Define the command to run the application
# CMD ["node", "server/server.js"]
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm ci --only=production

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
ENTRYPOINT [ "node", "server/server.js" ]