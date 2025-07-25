# Use the official Node.js 18 image as the base image
# This provides a stable and optimized environment for Node.js apps.
FROM node:20-slim

# Set the working directory inside the container
# All subsequent commands will be executed relative to this directory.
WORKDIR /app

# Copy package.json and package-lock.json (if it exists) to the working directory
# We copy these separately to leverage Docker's layer caching.
# If only package.json changes, npm install needs to re-run, but if only source code changes,
# this layer can be reused.
COPY package*.json ./

# Install project dependencies
# The --production flag ensures only production dependencies are installed,
# making the final image smaller.
RUN npm install --production

# Copy the rest of your application code to the working directory
# This includes server.js, your .env file, and any other project files.
COPY . .

# Expose the port your server listens on
# Cloud Run typically expects applications to listen on port 8080.
# Your server.js should listen on process.env.PORT, which Cloud Run sets to 8080 by default.
EXPOSE 8080

# Command to run the application
# This uses the 'start' script defined in your package.json.
CMD ["npm", "start"]