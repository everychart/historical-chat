# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory
WORKDIR /server

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the working directory to the server directory
WORKDIR /server

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the application
CMD ["node", "server.js"]