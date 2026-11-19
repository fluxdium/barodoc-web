# 바로문서 배포 · 검색엔진 등록 · 애드센스 승인 완벽 가이드

이 문서는 완성된 `barodoc-web` 정적 사이트를 **GitHub + Cloudflare Pages + 가비아 도메인 1개**로 무료 배포하고, **구글 서치 콘솔·네이버 서치어드바이저·구글 애드센스**까지 한 번에 연결하는 실무 체크리스트입니다.

---

## 1단계: 실제 도메인 반영 및 재빌드 (1분)
가비아에서 구매한 도메인(예: `barodoc.kr`)과 문의 이메일을 반영합니다.

```bash
python build.py --domain https://구매한도메인.kr --email 본인@이메일.com --save-config
python tests/verify.py
```
- 실행 즉시 `public/` 안의 13개 HTML, `sitemap.xml`, `robots.txt`, JSON-LD, `canonical` URL이 실제 도메인으로 일괄 갱신됩니다.

---

## 2단계: GitHub + Cloudflare Pages 무료 배포 (5분)
Cloudflare Pages는 무료 플랜에서도 대역폭 무제한, 전 세계 CDN, 자동 HTTPS(SSL), `_headers` 보안 헤더를 지원하므로 GitHub Pages보다 권장합니다.

1. **GitHub 저장소 생성**: GitHub에 새 저장소(예: `barodoc-web`)를 만들고 본 폴더 전체를 업로드(Push)합니다.
2. **Cloudflare Pages 연결**:
   - [Cloudflare 대시보드](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** 선택
   - `barodoc-web` 저장소 선택 후 빌드 설정을 아래와 같이 입력:
     - **Framework preset**: `None`
     - **Build command**: *(비워둠)*
     - **Build output directory**: `public`
   - **Save and Deploy** 클릭 → 약 30초 뒤 `*.pages.dev` 주소로 배포 완료!

---

## 3단계: 가비아 도메인 연결 (5분)
가장 안정적이고 빠른 방법은 **Cloudflare 네임서버 연결(무료)**입니다.

1. Cloudflare 대시보드 → **Add a site** → 가비아에서 산 도메인 입력 → **Free 플랜** 선택
2. Cloudflare가 안내하는 네임서버 2개(예: `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`) 복사
3. **가비아 My가비아 → 도메인 관리 → 네임서버 설정**에서 1차·2차 네임서버를 Cloudflare 값으로 변경 후 저장
4. Cloudflare Pages 프로젝트 → **Custom domains** → `구매한도메인.kr` 및 `www.구매한도메인.kr` 추가
5. 보통 10분~2시간 내에 SSL 인증서가 자동 발급되며 HTTPS 접속이 완료됩니다.

---

## 4단계: 구글 서치 콘솔 & 네이버 서치어드바이저 등록

### A. 구글 서치 콘솔 (Google Search Console)
1. [Google Search Console](https://search.google.com/search-console)에서 도메인 속성 추가 (Cloudflare DNS TXT 자동 인증 지원)
2. 좌측 **Sitemaps** 메뉴 → `sitemap.xml` 제출
3. URL 검사로 주요 페이지(`/`, `/sajikseo/`, `/chayongjeung/`, `/stamp/` 등) 색인 생성 요청

### B. 네이버 서치어드바이저 (Naver Search Advisor)
1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) → 웹마스터 도구 → 사이트 추가
2. HTML 태그 인증 값(`content="..."` 부분)을 복사한 뒤 아래 명령으로 사이트에 자동 삽입하고 재배포:
   ```bash
   python build.py --naver-verify 네이버인증코드 --save-config
   ```
3. 소유 확인 완료 후 **요청 → 사이트맵 제출**에 `https://구매한도메인.kr/sitemap.xml` 입력
4. **검증 → robots.txt**에서 `Yeti` 봇 수집 허용 상태 확인

---

## 5단계: 구글 애드센스 심사 신청 및 통과 체크리스트

### 현재 이미 완료된 심사 대비 항목
- [x] **고유한 실용 콘텐츠 확보**: 8개 도구 페이지 모두 각 1,600~2,350자(공백 제외)의 실무 작성 가이드, 법령 비교표, 체크리스트, 6개 FAQ 포함 (단순 도구 화면으로 인한 '가치가 별로 없는 콘텐츠' 거절 예방)
- [x] **필수 신뢰 페이지 완비**: 사이트 소개(`/about/`), 개인정보처리방침(`/privacy/` — 서버 비저장·AdSense 쿠키 고지 포함), 이용약관 및 법적 면책고지(`/terms/`), 문의하기(`/contact/`)
- [x] **깔끔한 UI 및 0개 깨진 링크**: 모바일 반응형 대응, 빈 광고 박스 숨김 처리(`.ad-slot:empty { display: none; }`)
- [x] **ads.txt 준비 완료**: `public/ads.txt` 자동 생성 구조 완비

### 심사 신청 직전 최종 액션
1. 구글 애드센스 가입 후 발급받은 게시자 ID(`ca-pub-XXXXXXXXXXXXXXXX`)를 아래 명령으로 반영 후 GitHub에 Push:
   ```bash
   python build.py --adsense ca-pub-XXXXXXXXXXXXXXXX --save-config
   ```
   - 모든 페이지 `<head>`에 애드센스 심사/자동광고 스크립트가 자동 삽입됩니다.
   - `public/ads.txt`에 `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` 한 줄이 자동 생성됩니다.
2. 배포 후 `https://구매한도메인.kr/ads.txt`가 정상 표시되는지 브라우저에서 확인한 뒤 애드센스 심사 검토를 요청하세요.
3. **승인 후 권장 광고 배치**:
   - 처음에는 **자동 광고(Auto Ads)**를 켜되, 인쇄 영역(`.a4-sheet`)이나 입력 폼 한가운데를 가리지 않도록 **앵커/사이드레일 최소화 + 인쇄 전용 `@media print` 자동 숨김**을 유지하세요.
   - 수동 디스플레이 광고 단위를 넣을 때는 이미 준비된 `<div class="ad-slot" data-ad-position="tool-below"></div>`(서식 작성기 바로 아래, 작성 가이드 위) 위치가 클릭률(CTR)과 사용자 경험 균형이 가장 좋습니다.
