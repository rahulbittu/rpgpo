from http.server import BaseHTTPRequestHandler,HTTPServer
import os,json,urllib.parse,time

base=os.path.expanduser("~/gpo_node")
status_file=base+"/logs/status.json"
log_file=base+"/logs/claude.log"
queue_dir=base+"/queue"

class H(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path=="/status":
            if os.path.exists(status_file):
                s=json.load(open(status_file))
            else:
                s={"status":"unknown"}

            self.send_response(200)
            self.send_header("Content-Type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps(s).encode())

        elif self.path=="/logs":
            self.send_response(200)
            self.end_headers()

            if os.path.exists(log_file):
                self.wfile.write(open(log_file).read().encode())

        else:
            html="""
            <html>
            <body style='background:#111;color:white;font-family:system-ui'>
            <h2>GPO Node</h2>
            <form method="POST" action="/task">
            <textarea name="prompt" rows="8" cols="70"></textarea><br>
            <button type="submit">Send Task</button>
            </form>
            <p><a href="/status">Status</a></p>
            <p><a href="/logs">Logs</a></p>
            </body>
            </html>
            """

            self.send_response(200)
            self.end_headers()
            self.wfile.write(html.encode())

    def do_POST(self):

        if self.path=="/task":
            l=int(self.headers["Content-Length"])
            data=self.rfile.read(l).decode()
            params=urllib.parse.parse_qs(data)

            prompt=params.get("prompt",[""])[0]

            f=queue_dir+"/"+str(int(time.time()))+".task"
            open(f,"w").write(prompt)

            self.send_response(302)
            self.send_header("Location","/")
            self.end_headers()

HTTPServer(("0.0.0.0",7777),H).serve_forever()
