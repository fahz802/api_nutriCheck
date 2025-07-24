FROM node:18

# Install Python, pip, venv, dan libGL untuk OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1

# Buat virtual environment Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependency Node.js
RUN npm install

# Install dependency Python (di dalam venv)
RUN pip install --no-cache-dir pandas roboflow inference-sdk

# Jalankan server
CMD ["node", "app.js"]
