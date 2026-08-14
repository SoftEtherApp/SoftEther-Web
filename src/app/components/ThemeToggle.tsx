import { useEffect, useState } from "react";
import Icon from "./Icon";
import "./ThemeToggle.css";

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "light") {
            setDark(false);
            document.documentElement.classList.add("light");
        }
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("light", !next);
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