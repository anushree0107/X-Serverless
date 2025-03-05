# X-Serverless

A modern serverless application framework combining Python FastAPI backend with a JavaScript frontend. This project demonstrates a full-stack serverless architecture with containerization support.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [Python](https://python.org/) (version 3.8 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## Project Structure

```
X-Serverless/
├── api/            # Python FastAPI backend
├── frontend/       # JavaScript frontend

```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/anushree0107/X-Serverless.git
cd X-Serverless
```

### 2. Backend Setup (API)

Navigate to the API directory and set up the Python environment:

```bash
cd api
python -m venv venv
# For Windows
.\venv\Scripts\activate
# For Unix or MacOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Uvicorn server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 4. Docker Setup

Ensure Docker Desktop is running, then:

```bash
# Build and run the containers
docker-compose up --build
```

## Development

For development, you'll need to:

1. Start the Uvicorn server in the api folder first
2. Ensure Docker Desktop is running
3. Build the frontend using npm run build
4. Access the application through the specified ports

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
API_URL=http://localhost:8000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

