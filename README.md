# 바로문서 (BaroDoc) — 무료 A4 서식 7종 & 온라인 투명 도장 만들기

백엔드 서버 비용 없이 100% 브라우저 안에서 동작하는 정적(Static) 한국 표준 서식·도장 웹 도구 사이트입니다.

## 포함된 기능 (총 13개 정적 페이지)
- **홈 (`/`)**: 전체 도구 허브, 3단계 이용 안내, 보안 안내, FAQ
- **무료 서식 7종**:
  1. `/sajikseo/` — 사직서 양식 (사직 사유 프리셋, 인수인계·비밀유지 서약, 도장 날인)
  2. `/chayongjeung/` — 차용증 양식 (원금 한글·한자 大字 자동 변환, 이자제한법 연 20% 자동 경고, 연대보증인 옵션, 다중 날인)
  3. `/wiimjang/` — 위임장 양식 (민원·금융·부동산·차량 프리셋, 유효기간 설정, 도장 날인)
  4. `/jaejik/` — 재직증명서 양식 (입사일 기준 재직기간 자동 계산, 주민번호 뒷자리 마스킹, 회사 직인 날인)
  5. `/gyeonjeokseo/` — 견적서 양식 (품목 동적 추가, 부가세 별도/포함/면세 자동 계산, 총합계 한글 금액 표기, 직인 날인)
  6. `/geunro/` — 표준근로계약서 양식 (정규직·계약직·알바, 2026년 최저임금 10,320원/2,156,880원 자동 점검, 양측 날인)
  7. `/georae/` — 거래명세서 양식 (공급자 적색·공급받는자 청색·2매 동시 출력, 부가세 자동 계산, 직인 날인)
- **무료 온라인 도장 만들기 (`/stamp/`)**:
  - 원형·타원·사각 회사직인·3단 결재도장 600×600 투명 배경 PNG 생성
  - 내 도장함(`localStorage`) 저장 후 7종 서식 페이지 원클릭 자동 날인 연동
- **애드센스 필수 신뢰 페이지**: `/about/`, `/privacy/`, `/terms/`, `/contact/` + `/404.html`
- **SEO & 크롤러 파일**: `/sitemap.xml`, `/robots.txt`, `/ads.txt`, `/_headers`

## 폴더 구조
```
barodoc-web/
├── site-config.json             # 도메인, 이메일, 애드센스 ID, 검색엔진 인증 메타 통합 설정
├── build.py                     # 정적 사이트 생성기 (Python 3 표준 라이브러리만 사용)
├── src/                         # 콘텐츠 데이터 및 HTML 템플릿 소스
├── tests/verify.py              # SEO·애드센스·링크·JSON-LD 자동 점검 스크립트
├── DEPLOY_AND_ADSENSE_GUIDE.md  # GitHub + Cloudflare Pages + 가비아 + 애드센스 가이드
└── public/                      # ⭐ Cloudflare Pages / GitHub Pages 배포용 최종 정적 폴더
```

## 도메인·애드센스 ID 변경 후 재빌드 방법
가비아에서 구매한 실제 도메인이나 애드센스 ID를 반영할 때는 `site-config.json`을 수정하거나 아래 명령을 한 번만 실행하면 모든 HTML 페이지의 `canonical`, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `ads.txt`가 자동 갱신됩니다.

```bash
python build.py --domain https://실제도메인.kr --email contact@실제도메인.kr --save-config
```

애드센스 계정 생성 후 Publisher ID 반영:
```bash
python build.py --adsense ca-pub-1234567890123456 --save-config
```

## 로컬 미리보기 & 자동 점검
```bash
# 1) SEO·애드센스·링크 자동 점검
python tests/verify.py

# 2) 로컬 미리보기 서버 실행 (브라우저에서 http://127.0.0.1:8787 접속)
python -m http.server 8787 --bind 127.0.0.1 --directory public
```
