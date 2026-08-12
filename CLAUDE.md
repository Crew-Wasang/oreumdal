# 오름달 (Oremdal) — AI 투자 심리 코칭 앱

## 비전
수익률을 높여주는 앱이 아니다.
사용자가 스스로의 감정적 약점과 비합리적인 의사결정 패턴을 인지하고
개선하도록 돕는 앱이다.

## 핵심 설계 원칙
- 개입 시점은 반드시 **매매하기 전** (충동 체크)
- 기록/리포트는 부수 기능. 핵심이 아님
- 경쟁 대상은 다른 투자 앱이 아니라 **주식 커뮤니티**
  - 커뮤니티는 감정을 해소시켜주지만 충동을 더 자극함
  - 오름달은 그 자리를 대체해야 함: "매매 전에 여기 먼저 들러봐"
- 홈 화면 = "지금 매매하고 싶어?" CTA 버튼 하나가 중심

## MVP 범위
- 구독/Free/Pro 구분 없음. 모든 기능 전체 오픈
- 구독 모델은 출시 후 사용 패턴 확인 뒤 별도 설계
- 빠르게 핵심 플로우 검증하는 것이 목표

## AI 코칭 설계

### 역할
심리 코치형. 판단하지 않는다. 질문으로 사용자가 스스로 깨닫게 한다.
예: "지금 '불안해서' 팔고 싶다고 했는데, 그 불안이 정보에서 온 건지
     감정에서 온 건지 같이 짚어볼까요?"

### 코칭 흐름
1. CHK-01: 사용자 입력 — 종목명, 매수/매도 방향, 지금 감정 상태
2. CHK-02: AI가 심리 코치 스타일로 질문 3개를 던진다
3. CHK-03: 결론 카드 출력

### 결론 카드 (CHK-03)
- "지금 매매해도 괜찮아요" 또는 "한 번 더 생각해봐요"
- 충동도 점수 (예: 충동도 83%)
- 판단 근거 한 줄 요약
- 기록 저장 여부 선택 버튼

### AI 컨텍스트
- **참고하는 것**: 내 투자 원칙 (MGT-01에서 직접 설정한 것만)
- **참고하지 않는 것**: 과거 기록, 성향 테스트 결과

### 투자 원칙 미설정 시
- CHK 진입 막지 않음
- AI가 원칙 없이 일반 심리 질문으로 코칭
- CHK-03 결론 카드 하단에 한 줄 노출:
  "투자 원칙을 설정하면 다음엔 더 정확한 코칭을 받을 수 있어요 →"

## 화면 구조

### 온보딩 (최초 1회)
| ID | 화면 | 설명 |
|----|------|------|
| SPL-01 | 스플래시 | 앱 로딩 |
| ONB-01 | 로그인 | 구글/애플 소셜 로그인 |
| ONB-02 | 성향 테스트 | 투자 성향 파악 질문 |
| ONB-03 | 성향 결과 | 내 투자 성향 요약 + 시작 CTA |

### 핵심 플로우 — 충동 체크
| ID | 화면 | 설명 |
|----|------|------|
| CHK-01 | 충동 체크 시작 | 종목명, 방향(매수/매도), 감정 상태 입력 |
| CHK-02 | AI 코칭 대화 | 심리 코치 AI와 1:1 대화. 질문 3개 |
| CHK-03 | 판단 결과 | 결론 카드 + 충동도 점수 + 근거 한 줄 + 기록 저장 |

### 홈
| ID | 화면 | 설명 |
|----|------|------|
| HOME-01 | 홈 | "지금 매매하고 싶어?" CTA 그라디언트 카드 중앙. 오늘 감정 체크인. 최근 코칭 요약 카드 1~2개 |

