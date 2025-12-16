import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type WelcomeCardProps = {
  name?: string;
};

import loginIllustration from "../../../../../assets/hello.svg";

export default function WelcomeCard({
  name = "Andrew",
}: WelcomeCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="relative h-full overflow-hidden flex">
      <CardContent className="flex flex-1 items-center justify-between gap-6 p-6">
        <div className="max-w-xl space-y-3">
          <h2 className="text-2xl font-semibold">
            Hi, {name} 👋
          </h2>

          <p className="text-base text-muted-foreground">
            What do you want to learn today?
          </p>

          <p className="text-sm text-muted-foreground">
            Discover courses, track progress, and achieve your learning goals seamlessly.
          </p>

          <Button
            className="mt-2"
            onClick={() => navigate("/explore")}
          >
            Explore Course
          </Button>
        </div>

        <div className="hidden md:flex items-center">
          <img
            src={loginIllustration}
            alt="Welcome illustration"
            className="h-80 w-100 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
