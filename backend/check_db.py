"""Diagnose DATABASE_URL connectivity problems (Supabase/Postgres).

Usage:
    cd backend
    python check_db.py                       # uses DATABASE_URL from .env / environment
    python check_db.py "postgresql://..."    # test an explicit URL

It checks, in order:
  1. that a URL is present and parseable (and warns about un-encoded passwords)
  2. DNS resolution -> which IP families the host offers (IPv6-only == the usual
     cause of `psycopg.errors.ConnectionTimeout` on Supabase direct hosts)
  3. a raw TCP connect to host:port (catches firewalls / blocked 5432)
  4. an actual SQLAlchemy connection + `select version()`
"""

from __future__ import annotations

import os
import socket
import sys
from urllib.parse import unquote, urlparse

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

OK = "  [ok]  "
BAD = "  [FAIL]"
WARN = "  [warn]"

TIMEOUT = 8


def load_url() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1]
    try:
        from dotenv import load_dotenv

        load_dotenv(os.path.join(BACKEND_DIR, ".env"))
        load_dotenv(os.path.join(BACKEND_DIR, "..", ".env"))
    except ImportError:
        print(f"{WARN} python-dotenv not installed; reading os.environ only")
    return os.environ.get("DATABASE_URL", "")


def redact(url: str) -> str:
    parsed = urlparse(url)
    if parsed.password:
        return url.replace(parsed.password, "*" * 6, 1)
    return url


def main() -> int:
    url = load_url().strip()

    print("1) DATABASE_URL")
    if not url:
        print(f"{BAD} DATABASE_URL is empty. Create backend/.env with DATABASE_URL=...")
        return 1
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        print(f"{WARN} 'postgres://' rewritten to 'postgresql://' (app does this too)")
    print(f"{OK} {redact(url)}")

    parsed = urlparse(url)

    if parsed.scheme.startswith("sqlite"):
        print(f"{OK} SQLite URL — nothing to network-test.")
        return 0

    host, port = parsed.hostname, parsed.port or 5432
    if not host:
        print(f"{BAD} No host in the URL. If the password contains '@', URL-encode it as %40.")
        return 1

    if parsed.password and unquote(parsed.password) != parsed.password:
        print(f"{WARN} Password appears URL-encoded — good, just make sure it decodes correctly.")
    for ch in "@/#?":
        if parsed.password and ch in parsed.password:
            print(f"{WARN} Password contains a raw '{ch}' — it must be percent-encoded.")

    if host.startswith("db.") and host.endswith(".supabase.co"):
        print(
            f"{WARN} This is Supabase's DIRECT host, which is IPv6-only.\n"
            "         If you get a timeout, switch to the pooler:\n"
            "         postgresql://postgres.<ref>:PASS@aws-0-<region>.pooler.supabase.com:5432/postgres"
        )

    print(f"\n2) DNS for {host}")
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        print(f"{BAD} Cannot resolve host: {exc}")
        return 1
    families = {i[0] for i in infos}
    for fam, addr in {(i[0], i[4][0]) for i in infos}:
        print(f"{OK} {'IPv6' if fam == socket.AF_INET6 else 'IPv4'}  {addr}")
    if families == {socket.AF_INET6}:
        print(
            f"{WARN} Host is IPv6-ONLY. Most ISPs/PaaS are IPv4-only -> connection\n"
            "         timeout. Use the Supabase session pooler host instead."
        )

    print(f"\n3) TCP connect to {host}:{port}")
    last_err = None
    for family, socktype, proto, _canon, sockaddr in infos:
        sock = socket.socket(family, socktype, proto)
        sock.settimeout(TIMEOUT)
        label = "IPv6" if family == socket.AF_INET6 else "IPv4"
        try:
            sock.connect(sockaddr)
            print(f"{OK} {label} {sockaddr[0]} reachable")
            sock.close()
            last_err = None
            break
        except OSError as exc:
            last_err = exc
            print(f"{BAD} {label} {sockaddr[0]}: {exc}")
        finally:
            sock.close()
    if last_err is not None:
        print(
            f"{WARN} Nothing reachable. Causes: IPv6-only host, paused Supabase\n"
            "         project, or a firewall blocking outbound port "
            f"{port} (try 6543)."
        )
        return 1

    print("\n4) SQLAlchemy connect")
    try:
        from sqlalchemy import create_engine, text
    except ImportError:
        print(f"{WARN} SQLAlchemy not installed in this interpreter; skipping.")
        return 0
    try:
        engine = create_engine(url, connect_args={"connect_timeout": TIMEOUT})
        with engine.connect() as conn:
            version = conn.execute(text("select version()")).scalar()
            tables = conn.execute(
                text(
                    "select table_name from information_schema.tables "
                    "where table_schema = 'public' order by table_name"
                )
            ).scalars().all()
        print(f"{OK} {version}")
        print(f"{OK} public tables: {', '.join(tables) if tables else '(none yet — run seed.py)'}")
    except Exception as exc:  # noqa: BLE001 - diagnostics
        print(f"{BAD} {type(exc).__name__}: {exc}")
        return 1

    print("\nAll good.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
