# -*- coding: utf-8 -*-
"""
FTP 资料库编目生成管道（方案 §6.1，吸收自 招新/FTP资料库展示/生成脚本/extract.py）

输入：FTP 扫描清单（ftp_files9.txt / ftp_dirs9.txt，TAB 分隔：大小\t日期\t路径）
输出：public/data/ftp-catalog.json —— 官网 /ftp 页面的目录树数据
      每个目录节点：{ name, files(递归文件数), size(递归容量), direct(直属文件数),
                      fl([[文件名, 字节], ...] 直属文件清单，按名排序), children? }

使用：python scripts/ftp/extract_catalog.py
      （可选参数：--scan <扫描目录> --out <输出路径>，默认用下方常量）

安全（§6.1 脱敏规则）：内置目录/文件黑名单关键词，命中即整体跳过；
     每次运行输出摘要，与上一版对比数量变化，供 PR 评审。
"""
import argparse
import json
import os
import sys
from collections import defaultdict

# ---------------- 默认路径 ----------------
SCAN_DIR = r"E:\A 创新基地\FTP\05-扫描数据\最新"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "public", "data", "ftp-catalog.json")
ROOT = "/home/ftp/ftp_seven"
FTP_HOST_NOTE = "ftp://10.60.92.17"  # 页面复制路径时使用（此处仅作说明）

# ---------------- 脱敏黑名单（命中即不入编目） ----------------
SKIP_DIR_KEYWORDS = ["管理专用", "已删除待清空", "隐私留存"]
SKIP_FILE_KEYWORDS = ["密码", "passwd", "password", "账号信息"]


def load_scan(scan_dir):
    files = {}
    for line in open(os.path.join(scan_dir, "ftp_files9.txt"), encoding="utf-8", errors="replace"):
        line = line.rstrip("\n")
        if not line:
            continue
        parts = line.split("\t", 2)
        if len(parts) != 3:
            continue
        sz, _dt, p = parts
        files[p] = int(sz)
    dirs = []
    for line in open(os.path.join(scan_dir, "ftp_dirs9.txt"), encoding="utf-8", errors="replace"):
        line = line.strip()
        if line.startswith(ROOT):
            dirs.append(line)
    return files, dirs


def is_sensitive(path):
    low = path.lower()
    return any(k in path for k in SKIP_DIR_KEYWORDS) or any(k in low for k in SKIP_FILE_KEYWORDS)


def build_tree(files, dirs):
    # 过滤敏感路径
    files = {p: s for p, s in files.items() if not is_sensitive(p)}
    dirs = [d for d in dirs if not is_sensitive(d)]

    # 每目录直属文件清单 + 计数
    fl_map = defaultdict(list)
    for p, s in files.items():
        parent, name = p.rsplit("/", 1)
        fl_map[parent].append([name, s])
    for lst in fl_map.values():
        lst.sort(key=lambda x: x[0])

    direct_cnt = defaultdict(int)
    direct_sz = defaultdict(int)
    for p, s in files.items():
        parent = p.rsplit("/", 1)[0]
        direct_cnt[parent] += 1
        direct_sz[parent] += s

    # 递归总数/总容量（向上累计）
    total_cnt = defaultdict(int)
    total_sz = defaultdict(int)
    for p, s in files.items():
        cur = p.rsplit("/", 1)[0]
        while cur.startswith(ROOT):
            total_cnt[cur] += 1
            total_sz[cur] += s
            if cur == ROOT:
                break
            cur = cur.rsplit("/", 1)[0]

    dir_set = set(dirs)

    def build(path):
        name = path.rsplit("/", 1)[-1] if path != ROOT else "基地 FTP 资料库"
        node = {
            "name": name,
            "files": total_cnt.get(path, 0),
            "size": total_sz.get(path, 0),
            "direct": direct_cnt.get(path, 0),
        }
        if fl_map.get(path):
            node["fl"] = fl_map[path]
        prefix = path + "/"
        subs = sorted(d for d in dir_set if d.startswith(prefix) and "/" not in d[len(prefix):])
        if subs:
            node["children"] = [build(s) for s in subs]
        return node

    return build(ROOT)


def count_nodes(node):
    folders = 0
    files = 0
    stack = [node]
    while stack:
        n = stack.pop()
        if n.get("children") or n.get("fl"):
            folders += 1
        files += n.get("direct", 0)
        stack.extend(n.get("children", []))
    return folders, files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scan", default=SCAN_DIR)
    ap.add_argument("--out", default=OUT_PATH)
    args = ap.parse_args()

    files, dirs = load_scan(args.scan)
    print(f"扫描清单：{len(files)} 文件 / {len(dirs)} 目录")

    tree = build_tree(files, dirs)
    partitions = sorted(tree.get("children", []), key=lambda n: n["name"])
    skipped = len(files) - tree["files"]

    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, separators=(",", ":"))

    folders, _ = count_nodes(tree)
    print(f"\n编目完成：{tree['files']} 文件 / {tree['size'] / 1024**3:.1f} GB / {len(partitions)} 分区 / {folders} 文件夹")
    print(f"输出：{out}（{os.path.getsize(out) / 1024:.0f} KB）")
    for p in partitions:
        print(f"  {p['name']:<16} {p['files']:>6} 文件  {p['size'] / 1024**2:>9.1f} MB")

    # 与上一版对比（若存在）
    if os.path.exists(out + ".prev"):
        with open(out + ".prev", encoding="utf-8") as f:
            prev = json.load(f)
        d_files = tree["files"] - prev["files"]
        d_size = tree["size"] - prev["size"]
        print(f"\n与上一版对比：文件 {d_files:+d}，容量 {d_size / 1024**3:+.2f} GB")

    print(f"\n注：复制路径前缀 {FTP_HOST_NOTE}（页面拼接，不在本数据中）")
    if skipped:
        print(f"（脱敏跳过 {skipped} 项）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
