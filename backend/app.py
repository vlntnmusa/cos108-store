import os, io, csv
from dotenv import load_dotenv
load_dotenv()

# COS108 Final Project | Valentina Musa
# AI-assisted (Claude): generated Flask models, endpoint structure,
# JWT token helpers, CORS setup, and React component boilerplate.
#
# Student contributions:
# - Debugged CORS preflight errors and port 5000 AirPlay conflict
# - Fixed Python 3.13/3.12 version mismatch on PythonAnywhere
# - Designed Apple/Dieter Rams aesthetic (UI/UX decisions)
# - Implemented dark mode with accessibility contrast fixes
# - Added low stock badges, quantity modal, guest checkout flow
# - Ran Lighthouse audits and fixed accessibility (score: 88)
# - Wrote reflection essay explaining architecture decisions
# - Deployed and debugged both Vercel and PythonAnywhere

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///store.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-in-prod")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

CORS(app, origins=["http://localhost:5173", FRONTEND_URL])
db = SQLAlchemy(app)

# ── Models ────────────────────────────────────────────────────────────────────

class User(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    name       = db.Column(db.String(120))
    picture    = db.Column(db.String(300))
    role       = db.Column(db.String(20), default="customer")  # customer | cashier | admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    price       = db.Column(db.Float, nullable=False)
    stock       = db.Column(db.Integer, default=0)
    image_url   = db.Column(db.String(300))

class Order(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"))
    total      = db.Column(db.Float, nullable=False)
    status     = db.Column(db.String(20), default="completed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items      = db.relationship("OrderItem", backref="order", lazy=True)
    user       = db.relationship("User", backref="orders")

class OrderItem(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    order_id   = db.Column(db.Integer, db.ForeignKey("order.id"))
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"))
    quantity   = db.Column(db.Integer, nullable=False)
    price      = db.Column(db.Float, nullable=False)
    product    = db.relationship("Product")

# ── Auth helpers ──────────────────────────────────────────────────────────────

def make_token(user):
    return jwt.encode(
        {"user_id": user.id, "email": user.email, "role": user.role,
         "exp": datetime.utcnow() + timedelta(days=7)},
        app.config["SECRET_KEY"], algorithm="HS256"
    )

def current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(auth[7:], app.config["SECRET_KEY"], algorithms=["HS256"])
        return User.query.get(payload["user_id"])
    except Exception:
        return None

def require_roles(*roles):
    def decorator(f):
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            if roles and user.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(user, *args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "COS108 Store API running"})

# Auth
@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    token = request.json.get("token")
    try:
        info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = info["email"]
        user = User.query.filter_by(email=email).first()
        if not user:
            role = "admin" if User.query.count() == 0 or email == "admin@cos108store.com" else "customer"
            user = User(email=email, name=info.get("name"), picture=info.get("picture"), role=role)
            db.session.add(user)
            db.session.commit()
        return jsonify({"token": make_token(user),
                        "user": {"id": user.id, "email": user.email,
                                 "name": user.name, "role": user.role, "picture": user.picture}})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/api/auth/me")
def me():
    user = current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"id": user.id, "email": user.email,
                    "name": user.name, "role": user.role, "picture": user.picture})

# Products — baseline + backend search extension
@app.route("/api/products")
def get_products():
    q = request.args.get("q", "")
    query = Product.query
    if q:
        query = query.filter(
            db.or_(Product.name.ilike(f"%{q}%"), Product.description.ilike(f"%{q}%"))
        )
    products = query.all()
    return jsonify([{"id": p.id, "name": p.name, "description": p.description,
                     "price": p.price, "stock": p.stock, "image_url": p.image_url}
                    for p in products])

@app.route("/api/products/<int:pid>")
def get_product(pid):
    p = Product.query.get_or_404(pid)
    return jsonify({"id": p.id, "name": p.name, "description": p.description,
                    "price": p.price, "stock": p.stock, "image_url": p.image_url})

@app.route("/api/products", methods=["POST"])
@require_roles("admin")
def create_product(user):
    d = request.json
    p = Product(name=d["name"], description=d.get("description", ""),
                price=float(d["price"]), stock=int(d.get("stock", 0)),
                image_url=d.get("image_url", ""))
    db.session.add(p)
    db.session.commit()
    return jsonify({"id": p.id, "name": p.name, "price": p.price}), 201

@app.route("/api/products/<int:pid>", methods=["PUT"])
@require_roles("admin")
def update_product(user, pid):
    p = Product.query.get_or_404(pid)
    d = request.json
    p.name        = d.get("name", p.name)
    p.description = d.get("description", p.description)
    p.price       = float(d.get("price", p.price))
    p.stock       = int(d.get("stock", p.stock))
    p.image_url   = d.get("image_url", p.image_url)
    db.session.commit()
    return jsonify({"id": p.id, "name": p.name, "price": p.price})

@app.route("/api/products/<int:pid>", methods=["DELETE"])
@require_roles("admin")
def delete_product(user, pid):
    p = Product.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# Customer checkout
@app.route("/api/checkout", methods=["POST"])
def checkout():
    user = current_user()  # optional — guest checkout allowed
    data  = request.json
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "Cart is empty"}), 400
    total = 0; order_items = []
    for item in items:
        p = Product.query.get(item["product_id"])
        if not p or p.stock < item["quantity"]:
            return jsonify({"error": f"'{p.name if p else 'Product'}' is out of stock"}), 400
        qty = item["quantity"]
        total += p.price * qty
        p.stock -= qty
        order_items.append(OrderItem(product_id=p.id, quantity=qty, price=p.price))
    order = Order(user_id=user.id if user else None, total=total)
    db.session.add(order); db.session.flush()
    for oi in order_items:
        oi.order_id = order.id; db.session.add(oi)
    db.session.commit()
    return jsonify({"order_id": order.id, "total": total, "status": "completed"})

