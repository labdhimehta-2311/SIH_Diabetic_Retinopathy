import cv2
import numpy as np
import os

def create_synthetic_fundus(filename, grade=0):
    size = 600
    img = np.zeros((size, size, 3), dtype=np.uint8)
    
    # 1. Retinal background (deep orange/reddish gradient with vignette)
    center = (size // 2, size // 2)
    radius = int(size * 0.45)
    
    y, x = np.ogrid[:size, :size]
    dist_from_center = np.sqrt((x - center[0])**2 + (y - center[1])**2)
    
    # Fundus circular aperture mask
    retina_mask = dist_from_center <= radius
    
    # Base retinal color: BGR (deep warm red-orange: B ~ 15, G ~ 45, R ~ 180)
    for c, val in enumerate([15, 55, 190]):
        # Radial shading
        channel_vals = val * (1.0 - 0.35 * (dist_from_center / radius)**1.5)
        img[:, :, c] = np.clip(channel_vals, 0, 255).astype(np.uint8)
        
    img[~retina_mask] = 0
    
    # 2. Optic Disc (bright yellow-white circle on nasal side, e.g. x = 180, y = 300)
    disc_center = (int(size * 0.32), int(size * 0.5))
    disc_radius = int(size * 0.07)
    cv2.circle(img, disc_center, disc_radius, (120, 210, 245), -1) # BGR
    # Soften disc edges
    disc_mask = (x - disc_center[0])**2 + (y - disc_center[1])**2 <= disc_radius**2
    img = cv2.GaussianBlur(img, (5, 5), 1.0)
    
    # 3. Macula / Fovea (darker red area on temporal side, e.g. x = 380, y = 300)
    fovea_center = (int(size * 0.63), int(size * 0.5))
    cv2.circle(img, fovea_center, int(size * 0.09), (10, 30, 140), -1)
    img = cv2.GaussianBlur(img, (9, 9), 2.0)
    
    # 4. Retinal Blood Vessels radiating from optic disc
    for angle_deg in [-70, -45, -20, 10, 35, 65, 120, 150, 190, 230]:
        rad = np.deg2rad(angle_deg)
        pts = []
        cx, cy = float(disc_center[0]), float(disc_center[1])
        pts.append((int(cx), int(cy)))
        for r_step in range(15, int(radius * 0.85), 25):
            cur_r = r_step + np.random.uniform(-5, 5)
            # slight curve
            cur_angle = rad + 0.3 * np.sin(r_step / 60.0)
            px = int(cx + cur_r * np.cos(cur_angle))
            py = int(cy + cur_r * np.sin(cur_angle))
            if 0 <= px < size and 0 <= py < size and retina_mask[py, px]:
                pts.append((px, py))
        if len(pts) > 2:
            pts_arr = np.array(pts, np.int32).reshape((-1, 1, 2))
            cv2.polylines(img, [pts_arr], False, (10, 20, 110), thickness=np.random.randint(2, 5))
            
    # Re-apply mask
    img[~retina_mask] = 0
    
    # 5. Lesions depending on grade
    if grade == 1:
        # Mild: few microaneurysms (tiny dark red dots)
        np.random.seed(42)
        for _ in range(12):
            rx = int(fovea_center[0] + np.random.uniform(-80, 80))
            ry = int(fovea_center[1] + np.random.uniform(-80, 80))
            if retina_mask[ry, rx]:
                cv2.circle(img, (rx, ry), np.random.randint(2, 4), (5, 10, 90), -1)
    elif grade >= 2:
        # Severe / Moderate: multiple blot hemorrhages + bright hard exudates
        np.random.seed(99)
        # Blot hemorrhages (dark red irregular spots)
        for _ in range(35 if grade == 2 else 70):
            rx = int(size * 0.5 + np.random.uniform(-140, 140))
            ry = int(size * 0.5 + np.random.uniform(-140, 140))
            if retina_mask[ry, rx]:
                r_size = np.random.randint(4, 9 if grade == 2 else 14)
                cv2.circle(img, (rx, ry), r_size, (5, 10, 85), -1)
                
        # Hard Exudates (bright yellowish lipid deposits near macula)
        for _ in range(25 if grade == 2 else 60):
            ex = int(fovea_center[0] + np.random.uniform(-100, 100))
            ey = int(fovea_center[1] + np.random.uniform(-90, 90))
            if retina_mask[ey, ex]:
                cv2.circle(img, (ex, ey), np.random.randint(2, 6), (80, 230, 255), -1)
                
    # Final smoothing pass to look organic
    img = cv2.GaussianBlur(img, (3, 3), 0.5)
    img[~retina_mask] = 0
    
    cv2.imwrite(filename, img)
    print(f"Generated sample: {filename}")

if __name__ == '__main__':
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'samples'))
    os.makedirs(out_dir, exist_ok=True)
    create_synthetic_fundus(os.path.join(out_dir, "sample_0_normal_fundus.png"), grade=0)
    create_synthetic_fundus(os.path.join(out_dir, "sample_1_mild_npdr.png"), grade=1)
    create_synthetic_fundus(os.path.join(out_dir, "sample_2_severe_dr.png"), grade=3)
