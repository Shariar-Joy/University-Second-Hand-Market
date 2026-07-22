import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)




// cd C:\Users\USER\dynamodb-local
// java -jar DynamoDBLocal.jar -port 8001 -dbPath .




// cd backend
// .venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8080




// cd frontend/uni_marketplace
// npm run dev
