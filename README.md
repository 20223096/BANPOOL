# BANPOOL (금지어 수영장 파티)

Next.js + Socket.IO 실시간 파티 게임 MVP.

## 설치 & 실행

```bash
cd street_food
npm install
npm run dev
```

- 웹: http://localhost:3000  
- API: http://localhost:4000 (`GET /health`)

`web/.env.example` → `web/.env.local` (소켓 URL 변경 시)

## 테스트

브라우저 탭을 두 개 열고 서로 다른 닉네임으로 같은 방 코드에 입장하세요.

## GitHub에 올리기

이 저장소는 이미 로컬에서 `git init`과 첫 커밋이 되어 있습니다. GitHub에서 **빈 저장소**를 만든 뒤(README 추가하지 않음) 아래를 실행하세요.

```bash
cd street_food
git remote add origin https://github.com/<본인아이디>/<저장소이름>.git
git branch -M main
git push -u origin main
```

SSH를 쓰는 경우 `origin` URL을 `git@github.com:<본인아이디>/<저장소이름>.git` 형태로 바꿉니다.

## 배포할 때 참고

친구들이 접속하려면 **프론트(Next.js)**와 **소켓 서버(Node)**를 각각 인터넷에 노출해야 합니다.

1. **백엔드** (예: [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io))  
   - **반드시 `server` 폴더만** 실행하세요. 저장소 루트에서 `npm start`를 쓰면 웹+API가 동시에 떠서 `PORT`가 충돌하고, 공개 URL에는 소켓 서버가 안 붙을 수 있습니다.  
   - Railway: **Settings → Root Directory** = `server`, Build = `npm ci && npm run build`, Start = `npm start` (`server/railway.toml` 참고). GitHub 저장소를 연결해 자동 배포합니다.  
   - 환경 변수: `PORT`(플랫폼이 주는 경우 생략), **`CLIENT_ORIGIN`** = 배포된 웹 URL (예: `https://xxx.vercel.app`)

**배포 확인:** 브라우저에서 `https://<백엔드>/health` 가 JSON `{"ok":true,"name":"BANPOOL"}` 이면 정상입니다. 텍스트 `OK`만 나오거나 Railway 아스키 아트 홈이 보이면 **아직 이 저장소의 API가 그 URL에서 실행 중이 아닙니다** — Railway에 `server` 루트로 다시 연결하세요. 이때 콘솔에 `Access-Control-Allow-Origin: https://railway.com` 과 `/socket.io/` 404가 함께 뜨는 경우가 많습니다.

2. **프론트** (예: [Vercel](https://vercel.com))  
   - 프로젝트 루트에서 `web`을 루트 디렉터리로 지정하거나, 모노레포 설정으로 `web`만 빌드  
   - 환경 변수: **`NEXT_PUBLIC_SOCKET_URL`** = 백엔드 공개 URL (예: `https://your-api.railway.app`)

로컬과 달리 `localhost`는 다른 사람에게 보이지 않으므로, 위 두 URL을 꼭 맞춰 주세요.
