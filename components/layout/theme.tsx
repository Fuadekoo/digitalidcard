"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export default function Theme() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="border border-amber-700 bg-amber-500/10 hover:bg-amber-500/20"
      >
        {theme === "light" ? (
          <Moon className="h-6 w-6 stroke-amber-700 fill-amber-700" />
        ) : (
          <Sun className="h-6 w-6 stroke-amber-700 fill-amber-700" />
        )}
      </Button>
    </div>
  );
}
