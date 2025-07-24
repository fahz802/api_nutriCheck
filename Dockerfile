# Base image: Node.js + Debian (biar bisa install Python)
FROM node:18

# Install Python3 dan pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy semua file ke container
COPY . .

# Install dependencies Node.js
RUN npm install

# Install dependencies Python
RUN pip3 install pandas roboflow inference-sdk

# Jalankan server Node.js
CMD ["node", "app.js"]
