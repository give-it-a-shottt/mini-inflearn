import json
import threading
import time
json.dump({"seats": 1}, open("c.json", "w"))

lock = threading.Lock()


def apply(name):
    with lock:
        seats = json.load(open("c.json"))["seats"]   # 읽기
        time.sleep(0.1)                              # 읽고 쓰는 사이의 틈
        if seats > 0:
            json.dump({"seats": seats - 1}, open("c.json", "w"))  # 쓰기
            print(name, "신청 성공")


ts = [threading.Thread(target=apply, args=(n,)) for n in "AB"]
[t.start() for t in ts]
[t.join() for t in ts]
