import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
// import { SunIcon } from '@heroicons/react/24/outline';
// import { MoonIcon } from '@heroicons/react/24/solid';
import { IoMoonSharp, IoSunnySharp } from "react-icons/io5";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const {systemTheme, theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

    const renderThemeChanger = () => {
        if (!mounted) return null;

        const currentTheme = theme === "system" ? systemTheme : theme;

        if (currentTheme === "dark") {
            return (
                <IoSunnySharp
                    className="w-6 h-6 text-dark-tremor-content"
                    role="button"
                    onClick={() => setTheme("light")}
                />
            );
        } else {
            return (
                <IoMoonSharp
                    className="w-6 h-6 text-dark-tremor-content"
                    role="button"
                    onClick={() => setTheme("dark")}
                />
            );
        }
    };

    return <>{renderThemeChanger()}</>;
};

export default ThemeSwitcher;
