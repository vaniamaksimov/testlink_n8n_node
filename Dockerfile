FROM n8nio/n8n:latest

USER root

# Copy the pre-built package
COPY package.json /custom-nodes/node_modules/n8n-nodes-testlink/package.json
COPY dist/ /custom-nodes/node_modules/n8n-nodes-testlink/dist/

# Install only production dependencies
WORKDIR /custom-nodes/node_modules/n8n-nodes-testlink
RUN npm install --omit=dev

USER node
WORKDIR /home/node

ENV N8N_CUSTOM_EXTENSIONS=/custom-nodes/node_modules/n8n-nodes-testlink