### 부수 기능
| ID | 화면 | 설명 |
|----|------|------|
| REC-01 | 매매 기록 목록 | 과거 충동 체크 + 매매 기록 리스트. 3탭 필터 (전체/조언따름/그대로매매) |
| REC-02 | 매매 기록 상세 | 당시 AI 코칭 내용 + 결과 기록 |
| REC-03 | 매매 기록 남기기 | 이미 매매한 경우 사후 기록 |
| REP-01 | AI 리포트 | 성장 추이, 매매 패턴, AI 심화 분석, 심화 인사이트, 시장 맥락 |
| MGT-01 | 마이페이지 | 프로필 카드(→성향 프로필), 투자 원칙 설정, 알림/계정 설정(모달), 로그아웃 |
| MGT-01-P | 투자 성향 프로필 | MainStack의 `PersonalityProfile` 화면. 마이 > 프로필 카드 탭 |

### 하단 탭
홈 | 기록 | 리포트 | 마이

## 기술 스택

### 프레임워크
- **React Native + Expo** (TypeScript)
- iOS + Android 동시 지원

### 주요 라이브러리
| 역할 | 라이브러리 |
|------|-----------|
| 내비게이션 | `@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` |
| 상태 관리 | Zustand (`useRecordStore`, `useUserStore`) — principles는 `useUserStore` 내부 필드 |
| 백엔드/인증 | 자체 EC2 서버 (`oreumdal.co.kr`) — Supabase 아님. 아래 "실제 백엔드 아키텍처" 참고 |
| 그라디언트 | `expo-linear-gradient` |
| SVG 아이콘 | `react-native-svg` (커스텀 컴포넌트, 외부 아이콘 라이브러리 미사용) |
| 폰트 | `expo-font` — Spoqa Han Sans Neo (`SpoqaHanSansNeo-Regular/Medium/Bold`) |
| AI | OpenAI API (`EXPO_PUBLIC_OPENAI_API_KEY`) — preview/production 빌드 실사용 |

### 실제 백엔드 아키텍처 (2026-08 코드 확인 기준)
- **로그인/인증**: `src/screens/onboarding/SignUpScreen.tsx`의 `API_BASE = 'https://oreumdal.co.kr'`가 Google/Apple/Kakao OAuth를 처리하고 accessToken/refreshToken을 발급. 서버는 AWS EC2 인스턴스 1대(+ 그 앞의 ALB) 위에서 nginx로 서빙됨. 이 EC2가 유일한 자체 백엔드.
- **Supabase는 미사용**: `src/lib/supabase.ts`에 클라이언트 초기화 코드가 있고 `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` 환경변수도 정의돼 있지만, **앱 어디에서도 import되어 실제로 호출되지 않음** (grep 결과 `src/lib/supabase.ts` 자체 외 참조 0건). 초기 계획 단계의 잔재로 추정되며, 신규 기능에서 Supabase를 백엔드로 가정하고 코드를 짜면 안 됨.
- **사용자 데이터는 서버에 동기화되지 않음**: 매매 기록(`useRecordStore`), 투자 원칙/성향 테스트 결과(`useUserStore`)는 전부 `AsyncStorage`(기기 로컬)에만 저장됨. 서버로 POST하는 코드가 없어서, 로그인 상태여도 기기를 바꾸거나 앱을 재설치하면 기록이 사라짐. 향후 클라우드 동기화가 필요하면 이 EC2 서버에 엔드포인트를 추가하거나 Supabase를 실제로 연결해야 함 (지금은 둘 다 아님).
- **AI 코칭**: `src/lib/ai/openaiProvider.ts`, `claudeProvider.ts` — 클라이언트에서 OpenAI/Claude API 직접 호출. 자체 서버 경유 없음.
- **시장 맥락(공포탐욕지수)**: `src/lib/ai/marketContext.ts`, `ReportScreen.tsx` — CNN 퍼블릭 API(`production.dataviz.cnn.io`)를 클라이언트에서 직접 호출.

