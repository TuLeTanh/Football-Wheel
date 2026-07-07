# Team Wheel – eFootball Companion

Random đội bóng nhanh, đẹp, mượt và **100% offline** cho cộng đồng eFootball/PES.
Ba danh mục: **Club · National Team · Legend Club**. Chọn đội mình thích → quay →
nhận kết quả → khóa lại → quay tiếp → chia sẻ.

Đây là bộ source code end-to-end theo đúng PRD `Team Wheel – eFootball Companion v1.0`:
mobile-first, offline-first, animation-first, cùng một source build ra được
**Android (APK/AAB)**, **iOS** và **PWA cài được ngay trên điện thoại**.

## Tech stack (đúng Part 8.2 của PRD)

React 19 · TypeScript · Vite · TailwindCSS · Capacitor · Framer Motion + SVG ·
Zustand · React Router · Lucide · localStorage · html-to-image · react-i18next.

## 1. Cài đặt

Yêu cầu Node.js 20+.

```bash
npm install
```

## 2. Chạy thử trên máy tính (mở bằng điện thoại qua LAN)

```bash
npm run dev -- --host
```

Vite sẽ in ra một địa chỉ dạng `http://192.168.x.x:5173` — mở địa chỉ đó bằng
trình duyệt điện thoại (cùng mạng Wi-Fi) để test trực tiếp trên tay, đúng tinh
thần "Mobile First" của PRD. Thu nhỏ cửa sổ trình duyệt xuống ~390px cũng
mô phỏng khá sát trải nghiệm điện thoại.

## 3. Build & cài đặt như một ứng dụng (PWA) — "tải về ngay lập tức"

```bash
npm run build
npm run preview -- --host
```

Mở địa chỉ preview bằng Chrome (Android) hoặc Safari (iOS) trên điện thoại:

- **Android/Chrome**: trình duyệt sẽ tự gợi ý "Thêm vào Màn hình chính / Install
  app". Sau khi cài, app có icon riêng, chạy toàn màn hình, hoạt động offline
  hoàn toàn nhờ Service Worker (vite-plugin-pwa).
- **iOS/Safari**: bấm nút Share → "Add to Home Screen".

Muốn deploy thật (Vercel/Netlify/GitHub Pages) chỉ cần host thư mục `dist/`
sinh ra sau `npm run build` — không cần server, không cần database.

## 4. Build Android (APK/AAB) và iOS qua Capacitor

Lần đầu cần thêm 2 platform (chỉ chạy 1 lần, cần máy có Android Studio /
Xcode tương ứng):

```bash
npx cap add android
npx cap add ios
```

Từ lần sau, mỗi khi sửa code:

```bash
npm run cap:android   # build web -> sync -> mở Android Studio
npm run cap:ios       # build web -> sync -> mở Xcode
```

Trong Android Studio: Build > Generate Signed Bundle/APK để ra file APK/AAB.
Trong Xcode: chọn team ký (signing) rồi Archive để build IPA.

> Toàn bộ 3 nền tảng (Android, iOS, PWA) dùng chung 100% code trong `src/` —
> đúng Goal 4 của PRD.

## 5. Mở rộng dữ liệu đội bóng (Goal 5 của PRD)

Không cần sửa code. Mỗi danh mục là một file JSON trong `src/data/`:

- `clubs.json`
- `nationalTeams.json`
- `legendClubs.json`

Chỉ cần thêm object mới vào đúng file, ví dụ thêm một CLB J-League:

```json
{ "id": "club-urawa-reds", "name": "Urawa Red Diamonds", "code": "URA", "region": "Japan" }
```

Muốn thêm hẳn 1 danh mục mới (ví dụ "J-League" riêng biệt): tạo file
`src/data/jLeague.json` cùng cấu trúc, rồi khai báo thêm 2 dòng trong
`src/data/index.ts` (`TEAMS_BY_CATEGORY` và `CATEGORIES`) và thêm `CategoryId`
tương ứng trong `src/types/index.ts`.

**Về logo:** app không dùng logo CLB thật (tránh vi phạm bản quyền hình ảnh).
Thay vào đó mỗi đội có một "huy hiệu" SVG sinh tự động từ tên đội (màu +
initials, ổn định qua các lần mở app) — xem `src/utils/badge.ts` và
`src/components/TeamBadge.tsx`. Nếu bạn có bộ logo được cấp phép, chỉ cần thay
`TeamBadge` bằng `<img src={...} />` tương ứng.

## 6. Cấu trúc thư mục

```
src/
  components/   Button, Wheel, TeamCard, SearchBar, ShareCard, Toast, ...
  data/         clubs.json, nationalTeams.json, legendClubs.json, index.ts
  i18n/         en.json, vi.json
  pages/        Splash, Home, Selection, WheelPage, History, Statistics,
                Settings, ShareResult  (9 màn hình theo Part 8.3 của PRD)
  router/       khai báo route
  stores/       Zustand: settings, selection (chọn + khóa/mở khóa), history,
                statistics — tất cả persist vào localStorage
  types/        kiểu dữ liệu dùng chung
  utils/        randomEngine (random công bằng + tính góc quay), badge,
                haptics (Capacitor Haptics hoặc Vibration API), storage an toàn
```

## 7. Những nguyên tắc đã áp dụng theo PRD

- **Offline First**: không gọi API, không server, mọi thứ lưu localStorage.
- **One-hand friendly**: nút chính (Spin, Continue) luôn nằm ở nửa dưới màn
  hình, cao 56px, dễ bấm bằng ngón cái.
- **Mọi thao tác đều có phản hồi**: scale khi nhấn nút (Framer Motion spring),
  haptic feedback (nhẹ khi chọn, mạnh khi ra kết quả, nhẹ khi khóa), toast xác
  nhận sau mỗi hành động quan trọng.
- **Random công bằng**: `pickRandomTeam` dùng `crypto.getRandomValues` (không
  thiên vị đội nào), mỗi đội trong danh sách đã chọn có xác suất bằng nhau.
- **Giảm chuyển động (Reduce Motion)**: tự động tôn trọng
  `prefers-reduced-motion`, có thể bật tay trong Settings.

## 8. Thiết kế hình ảnh — "Match Night"

Bảng màu và phong cách được xây riêng cho eFootball, không dùng theme mặc định:
nền xanh-đen như sân bóng ban đêm dưới ánh đèn pha, ba màu điểm nhấn cho ba
danh mục (xanh lá – Club, vàng gold – National Team như cúp, tím – Legend Club
gợi sự quý hiếm), font tiêu đề `Oswald` (condensed, giống bảng điện tử sân
vận động), màn hình kết quả dựng như thẻ kết quả bốc thăm truyền hình.

---

Toàn bộ mã nguồn đã được kiểm tra cú pháp/kiểu dữ liệu bằng TypeScript compiler.
Vì môi trường sinh code này không có kết nối mạng nên chưa chạy được
`npm install`/`npm run build` thực tế — hãy chạy 2 lệnh đó đầu tiên trên máy
của bạn để chắc chắn mọi dependency tải đúng phiên bản.
