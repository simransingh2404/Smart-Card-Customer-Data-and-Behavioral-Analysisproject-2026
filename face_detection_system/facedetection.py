"""
╔══════════════════════════════════════════════════════════════╗
║         FACE DETECTION SYSTEM — OpenCV + Haar Cascade        ║
║         Beginner-Friendly | Hinglish Comments                ║
╚══════════════════════════════════════════════════════════════╝
"""

import cv2
import numpy as np
import os
import time
import sys

# ── Settings ──
CAMERA_INDEX  = 0
SAVE_FOLDER   = "saved_faces"
CASCADE_FILE  = "haarcascade_frontalface_default.xml"
SCALE_FACTOR  = 1.1
MIN_NEIGHBORS = 5
MIN_FACE_SIZE = (30, 30)

COLOR_BOX   = (0, 255, 0)
COLOR_TEXT  = (255, 255, 255)
COLOR_BG    = (0, 0, 0)
COLOR_TITLE = (0, 200, 255)
COLOR_ALERT = (0, 0, 255)

# ── Step 1: Haar Cascade load ──
def load_cascade():
    cascade_path = cv2.data.haarcascades + CASCADE_FILE
    if not os.path.exists(cascade_path):
        print(f"[ERROR] Cascade file not find: {cascade_path}")
        sys.exit(1)
    classifier = cv2.CascadeClassifier(cascade_path)
    if classifier.empty():
        print("[ERROR] Cascade file not load!")
        sys.exit(1)
    print("[OK] Haar Cascade successfully load.")
    return classifier