### 환경 변수
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` — 정의는 돼 있으나 위 이유로 **현재 미사용**
- `EXPO_PUBLIC_OPENAI_API_KEY` — EAS 대시보드에서 관리 (Sensitive visibility)
- `EXPO_PUBLIC_AI_PROVIDER` — `eas.json` preview/production에 `"openai"` 하드코딩
- `.env` 파일은 gitignore됨. `.env.example`을 참조해 로컬 설정
- EAS 환경 변수 수정은 expo.dev 웹 대시보드 사용 (CLI `eas env:*` 명령어 불안정)

## 디자인 방향

### 컨셉
- 토스처럼 깔끔하고 세련된 화이트 베이스
- 인디고 포인트로 신뢰감 + 세련미
- 버튼은 누를 때 살짝 꺼지는 느낌 필수 (`ScaleButton` 컴포넌트: scale 0.97, 100ms)
- 이모지 전면 금지

### 컬러 팔레트 (`app/src/constants/colors.ts`)
| 용도 | 토큰 | 값 |
|------|------|----|
| 배경 | `Colors.background` | `#FFFFFF` |
| 서피스/카드 | `Colors.surface` | `#FAFAFA` (zinc-50) |
| 서피스 강조 | `Colors.surfaceElevated` | `#F4F4F5` (zinc-100) |
| 보더 | `Colors.border` | `#E4E4E7` (zinc-200) |
| CTA / 포인트 | `Colors.cta` | `#6366F1` (indigo-500) |
| CTA 딥 | `Colors.ctaDeep` | `#4F46E5` (indigo-600) |
| CTA 라이트 배경 | `Colors.ctaLight` | `#EEF2FF` (indigo-50) |
| CTA 보더 | `Colors.ctaBorder` | `#C7D2FE` (indigo-200) |
| 그라디언트 시작 | `Colors.gradientStart` | `#6366F1` |
| 그라디언트 끝 | `Colors.gradientEnd` | `#7C3AED` (purple-700) |
| 주 텍스트 | `Colors.textPrimary` | `#18181B` (zinc-900) |
| 보조 텍스트 | `Colors.textSecondary` | `#71717A` (zinc-500) |
| 뮤트 텍스트 | `Colors.textMuted` | `#A1A1AA` (zinc-400) |
| 충동도/경고 | `Colors.impulse` | `#B45309` (amber-700) |
| 충동도 배경 | `Colors.impulseBg` | `#FEF3C7` (amber-100) |
| 괜찮음 | `Colors.ok` | `#047857` (emerald-700) |
| 괜찮음 배경 | `Colors.okBg` | `#D1FAE5` (emerald-100) |
| 매수 | `Colors.buy` | `#E11D48` (rose-600) |
| 매수 배경 | `Colors.buyBg` | `#FFE4E6` (rose-100) |
| 매도 | `Colors.sell` | `#0284C7` (sky-600) |
| 매도 배경 | `Colors.sellBg` | `#E0F2FE` (sky-100) |

### 인터랙션
- 모든 탭/버튼: `ScaleButton` 컴포넌트 사용 (scale 0.97, 100ms, `activeOpacity` 대신)
- 트랜지션: 100ms ease

### 컴포넌트 규칙
- `border-radius`: 버튼 12–16px / 카드 16–20px / 그라디언트 히어로 24–28px
- 보더: `0.5px solid Colors.border`
- CTA 버튼: `Colors.cta` bg + white text
- 세컨더리 버튼: `Colors.surfaceElevated` bg + `Colors.textPrimary` text
- 그라디언트 카드: `expo-linear-gradient` (`gradientStart → gradientMid → gradientEnd`)
- 아이콘: `app/src/components/common/Icons.tsx` 커스텀 SVG (lucide 등 외부 라이브러리 사용 금지)

## 개발 규칙

### 수정 시 신중히
- `useRecordStore` — 비즈니스 로직 스토어. UI 변경으로 건드리지 않음
- `useUserStore` — 마찬가지. 단, 버그 수정(e.g. logout 시 필드 누락)은 허용. 수정 시 `logout()`, `loadFromStorage()` 양쪽 모두 확인
- `lib/reportUtils.ts` 내 계산 로직 — UI 변경 시에도 함부로 수정하지 않음