# POS
@app.route("/api/pos/sale", methods=["POST"])
@require_roles("admin", "cashier")
def pos_sale(user):
    data  = request.json
    items = data.get("items", [])
    total = 0
    order_items = []
    for item in items:
        p   = Product.query.get(item["product_id"])
        qty = item["quantity"]
        subtotal = p.price * qty
        total   += subtotal
        p.stock -= qty
        order_items.append(OrderItem(product_id=p.id, quantity=qty, price=p.price))
    order = Order(user_id=user.id, total=total)
    db.session.add(order)
    db.session.flush()
    for oi in order_items:
        oi.order_id = order.id
        db.session.add(oi)
    db.session.commit()
    return jsonify({"order_id": order.id, "total": total})

# Orders
@app.route("/api/orders")
def get_orders():
    user = current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    orders = Order.query.all() if user.role == "admin" else Order.query.filter_by(user_id=user.id).all()
    return jsonify([{
        "id": o.id, "total": o.total, "status": o.status,
        "created_at": o.created_at.isoformat(),
        "items": [{"product": oi.product.name, "quantity": oi.quantity, "price": oi.price}
                  for oi in o.items]
    } for o in orders])

# CSV export extension
@app.route("/api/orders/export")
@require_roles("admin")
def export_orders(user):
    orders = Order.query.all()
    out    = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["Order ID", "Customer", "Product", "Qty", "Unit Price", "Order Total", "Date"])
    for o in orders:
        for oi in o.items:
            writer.writerow([o.id, o.user.email if o.user else "N/A",
                             oi.product.name, oi.quantity, oi.price,
                             o.total, o.created_at.strftime("%Y-%m-%d %H:%M")])
    out.seek(0)
    return send_file(io.BytesIO(out.getvalue().encode()),
                     mimetype="text/csv", as_attachment=True,
                     download_name="orders_export.csv")

# Sales dashboard data extension
@app.route("/api/admin/sales")
@require_roles("admin")
def sales_data(user):
    from sqlalchemy import func, cast, Date
    rows = (db.session.query(cast(Order.created_at, Date), func.sum(Order.total))
            .group_by(cast(Order.created_at, Date))
            .order_by(cast(Order.created_at, Date)).all())
    return jsonify([{"date": str(r[0]), "revenue": round(r[1], 2)} for r in rows])

# Users (admin)
@app.route("/api/admin/users")
@require_roles("admin")
def get_users(user):
    return jsonify([{"id": u.id, "email": u.email, "name": u.name, "role": u.role}
                    for u in User.query.all()])

@app.route("/api/admin/users/<int:uid>/role", methods=["PUT"])
@require_roles("admin")
def set_role(user, uid):
    target      = User.query.get_or_404(uid)
    target.role = request.json.get("role", target.role)
    db.session.commit()
    return jsonify({"id": target.id, "role": target.role})

# ── Seed data ──────────────────────────────────────────────────────────────────

def seed():
    if Product.query.count() == 0:
        items = [
            ("Laptop Stand",       "Ergonomic aluminum laptop stand",         49.99, 25, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"),
            ("Wireless Mouse",     "Silent wireless mouse with USB receiver",  29.99, 50, "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400"),
            ("USB-C Hub",          "7-in-1 hub with HDMI and SD card",         39.99, 30, "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400"),
            ("Mechanical Keyboard","TKL keyboard, blue switches",              79.99, 15, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"),
            ("Webcam HD",          "1080p webcam with built-in microphone",    59.99, 20, "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400"),
            ("Desk Lamp LED",      "Adjustable brightness LED desk lamp",      34.99, 40, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"),
        ]
        for name, desc, price, stock, img in items:
            db.session.add(Product(name=name, description=desc, price=price, stock=stock, image_url=img))
        db.session.commit()

with app.app_context():
    db.create_all()
    seed()

if __name__ == "__main__":
    app.run(debug=True)
