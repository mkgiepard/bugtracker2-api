# Builder container to compile typescript
FROM node:lts-alpine AS build

ENV LOCAL_DB host.docker.internal:27017/test_usersdb
ENV PORT 3001

WORKDIR /usr/src/app
 
# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci
 
# Copy the rest of the source files into the image.
COPY . . 

# Run the application as a non-root user.
RUN  chown -R node /usr/src/app
USER node

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application with test configuration.
CMD npm run testStart