import { AlignLeft } from "lucide-react";
import { Button } from "../ui/button";
import Lang from "./lang";
import Theme from "./theme";

export default function Header() {
  return (
    <header className="overflow-hidden py-4 px-4 lg:px-10 bg-background/30 max-lg:shadow flex gap-2">
      <Button variant="ghost" size="icon" className="lg:hidden" asChild>
        <label htmlFor="sidebar">
          <AlignLeft className="h-4 w-4" />
        </label>
      </Button>
      <div className="flex-1"></div>
      <Lang />
      <Theme />
    </header>
  );
}
