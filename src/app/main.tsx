import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@devstroop/react-ui/style.css";
import "./index.css";
import App from "./App.tsx";
import AuthProvider from "./auth/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
);
