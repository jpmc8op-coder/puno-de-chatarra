"""Servidor de desarrollo que ademas acepta POST para guardar la lamina.

http.server a secas solo sirve archivos, asi que la pagina de la lamina no tenia
forma de dejar el PNG en el disco. Con esto, `POST /guardar/<nombre>.png` escribe
el cuerpo tal cual en _lamina/.
"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "_lamina")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def do_POST(self):
        if not self.path.startswith("/guardar/"):
            self.send_error(404); return
        nombre = os.path.basename(self.path[len("/guardar/"):]) or "lamina.png"
        if not nombre.endswith(".png"):
            self.send_error(400, "solo png"); return
        n = int(self.headers.get("Content-Length", 0))
        datos = self.rfile.read(n)
        os.makedirs(SALIDA, exist_ok=True)
        with open(os.path.join(SALIDA, nombre), "wb") as f:
            f.write(datos)
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(("guardado %s (%d bytes)" % (nombre, len(datos))).encode())

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
    ThreadingHTTPServer(("127.0.0.1", puerto), Handler).serve_forever()
