#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 5000
HOST = "0.0.0.0"
SERVE_DIR = os.path.join(os.path.dirname(__file__), "src")

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SERVE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

with socketserver.TCPServer((HOST, PORT), CORSHTTPRequestHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"Serving DHIS2 apps from '{SERVE_DIR}' at http://{HOST}:{PORT}")
    print("Available apps:")
    print(f"  /data-set-report/     - Data Set Report App")
    print(f"  /apps/data-set-report/ - Dataset & Reporting React App")
    print(f"  /org-unit-distribution-report/ - Org Unit Distribution Report")
    print(f"  /reporting-rate-summary/ - Reporting Rate Summary")
    print(f"  /resource/ - Resource App")
    httpd.serve_forever()