### 내비게이션
- `MainStackParamList` 타입 기준으로 navigate 호출
- `SignUp` 화면은 반드시 `{ trigger: 'chk' | 'save' | 'report' }` 파라미터 필요
- 크로스 스택(Main ↔ Onboarding) 이동은 `(navigation as any).navigate(...)` 패턴 사용
  - Main → Onboarding: `(navigation as any).navigate('Onboarding', { screen: 'PersonalityTest', params: { fromRedo: true } })`
  - Onboarding → Main 복귀: `(navigation as any).navigate('Main')`

### 비로그인 처리 패턴
- **HomeScreen**: 최근 코칭 섹션 `{isLoggedIn && ...}`으로 조건 렌더링 + 상단 `GuestDataBanner` 표시
- **ReportScreen**: 상단 `GuestDataBanner` 표시. SignUpBottomSheet `onClose`에서 `navigate('Tabs', { screen: 'Home' })` — 닫으면 홈으로 이동
- **MyPageScreen**: hooks 이후 `if (!isLoggedIn) return <로그인 필요 화면>` early return
- **각 액션 버튼**: `isLoggedIn ? 기능실행 : navigate('SignUp', { trigger })` 패턴
- **GuestDataBanner 디자인**: `backgroundColor: '#FFFBEB'`, `borderColor: '#FCD34D'` amber 배너. HomeScreen/ReportScreen 인라인 정의 (공유 컴포넌트 아님)

### 알림 설정 접근
- 홈 벨 버튼 → HomeScreen 내 Modal 직접 표시 (탭 이동 없음)
- 마이페이지 내 "알림 설정" 메뉴 → MyPageScreen 내 Modal
- 두 곳이 독립적으로 동일한 UI를 렌더링 (공유 컴포넌트 아님)

### AI 리포트 섹션 구성
| 섹션 | 컴포넌트 | 잠금 조건 |
|------|---------|-----------|
| 성장 추이 | `GrowthSummaryCard`, `ImpulseGraph` | 코칭 5회 미만 |
| 매매 패턴 | `OutcomeComparisonCard`, `EmotionPatternCard` | 코칭 10회 미만 |
| AI 심화 분석 | `InsightCard` × 4 | 각각 5/5/3/10회 기준 |
| 심화 인사이트 | `Heatmap7Day`, `TickerTrendCard` | 7회 미만 / 취약 종목 없으면 숨김 |
| 시장 맥락 | `FearGreedCard` | 항상 표시 (외부 API) |

### 앱 아이콘 파일 규칙
- `app/assets/oremdal-icon-tile.png` → `app.json` `expo.icon` (iOS 앱 아이콘, 불투명 배경 필수)
- `app/assets/oremdal-icon.png` → Android Adaptive Icon `foregroundImage` (배경 없는 투명 PNG)
- iOS는 반드시 불투명 아이콘 사용. 투명 PNG 제출 시 App Store 심사 거절됨

### 탭바 (MainNavigator.tsx)
- `tabBarStyle`: `paddingBottom: 28`, `height: 82` — 하단 홈 인디케이터 여백 확보용

### 이용약관/개인정보처리방침 모달
- SignUpScreen 내에 `LegalDocModal` 컴포넌트가 인라인 정의됨
- RN `Modal` + `ScrollView` 구조. 약관 전문(`DOC_CONTENT`)도 같은 파일에 상수로 포함
- 외부 웹뷰 없음. 앱 내 바텀시트 형태

### 보안 주의
- `EXPO_PUBLIC_` prefix가 붙은 키는 클라이언트 번들에 포함됨
- AI API 키(`ANTHROPIC_API_KEY`)는 `EXPO_PUBLIC_` 없이 유지 — 현재는 직접 호출 중이나 향후 서버 프록시 전환 필요

## 백엔드 인프라 (AWS — `oreumdal.co.kr`)

이 저장소(RN 앱)에는 백엔드 소스가 없음. `oreumdal.co.kr`은 별도 AWS 인프라에서 운영되며, 로그인(OAuth)을 처리하는 **유일한 자체 백엔드**임 (위 "실제 백엔드 아키텍처" 참고). 2026-08-06 장애 복구 중 확인/재구성된 구조:

