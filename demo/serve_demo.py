#!/usr/bin/env python3
"""
Simple HTTP server to serve the demo call page
Run with: python demo/serve_demo.py
"""
import http.server
import socketserver
import webbrowser
from pathlib import Path
import os

PORT = 8080
DEMO_DIR = Path(__file__).parent

class DemoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DEMO_DIR), **kwargs)

    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    print("\n🎯 NegotiAI Coach - Demo Server")
    print("=" * 50)

    with socketserver.TCPServer(("", PORT), DemoHandler) as httpd:
        url = f"http://localhost:{PORT}/demo_call.html"
        print(f"\n✅ Server running at: {url}")
        print(f"\n📋 Instructions:")
        print("1. Assurez-vous que le backend est lancé (port 8000)")
        print("2. Assurez-vous que l'extension est chargée dans Chrome")
        print("3. Ouvrez l'URL ci-dessus dans Chrome")
        print("4. L'overlay NegotiAI devrait apparaître automatiquement")
        print(f"\n⏹️  Press Ctrl+C to stop the server\n")

        # Open browser automatically
        try:
            webbrowser.open(url)
            print("🌐 Browser opened automatically")
        except:
            print("💡 Please open the URL manually in your browser")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")

if __name__ == "__main__":
    main()
