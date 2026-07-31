"""
Web Server Gateway Interface entrypoint.

Gunicorn uses this to run the app in production.
You can also run it directly for local development.
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    # For local dev: `python wsgi.py`
    # For prod: `gunicorn "wsgi:app"`
    app.run(host="0.0.0.0", port=8000, debug=True)