```
사용자 → Route 53 (oreumdal.co.kr, pwa.oreumdal.co.kr)
       → ALB "oreumdal-alb" (HTTPS:443, ACM 인증서 종료) — HTTP:80은 443으로 리다이렉트
       → 타겟 그룹 "ore-tg" (HTTP:80)
       → EC2 인스턴스 1대 (`i-04aa29cb64ab22e0d`, 이름 "oleumdal", ap-northeast-2c)
           - nginx가 80번에서 대기: 정적 웹앱(oleumdal-web) 서빙 + /api/auth/* 프록시
           - PostgreSQL로 추정되는 DB도 같은 인스턴스에 존재 (5432 포트가 SG에 열려있음)
```

- VPC: `vpc-0c3728b92882a63d6` (default VPC, ap-northeast-2 전체 4개 AZ 서브넷 존재)
- 보안 그룹: `launch-wizard-1` (`sg-0482ae7f1a2f9567a`) — EC2와 ALB가 공유. 인바운드: 22(SSH), 80(HTTP), 443(HTTPS), 5432(PostgreSQL), 8000, 8001 — **전부 0.0.0.0/0으로 열려있음**
- ACM 인증서: `oreumdal.co.kr`(`682bbb36-...`), `*.oreumdal.co.kr`(`da29953f-...`) — 둘 다 서울 리전, 발급됨 상태

### ⚠️ 절대 지우면 안 되는 리소스
- **ALB `oreumdal-alb`** — 삭제 시 EC2가 살아있어도 HTTPS 종료 지점이 사라져서 즉시 전체 로그인 장애 발생 (2026-08-06 실제 발생한 장애). EC2만 봐서는 "안 쓰는 것 같다"고 착각하기 쉬우니 주의.
- ACM 인증서, 타겟 그룹 `ore-tg`, Route 53 A 레코드(`oreumdal.co.kr`, `pwa.oreumdal.co.kr`)

### 알려진 보안 이슈 (미해결)
- PostgreSQL(5432)이 보안 그룹에서 전 세계(0.0.0.0/0)에 열려있음. EC2 자체 프로세스가 DB에 붙는 거라면 SG 규칙 자체가 필요 없을 가능성이 높음(로컬 연결은 SG를 안 거침) — 소스를 "내 IP" 또는 특정 관리자 IP로 제한하거나 규칙을 아예 제거하는 게 안전함.

## 배포 (EAS)

### Apple 계정 정보
- Apple ID: crewwasang02@gmail.com
- Team: GIUNG LEE (5C3374X8ZW)
- Bundle ID: com.oremdal.app
- App Store Connect App ID: 6763870794

### 빌드 설정
- `eas.json`의 `appVersionSource: "remote"`, `autoIncrement: "buildNumber"` — 빌드 번호 자동 증가
- **버전 문자열 (`version`)은 수동 관리** — `app/app.json`의 `expo.version`을 직접 수정

### EAS 빌드 & 제출 명령어
```bash
cd app

# 1. iOS TestFlight 빌드 (production 프로파일)
eas build --platform ios --profile production

# 2. App Store Connect 제출 (가장 최근 빌드 자동 선택)
eas submit --platform ios --latest
```

### 배포 플로우
1. `app.json`의 `version` 수동 업데이트 → 커밋
2. `eas build --platform ios --profile production` 실행 → EAS 클라우드에서 빌드 (10~15분 소요)
3. 빌드 완료 후 `eas submit --platform ios --latest` — TestFlight 업로드
4. App Store Connect(appstoreconnect.apple.com) 에서 TestFlight 빌드 확인 후 외부 테스터 배포

### 주의사항
- EAS 환경 변수 수정은 **expo.dev 웹 대시보드만** 사용 (`eas env:*` CLI 불안정)
- `EXPO_PUBLIC_OPENAI_API_KEY`는 EAS 대시보드에서 Sensitive visibility로 관리
- 빌드 중 터미널 닫아도 무방 — EAS 클라우드에서 계속 진행됨
