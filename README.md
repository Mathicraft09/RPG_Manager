# RPG Character Manager

A full-stack web application for managing role-playing game characters. This project demonstrates a modern integration between a **FastAPI** backend, a **PostgreSQL** database, and a **Vanilla JavaScript** frontend using the Fetch API.

## Features

-   **Live Dashboard**: Real-time listing of all characters.
-   **Character Creation**: Interactive form with Pydantic data validation.
-   **Level-Up System**: Dynamic stat scaling (+20 HP, +5 Atk, etc.) via `PATCH` routes.
-   **Character Deletion**: Direct database cleanup.
-   **Persistent Storage**: Robust data management with PostgreSQL.

## Tech Stack

-   **Backend**: FastAPI (Python 3.10+)
-   **ORM**: SQLAlchemy
-   **Database**: PostgreSQL
-   **Frontend**: HTML5 / CSS3 / JavaScript (ES6+)

## Installation & Setup

### 1. Prerequisites
- Python 3.10 or higher installed.
- PostgreSQL server running with a database named `rpg_db`.

### 2. Backend Setup
```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Install dependencies from requirements.txt
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `/backend` directory:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rpg_db
SECRET_KEY=YourSecretKeyHere
```

### 4. Running the Application
```bash
uvicorn main:app --reload
```
The API will be live at: `http://127.0.0.1:8000`

## API Endpoints


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/personnages` | Fetch all characters. |
| **POST** | `/personnages` | Create a new hero. |
| **PATCH** | `/personnages/{id}/levelup` | Update stats (Level, HP, Atk, Def). |
| **DELETE** | `/personnages/{id}` | Remove a character by ID. |

## Troubleshooting & Notes

-   **CORS Configuration**: The backend includes `CORSMiddleware` to allow requests from your local frontend.
-   **PostgreSQL Authentication**: If you face an `Ident authentication failed` error on Linux, ensure your `pg_hba.conf` is set to `md5` instead of `peer`.
-   **Automatic Migrations**: The project uses `Base.metadata.create_all` to automatically generate tables upon startup.

## Author
- Mathicraft - *Full-Stack Development*
