import cv2
import os

image_path = "turnaround.png"

img = cv2.imread(image_path)

if img is None:
    raise FileNotFoundError(f"Не удалось открыть {image_path}")

h, w = img.shape[:2]

rows = 2
cols = 3

cell_h = h // rows
cell_w = w // cols

output_dir = "views"
os.makedirs(output_dir, exist_ok=True)

names = [
    "front",
    "side",
    "back",
    "front_3q",
    "back_3q",
    "top_front",
]

idx = 0

for r in range(rows):
    for c in range(cols):
        x1 = c * cell_w
        y1 = r * cell_h

        x2 = w if c == cols - 1 else (c + 1) * cell_w
        y2 = h if r == rows - 1 else (r + 1) * cell_h

        crop = img[y1:y2, x1:x2]

        filename = names[idx] if idx < len(names) else f"view_{idx+1}"
        cv2.imwrite(os.path.join(output_dir, f"{filename}.png"), crop)

        idx += 1

print("Готово!")
