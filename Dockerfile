FROM node:18

# Install Python + venv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Buat virtual environment Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Node.js dependencies
RUN npm install

# Install Python dependencies
RUN pip install --no-cache-dir pandas roboflow inference-sdk

# Jalankan server
CMD ["node", "app.js"]