# ── Step 2: Detect the face in the Frame
def detect_faces(frame, classifier):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    faces = classifier.detectMultiScale(
        gray,
        scaleFactor=SCALE_FACTOR,
        minNeighbors=MIN_NEIGHBORS,
        minSize=MIN_FACE_SIZE,
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    if len(faces) == 0:
        return [], gray
    return faces, gray

# ── Step 3: Draw bounding boxes or lebles ──
def draw_annotations(frame, faces):
    face_count = len(faces)
    for i, (x, y, w, h) in enumerate(faces):
        cv2.rectangle(frame, (x, y), (x + w, y + h), COLOR_BOX, 2)
        label = f"Face {i + 1}"
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
        cv2.rectangle(frame, (x, y - text_h - 8), (x + text_w + 4, y), COLOR_BOX, -1)
        cv2.putText(frame, label, (x + 2, y - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, COLOR_BG, 1, cv2.LINE_AA)

    # Top bar
    cv2.rectangle(frame, (0, 0), (frame.shape[1], 42), (30, 30, 30), -1)
    cv2.putText(frame, "Face Detection System",
                (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.75, COLOR_TITLE, 2, cv2.LINE_AA)
    count_text = f"Faces: {face_count}"
    (cw, _), _ = cv2.getTextSize(count_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
    cv2.putText(frame, count_text, (frame.shape[1] - cw - 10, 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_TEXT, 2, cv2.LINE_AA)

    # Bottom bar
    h_frame = frame.shape[0]
    cv2.rectangle(frame, (0, h_frame - 32), (frame.shape[1], h_frame), (30, 30, 30), -1)
    cv2.putText(frame, "Press 'S' = Save  |  'Q' or ESC = Quit",
                (10, h_frame - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1, cv2.LINE_AA)
    return frame

# ── Step 4: Save the detected faces──
def save_faces(frame, faces, folder=SAVE_FOLDER):
    if not os.path.exists(folder):
        os.makedirs(folder)
    timestamp = int(time.time())
    saved = []
    for i, (x, y, w, h) in enumerate(faces):
        margin = 20
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(frame.shape[1], x + w + margin)
        y2 = min(frame.shape[0], y + h + margin)
        face_img = frame[y1:y2, x1:x2]
        filename = os.path.join(folder, f"face_{timestamp}_{i+1}.jpg")
        cv2.imwrite(filename, face_img)
        saved.append(filename)
        print(f"[SAVED] {filename}")
    return saved  

# ── Step 5: Detection in image file ──
def detect_from_image(image_path, classifier):
    if not os.path.exists(image_path):
        print(f"[ERROR] Image nahi mili: {image_path}")
        return
    frame = cv2.imread(image_path)
    if frame is None:
        print("[ERROR] Image read nahi ho sak.")
        return
    faces, _ = detect_faces(frame, classifier)
    annotated = draw_annotations(frame, faces)
    print(f"[RESULT] {len(faces)} face(s) detect hue in '{image_path}'")
    cv2.imshow("Image Detection — Press any key to close", annotated)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    out_path = "detected_" + os.path.basename(image_path)
    cv2.imwrite(out_path, annotated)
    print(f"[SAVED] Result image: {out_path}")

# ── Step 6: Real-time Webcam Detection ──
def run_webcam_detection(classifier):
    print("\n[INFO] The Webcam is opening...")
    cap = cv2.VideoCapture(CAMERA_INDEX)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print(f"[ERROR] Camera {CAMERA_INDEX} open nahi hua!")
        return

    print("[OK] Webcam ready! Controls: Q=Quit | S=Save | P=Pause")

    paused     = False
    last_faces = []
    last_frame = None
    fps_counter = 0
    fps_timer   = time.time()
    current_fps = 0.0

    while True:
        key = cv2.waitKey(1) & 0xFF

        if key in (ord('q'), 27):
            print("[INFO] Quit kiya.")
            break
        if key == ord('p'):
            paused = not paused
            print("[INFO]", "Paused." if paused else "Resumed.")
        if key == ord('s'):
            if last_faces is not None and len(last_faces) > 0 and last_frame is not None:
                save_faces(last_frame, last_faces)
            else:
                print("[INFO] Koi face detect nahi tha.")

        if not paused:
            ret, frame = cap.read()
            if not ret:
                print("[ERROR] Frame capture fail!")
                break

            frame = cv2.flip(frame, 1)
            faces, gray   = detect_faces(frame, classifier)
            last_faces    = faces
            last_frame    = frame.copy()
            display_frame = draw_annotations(frame, faces)

            fps_counter += 1
            elapsed = time.time() - fps_timer
            if elapsed >= 1.0:
                current_fps = fps_counter / elapsed
                fps_counter = 0
                fps_timer   = time.time()

            cv2.putText(display_frame, f"FPS: {current_fps:.1f}",
                        (10, display_frame.shape[0] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (120, 255, 120), 1)
        else:
            if last_frame is not None:
                display_frame = draw_annotations(last_frame.copy(), last_faces)
                cv2.putText(display_frame, "  PAUSED  ",
                            (display_frame.shape[1]//2 - 80, display_frame.shape[0]//2),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, COLOR_ALERT, 3)
            else:
                continue

        cv2.imshow("Face Detection — Live", display_frame)

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Done!")

# ── Step 7: Menu ──
def show_menu():
    print("\n" + "="*50)
    print("   FACE DETECTION SYSTEM")
    print("="*50)
    print("  1. Real-time webcam detection")
    print("  2. Detect faces in an image file")
    print("  3. Exit")
    print("="*50)
    return input("  Choice (1/2/3): ").strip()

# ── Main ──
def main():
    print("\n[INFO] Face Detection System start ho raha hai...")
    cascade = load_cascade()
    while True:
        choice = show_menu()
        if choice == "1":
            run_webcam_detection(cascade)
        elif choice == "2":
            img_path = input("  Image file ka path daalo: ").strip()
            detect_from_image(img_path, cascade)
        elif choice == "3":
            print("\n[INFO] Bye!\n")
            break
        else:
            print("[WARN] 1, 2 ya 3 daalo.")

if __name__ == "__main__":
    main()
