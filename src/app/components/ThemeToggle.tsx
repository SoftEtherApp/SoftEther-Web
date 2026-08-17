import { useEffect, useState } from "react";
import Icon from "./Icon";
import "./ThemeToggle.css";

export default function ThemeToggle() {
    const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");

    useEffect(() => {
        document.documentElement.classList.toggle("light", !dark);
    }, [dark]);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    return (
        <button
            className="theme-btn"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
        >
            <Icon name={dark ? "moon" : "sun"} size={18} />
        </button>
    );
}