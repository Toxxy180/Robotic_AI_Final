# Robotic_AI_Final — Robotics & AI สมุดทบทวน 3D

เว็บไซต์ภาษาไทยรวมโจทย์เต็ม 25 ข้อ พร้อมคำตอบกระชับและภาพจำลองสามมิติสำหรับรายวิชา Robotics & AI

เว็บไซต์: https://toxxy180.github.io/Robotic_AI_Final/

## ฟังก์ชัน

- โจทย์เต็มและคำตอบครบ 25 ข้อ พร้อมแหล่งอ้างอิงในข้อสำคัญ
- ค้นหาและเลือกหมวดหมู่
- โมเดล 3D หมุนได้: หุ่นยนต์, Sense–Think–Act, หุ่นยนต์ดูดฝุ่น, แขนกล และรถยนต์
- แยกชิ้นส่วนหุ่นยนต์ดูดฝุ่น เปรียบเทียบ Articulated/Delta และเลือก SAE ระดับ 0–5
- ปุ่มคัดลอกคำตอบ บันทึกการอ่านในเบราว์เซอร์ และพิมพ์/บันทึก PDF
- รองรับมือถือและการลดภาพเคลื่อนไหว

## GitHub Pages

เปิด Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save

ไม่ต้องติดตั้ง dependencies หรือ build ไฟล์ทั้งหมดเป็น Static HTML/CSS/JavaScript ใช้พาธแบบ relative และรวม Three.js กับฟอนต์ไว้ใน repository แล้ว

## ดูในเครื่อง

เปิด HTTP server จากโฟลเดอร์ repository เช่น `python -m http.server 8000` แล้วเข้า http://localhost:8000

การเปิด `index.html` ด้วย file:// โดยตรงอาจถูกเบราว์เซอร์บล็อกการโหลดโมดูล 3D

แก้โจทย์และคำตอบได้ใน `content.js`, หน้าตาใน `styles.css`, และภาพจำลองใน `visuals.js`

โมเดลเป็นภาพประกอบเพื่อการเรียนรู้ ไม่ใช่รายละเอียดทางวิศวกรรมตามสัดส่วนจริง ใบอนุญาต Three.js อยู่ใน `vendor/THREE-LICENSE.txt` และฟอนต์อยู่ใน `assets/OFL-NotoSansThai.txt`
เนื้อหาการเรียน ข้อสอบต่างๆ
