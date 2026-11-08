# backend/race_enroll.py — 수강신청 동시 요청 실험 (서버가 켜져 있어야 한다)
# 사용: uv run python race_enroll.py 1 2      → 강의 1, 2를 "동시에" 신청
#   (main.py에서 with_for_update=True를 빼고 읽기 뒤에 time.sleep(0.3)을 넣으면 잠금 없는 버그를 재현할 수 있다)
#       uv run python race_enroll.py 1 1      → 같은 강의 1을 "동시에" 두 번 신청
import json
import sys
import threading
import urllib.error
import urllib.request

API = "http://localhost:8000"


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def enroll(course_id):
    status, body = call("POST", "/enrollments", {"course_id": course_id})
    print(f"강의 {course_id} 신청 → {status} {body}")


course_ids = [int(x) for x in sys.argv[1:]] or [1, 2]
print("시작 전:", call("GET", "/me")[1])
threads = [threading.Thread(target=enroll, args=(c,)) for c in course_ids]
[t.start() for t in threads]
[t.join() for t in threads]
print("끝난 후:", call("GET", "/me")[1])
