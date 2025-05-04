# Django Message Application

A robust messaging application built with Django that enables real-time communication between users.

## Features

- User authentication and authorization
- Real-time messaging capabilities
- Message history and conversation management
- Clean and intuitive user interface
- Secure message handling

## Prerequisites

- Python 3.8+
- Django 4.0+
- PostgreSQL (recommended) or SQLite3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sanjaya999/django-message.git
cd django-message
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure the database:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## Configuration

The application can be configured through environment variables or a `.env` file in the project root:

```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

## Usage

1. Access the application at `http://localhost:8000`
2. Log in with your credentials
3. Start messaging other users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Sanjaya - [GitHub](https://github.com/sanjaya999)
