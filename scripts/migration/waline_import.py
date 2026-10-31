#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waline 历史留言导入脚本 v4（GitHub Issue #86 → wl_Comment）
字段值完全镜像 Waline 1.43.4 自身写入格式（参照 /ref-test 实测行）：
- ua / like / sticky / user_id / pid / rid 保持 NULL；mail 必须给占位值（NULL 会导致列表接口 500）
- ip 给内网回环格式字符串，status='approved'，时间为 'YYYY-MM-DD HH:MM:SS' 北京时间
使用前停容器，完成后启动；幂等可重跑。
"""
import glob
import json
import sqlite3
import sys

DATA = json.loads(r"""[{"nick":"redhat123456","link":"https://github.com/redhat123456","body":"七院创新基地无敌😘","ts":"2022-08-01 09:29:40"},{"nick":"redhat123456","link":"https://github.com/redhat123456","body":"这是一段很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的话","ts":"2022-08-01 11:32:14"},{"nick":"therainisme","link":"https://github.com/therainisme","body":"😆😆😆 太**厉害**了","ts":"2022-08-01 16:24:48"},{"nick":"redhat123456","link":"https://github.com/redhat123456","body":"🐱‍👓😼🐱‍💻🐶😔😫🙂😁😘🙂🤨😏💕💞⛎☮💢㊙㊗🚫🥙🥪🥟🥩🚛🦽🚚🚛🚞🚊⛵🛳🏁🛰🚨🎗🎟🎏🎆🎈🎆✨🎉","ts":"2022-08-01 16:31:19"},{"nick":"Z233","link":"https://github.com/Z233","body":"👍👍👍","ts":"2022-08-01 17:01:38"},{"nick":"PommesPeter","link":"https://github.com/PommesPeter","body":"七院创新基地tql","ts":"2022-08-01 17:40:24"},{"nick":"yeshan333","link":"https://github.com/yeshan333","body":"㊗️基地越来越好，越来越🐂","ts":"2022-08-01 21:31:42"},{"nick":"yeshan333","link":"https://github.com/yeshan333","body":"> 七院创新基地无敌😘\r\n\r\ntql 谭巨","ts":"2022-08-01 21:50:57"},{"nick":"YYY2357","link":"https://github.com/YYY2357","body":"牛的牛的🥳🥳","ts":"2022-08-01 22:27:57"},{"nick":"jijiang555","link":"https://github.com/jijiang555","body":"tanqiancheng你是我滴神","ts":"2022-08-02 10:30:35"},{"nick":"jijiang555","link":"https://github.com/jijiang555","body":"6666666666666666666666666666666666666666666","ts":"2022-08-02 10:30:51"},{"nick":"zhude233","link":"https://github.com/zhude233","body":"大佬太多了啊啊啊啊😘😘😘","ts":"2022-08-03 00:06:30"},{"nick":"visualDust","link":"https://github.com/visualDust","body":"菜鸡前来围观","ts":"2022-08-05 14:36:29"},{"nick":"visualDust","link":"https://github.com/visualDust","body":":() { : | : & } ; :","ts":"2022-08-05 14:37:21"},{"nick":"Kirito-VR","link":"https://github.com/Kirito-VR","body":"respect!!","ts":"2022-08-07 19:50:02"},{"nick":"20kkk","link":"https://github.com/20kkk","body":"tanger太强了","ts":"2022-08-10 21:56:02"},{"nick":"ZXY39","link":"https://github.com/ZXY39","body":"👍\r\n","ts":"2022-10-11 22:43:16"},{"nick":"Axieyun","link":"https://github.com/Axieyun","body":"牛逼了，**谭大佬**","ts":"2023-03-27 14:05:29"},{"nick":"zqqqqqqj1110","link":"https://github.com/zqqqqqqj1110","body":"最喜欢二刺猿辣！","ts":"2023-04-14 17:47:17"},{"nick":"LLLUU-stack","link":"https://github.com/LLLUU-stack","body":"齐家哥哥好厉害，嘴一个muamua~","ts":"2023-06-27 16:43:20"},{"nick":"walterjar","link":"https://github.com/walterjar","body":"Test By Wj","ts":"2024-12-10 20:57:13"},{"nick":"FishCat233","link":"https://github.com/FishCat233","body":"好耶👍","ts":"2026-05-02 22:10:55"}]""")


def find_db():
    for p in [
        "/opt/1panel/apps/waline/*/data/waline.sqlite",
        "/opt/1panel/apps/waline/*/data/*.sqlite",
        "/opt/1panel/apps/waline/*/*/data/waline.sqlite",
    ]:
        hits = glob.glob(p)
        if hits:
            return hits[0]
    return None


def main():
    db = sys.argv[1] if len(sys.argv) > 1 else find_db()
    if not db:
        sys.exit("未找到 waline.sqlite，请把路径作为第一个参数传入")
    print("目标数据库:", db)

    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cols = [r[1] for r in cur.execute("PRAGMA table_info(wl_Comment)")]
    if not cols:
        sys.exit("没有 wl_Comment 表")

    before = cur.execute("SELECT COUNT(*) FROM wl_Comment WHERE url='/'").fetchone()[0]
    existing = set(cur.execute("SELECT nick, insertedAt FROM wl_Comment WHERE url='/'").fetchall())

    inserted = 0
    for c in DATA:
        if (c["nick"], c["ts"]) in existing:
            continue
        fields = {
            "url": "/",
            "nick": c["nick"],
            "link": c["link"],
            "comment": c["body"],
            "ip": "::ffff:127.0.0.1",
            "insertedAt": c["ts"],
            "createdAt": c["ts"],
            "updatedAt": c["ts"],
            "status": "approved",
            "mail": "m@waline.local",
        }
        use = {k: v for k, v in fields.items() if k in cols}
        sql = "INSERT INTO wl_Comment (%s) VALUES (%s)" % (",".join(use), ",".join("?" * len(use)))
        cur.execute(sql, list(use.values()))
        inserted += 1

    conn.commit()
    after = cur.execute("SELECT COUNT(*) FROM wl_Comment WHERE url='/'").fetchone()[0]
    print("导入完成：本次插入 %d 条（跳过 %d 条）" % (inserted, len(DATA) - inserted))
    print("首页(url=/)评论数：%d → %d" % (before, after))
    conn.close()


if __name__ == "__main__":
    main()
