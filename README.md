# PawPawFind Frontend

정적 파일 또는 React/Vite 빌드 결과를 S3에 배포한다.

## GitHub Actions Secrets

| Secret                  | 설명                     |
| ----------------------- | ------------------------ |
| `AWS_ACCESS_KEY_ID`     | S3 업로드용 IAM          |
| `AWS_SECRET_ACCESS_KEY` |                          |
| `AWS_REGION`            | 예: `ap-southeast-2`     |
| `FRONTEND_S3_BUCKET`    | 예: `pawpawfind-dev-web` |

`develop` / `main` push 시 `.github/workflows/deploy-frontend.yml` 실행.

자세한 org 배포 구조: [PawPawFind-Backend/deploy/GITHUB_ACTIONS.md](https://github.com/PawPawFind/PawPawFind-Backend/blob/feat/backend-init/deploy/GITHUB_ACTIONS.md)
