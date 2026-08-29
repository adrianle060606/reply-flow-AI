#!/usr/bin/env python3
"""Generate ReplyMe PNG icons without third-party image libraries."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int, rgba) -> None:
    raw = b""
    for y in range(size):
        raw += b"\x00"
        for x in range(size):
            raw += bytes(rgba(x, y, size))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def inside_round_rect(x: float, y: float, size: int, radius: float) -> bool:
    cx = min(max(x, radius), size - 1 - radius)
    cy = min(max(y, radius), size - 1 - radius)
    dx, dy = x - cx, y - cy
    return dx * dx + dy * dy <= radius * radius


def icon_rgba(x: int, y: int, size: int) -> tuple[int, int, int, int]:
    pad = size * 0.06
    radius = size * 0.22
    if not inside_round_rect(x - pad, y - pad, int(size - 2 * pad), radius):
        return (0, 0, 0, 0)

    nx, ny = x / size, y / size
    r = int(lerp(18, 76, nx))
    g = int(lerp(12, 48, ny))
    b = int(lerp(28, 140, nx * 0.4 + ny * 0.6))

    # chat bubble
    bx, by, bw, bh = 0.22 * size, 0.26 * size, 0.56 * size, 0.38 * size
    if bx <= x <= bx + bw and by <= y <= by + bh:
        rx = min(x - bx, bx + bw - x)
        ry = min(y - by, by + bh - y)
        if rx > size * 0.04 and ry > size * 0.04:
            return (250, 250, 252, 255)

    # bubble tail
    if 0.30 * size <= x <= 0.42 * size and 0.60 * size <= y <= 0.74 * size:
        if x - 0.30 * size > (y - 0.60 * size) * 0.4:
            return (250, 250, 252, 255)

    # spark
    cx, cy = 0.72 * size, 0.28 * size
    if abs(x - cx) + abs(y - cy) < size * 0.07:
        return (167, 139, 250, 255)

    return (r, g, b, 255)


def main() -> None:
    out = Path("public/icons")
    out.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        write_png(out / f"icon{size}.png", size, icon_rgba)
    print("wrote", out)


if __name__ == "__main__":
    main()
