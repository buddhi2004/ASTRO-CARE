import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for offline-first development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 ASTRAL-MED | NASA Space Apps Challenge 2026")
    print(f"📡 Serving on http://localhost:{PORT}")
    print("👥 Team: Udamgie, Rashmi, Buddhiprabha, Vidasni")
    print("🛰️ Dual-Mode: Mode A (In-Flight Co-Pilot) + Mode B (Earth Rehab)")
    print("=" * 60)
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("Server running. Press Ctrl+C to terminate.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
