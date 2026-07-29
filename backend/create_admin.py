"""Create the one dashboard owner manually: python create_admin.py email password"""
import sys
from app import create_app
from app.extensions import db
from app.models import User
if len(sys.argv)!=3: raise SystemExit("Usage: python create_admin.py EMAIL PASSWORD")
app=create_app()
with app.app_context():
    email=sys.argv[1].strip().lower(); user=User.query.filter_by(email=email).first() or User(email=email)
    user.set_password(sys.argv[2]); db.session.add(user); db.session.commit(); print(f"Admin ready: {email}")
