from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


SOURCE = Path(r"D:\CC\referensi_jumbo.jpeg")
OUT_DIR = Path("assets/images")
CARD_OUT = OUT_DIR / "jumbo-credit-card-cutout.png"
BACKGROUND_OUT = OUT_DIR / "jumbo-background-without-card.png"


def polygon_mask(size, points, feather=0, expand=0):
    mask = Image.new("L", size, 0)
    if expand:
        cx = sum(x for x, _ in points) / len(points)
        cy = sum(y for _, y in points) / len(points)
        points = [
            (
                int(round(cx + (x - cx) * (1 + expand))),
                int(round(cy + (y - cy) * (1 + expand))),
            )
            for x, y in points
        ]
    ImageDraw.Draw(mask).polygon(points, fill=255)
    if feather:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return mask


def fit_blue_gradient(rgb, remove_mask):
    h, w, _ = rgb.shape
    yy, xx = np.mgrid[0:h, 0:w]

    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    blue_pixels = (
        (remove_mask < 1)
        & (b > 45)
        & (b > r * 1.35)
        & (b > g * 0.95)
        & (r < 70)
        & (g < 135)
    )

    sample_y, sample_x = np.where(blue_pixels)
    if len(sample_x) > 180_000:
        idx = np.linspace(0, len(sample_x) - 1, 180_000).astype(int)
        sample_x = sample_x[idx]
        sample_y = sample_y[idx]

    x = sample_x / max(w - 1, 1)
    y = sample_y / max(h - 1, 1)
    features = np.stack(
        [
            np.ones_like(x),
            x,
            y,
            x * x,
            y * y,
            x * y,
            x * x * y,
            x * y * y,
        ],
        axis=1,
    )

    full_x = (xx.reshape(-1) / max(w - 1, 1))
    full_y = (yy.reshape(-1) / max(h - 1, 1))
    full_features = np.stack(
        [
            np.ones_like(full_x),
            full_x,
            full_y,
            full_x * full_x,
            full_y * full_y,
            full_x * full_y,
            full_x * full_x * full_y,
            full_x * full_y * full_y,
        ],
        axis=1,
    )

    channels = []
    for c in range(3):
        values = rgb[sample_y, sample_x, c].astype(np.float64)
        coeffs, *_ = np.linalg.lstsq(features, values, rcond=None)
        fitted = full_features @ coeffs
        channels.append(fitted.reshape(h, w))

    return np.clip(np.stack(channels, axis=2), 0, 255).astype(np.uint8)


def diffuse_inpaint(rgb, mask, iterations=950):
    unknown = mask > 0
    ys, xs = np.where(unknown)
    pad = 24
    y0, y1 = max(int(ys.min()) - pad, 0), min(int(ys.max()) + pad + 1, rgb.shape[0])
    x0, x1 = max(int(xs.min()) - pad, 0), min(int(xs.max()) + pad + 1, rgb.shape[1])

    work = rgb[y0:y1, x0:x1].astype(np.float32)
    work_mask = unknown[y0:y1, x0:x1]

    gradient = fit_blue_gradient(rgb, mask.astype(np.float32))
    work[work_mask] = gradient[y0:y1, x0:x1][work_mask]

    for _ in range(iterations):
        padded = np.pad(work, ((1, 1), (1, 1), (0, 0)), mode="edge")
        avg = (
            padded[:-2, 1:-1]
            + padded[2:, 1:-1]
            + padded[1:-1, :-2]
            + padded[1:-1, 2:]
        ) * 0.25
        work[work_mask] = avg[work_mask]

    out = rgb.copy()
    out[y0:y1, x0:x1][work_mask] = np.clip(work[work_mask], 0, 255).astype(np.uint8)
    return out


def homography(src, dst):
    rows = []
    for (x, y), (u, v) in zip(src, dst):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    a = np.asarray(rows, dtype=np.float64)
    b = np.asarray(dst, dtype=np.float64).reshape(8)
    coeffs = np.linalg.solve(a, b)
    return np.append(coeffs, 1).reshape(3, 3)


def rounded_perspective_mask(size, quad, rect_size=(1000, 630), radius=74):
    w, h = size
    rw, rh = rect_size
    src = [(0, 0), (rw, 0), (rw, rh), (0, rh)]
    hmat = homography(src, quad)
    inv = np.linalg.inv(hmat)

    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    x0, x1 = max(int(min(xs)) - 8, 0), min(int(max(xs)) + 8, w)
    y0, y1 = max(int(min(ys)) - 8, 0), min(int(max(ys)) + 8, h)

    yy, xx = np.mgrid[y0:y1, x0:x1]
    ones = np.ones_like(xx, dtype=np.float64)
    pts = np.stack([xx.astype(np.float64), yy.astype(np.float64), ones], axis=0).reshape(3, -1)
    local = inv @ pts
    local = local / local[2]
    lx = local[0].reshape(y1 - y0, x1 - x0)
    ly = local[1].reshape(y1 - y0, x1 - x0)

    inside_rect = (lx >= 0) & (lx <= rw) & (ly >= 0) & (ly <= rh)
    cx = np.clip(lx, radius, rw - radius)
    cy = np.clip(ly, radius, rh - radius)
    inside_round = ((lx - cx) ** 2 + (ly - cy) ** 2) <= radius**2

    mask = np.zeros((h, w), dtype=np.uint8)
    mask[y0:y1, x0:x1] = ((inside_rect & inside_round) * 255).astype(np.uint8)
    return Image.fromarray(mask, "L").filter(ImageFilter.GaussianBlur(1.1))


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    image = Image.open(SOURCE).convert("RGBA")
    w, h = image.size

    # Perspective outline of the visible credit card body in the source image.
    card_points = [(778, 477), (1390, 331), (1430, 776), (750, 891)]
    card_mask = rounded_perspective_mask((w, h), card_points)

    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    card.alpha_composite(image)
    card.putalpha(card_mask)
    bbox = card_mask.getbbox()
    if bbox:
        pad = 12
        bbox = (
            max(bbox[0] - pad, 0),
            max(bbox[1] - pad, 0),
            min(bbox[2] + pad, w),
            min(bbox[3] + pad, h),
        )
        card = card.crop(bbox)
    card.save(CARD_OUT)

    remove_points = [(715, 445), (1430, 282), (1490, 858), (696, 944)]
    hard_remove_mask = polygon_mask((w, h), remove_points, feather=0)
    soft_remove_mask = polygon_mask((w, h), remove_points, feather=16)
    remove_arr = np.asarray(soft_remove_mask).astype(np.float32) / 255.0

    rgb = np.asarray(image.convert("RGB"))
    fitted = diffuse_inpaint(rgb, np.asarray(hard_remove_mask), iterations=950)
    source = rgb.astype(np.float32)
    fill = fitted.astype(np.float32)
    alpha = remove_arr[:, :, None]
    background = (source * (1 - alpha) + fill * alpha).astype(np.uint8)

    Image.fromarray(background, "RGB").save(BACKGROUND_OUT, quality=95)

    print(f"saved {CARD_OUT}")
    print(f"saved {BACKGROUND_OUT}")


if __name__ == "__main__":
    main()
